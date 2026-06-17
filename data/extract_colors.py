import os, glob, json, re
import numpy as np
from PIL import Image

SRC = "/Users/alvinthong/Downloads/Vipre Design Current State"
files = sorted(glob.glob(os.path.join(SRC, "*.png")))

def product_of(fn):
    b=os.path.basename(fn)
    if 'edr-esm' in b: return 'EDR/ESM'
    if '-ies-' in b: return 'IES'
    if 'safesend' in b: return 'SafeSend'
    return 'Portal/Admin'

def rgb2lab(rgb):
    # rgb: Nx3 0-255
    arr = rgb.astype(np.float64)/255.0
    m = arr>0.04045
    arr[m]=((arr[m]+0.055)/1.055)**2.4
    arr[~m]=arr[~m]/12.92
    arr*=100.0
    R,G,B=arr[:,0],arr[:,1],arr[:,2]
    X=R*0.4124+G*0.3576+B*0.1805
    Y=R*0.2126+G*0.7152+B*0.0722
    Z=R*0.0193+G*0.1192+B*0.9505
    X/=95.047; Y/=100.0; Z/=108.883
    def f(t):
        t=t.copy(); m=t>0.008856
        t[m]=t[m]**(1/3); t[~m]=7.787*t[~m]+16/116; return t
    fx,fy,fz=f(X),f(Y),f(Z)
    L=116*fy-16; a=500*(fx-fy); bb=200*(fy-fz)
    return np.stack([L,a,bb],axis=1)

def hex_of(rgb): return '#%02x%02x%02x'%(int(rgb[0]),int(rgb[1]),int(rgb[2]))

swatches=[]  # (product, file, rgb(3), weight)
for fn in files:
    im=Image.open(fn).convert('RGB')
    im.thumbnail((220,5000))
    a=np.asarray(im).reshape(-1,3).astype(np.float64)
    r,g,b=a[:,0],a[:,1],a[:,2]
    mx=a.max(1); mn=a.min(1); v=mx/255.0
    s=np.where(mx>0,(mx-mn)/np.maximum(mx,1),0)
    chroma = (s>0.22)&(v>0.18)&(v<0.97)
    c=a[chroma]
    if len(c)<30: continue
    # quantize to 24-step grid, count
    q=(c//22*22+11).astype(int)
    keys,counts=np.unique(q,axis=0,return_counts=True)
    tot=counts.sum()
    order=np.argsort(-counts)
    for idx in order:
        w=counts[idx]/tot
        if w<0.04: break
        swatches.append((product_of(fn), os.path.basename(fn), keys[idx].astype(float), float(w)))

# global greedy clustering in LAB, deltaE76 threshold
rgbs=np.array([sw[2] for sw in swatches])
labs=rgb2lab(rgbs)
THRESH=12.0
clusters=[]  # each: {lab, members:[idx]}
for i,lab in enumerate(labs):
    placed=False
    for cl in clusters:
        if np.linalg.norm(cl['lab']-lab)<THRESH:
            cl['members'].append(i)
            # update centroid weighted
            cl['lab']=(cl['lab']*cl['w']+lab*swatches[i][3])/(cl['w']+swatches[i][3])
            cl['w']+=swatches[i][3]
            placed=True; break
    if not placed:
        clusters.append({'lab':lab.copy(),'members':[i],'w':swatches[i][3]})

def hue_of(rgb):
    r,g,b=rgb/255.0
    mx=max(r,g,b); mn=min(r,g,b); d=mx-mn
    if d==0: return None
    if mx==r: h=((g-b)/d)%6
    elif mx==g: h=((b-r)/d)+2
    else: h=((r-g)/d)+4
    return h*60

out=[]
for cl in clusters:
    mem=cl['members']
    # representative = highest-weight member rgb
    rep=max(mem,key=lambda j:swatches[j][3])
    rgb=rgbs[rep]
    prods=sorted(set(swatches[j][0] for j in mem))
    files_=sorted(set(swatches[j][1] for j in mem))
    out.append({'hex':hex_of(rgb),'rgb':[int(x) for x in rgb],'weight':round(cl['w'],2),
                'hue':round(hue_of(rgb),0) if hue_of(rgb) is not None else None,
                'n_products':len(prods),'products':prods,'n_screens':len(files_)})
out.sort(key=lambda x:-x['weight'])

# count blue clusters (hue 195-255) with meaningful presence
blues=[c for c in out if c['hue'] is not None and 195<=c['hue']<=255 and c['weight']>=0.3]
greens=[c for c in out if c['hue'] is not None and 95<=c['hue']<=165 and c['weight']>=0.2]

print(f"total accent swatches extracted: {len(swatches)}")
print(f"distinct accent-color clusters (deltaE<{THRESH}): {len(out)}")
print(f"  -> clusters with weight>=0.5: {sum(1 for c in out if c['weight']>=0.5)}")
print(f"distinct BLUE clusters (hue 195-255, weight>=0.3): {len(blues)}")
for c in blues[:14]:
    print(f"   {c['hex']}  hue={c['hue']:>3}  w={c['weight']:>5}  {c['n_products']} products  {c['products']}")
print(f"distinct GREEN/status clusters (hue 95-165, w>=0.2): {len(greens)}")
for c in greens[:10]:
    print(f"   {c['hex']}  hue={c['hue']:>3}  w={c['weight']:>5}  {c['products']}")

json.dump({'threshold':THRESH,'clusters':out,'blues':blues,'greens':greens},
          open('data/colors.json','w'),indent=2)
print("\nwrote data/colors.json")
