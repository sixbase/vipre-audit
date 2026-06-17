import os, glob, json
from PIL import Image

SRC="/Users/alvinthong/Downloads/Vipre Design Current State"
APP="/Users/alvinthong/new wonder/vipre-audit"
screens={s['orig']:s for s in json.load(open(f"{APP}/data/screens.json"))}

manifest=[]
n=0; skipped=0
for cf in sorted(glob.glob(f"{APP}/data/crops/*.json")):
    d=json.load(open(cf))
    for i,c in enumerate(d.get('crops',[])):
        orig=c['file']
        if orig not in screens:
            # tolerate the (1) duplicate filenames mapping to base
            base=orig.replace(' (1)','')
            if base in screens: orig=base
            else: skipped+=1; continue
        meta=screens[orig]
        x,y,w,h=c['box']
        x=max(0.0,min(1.0,x)); y=max(0.0,min(1.0,y))
        w=max(0.01,min(1.0-x,w)); h=max(0.01,min(1.0-y,h))
        try:
            im=Image.open(os.path.join(SRC,orig)).convert('RGB')
        except FileNotFoundError:
            skipped+=1; continue
        W,H=im.size
        L,T,R,B=int(x*W),int(y*H),int((x+w)*W),int((y+h)*H)
        if R-L<6 or B-T<6: skipped+=1; continue
        crop=im.crop((L,T,R,B))
        # upscale tiny crops for legibility, cap display width
        cw,ch=crop.size
        if cw<160 and cw>0:
            scale=min(3.0,160/cw); crop=crop.resize((int(cw*scale),int(ch*scale)))
        if crop.size[0]>900:
            crop.thumbnail((900,900))
        cid=f"{meta['slug']}__{c['component_type']}__{i}"
        crop.save(f"{APP}/public/crops/{cid}.jpg",quality=85)
        manifest.append({"id":cid,"type":c['component_type'],"label":c.get('variant_label',''),
                         "product":meta['product'],"screen_slug":meta['slug'],
                         "aspect":round(crop.size[0]/crop.size[1],3)})
        n+=1
json.dump(manifest,open(f"{APP}/data/crops.json","w"),indent=2)
# summary by type
from collections import Counter
ct=Counter(m['type'] for m in manifest)
print(f"cropped {n} components, skipped {skipped}")
for t,c in ct.most_common(): print(f"  {t:<22}{c}")
