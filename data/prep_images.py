import os, glob, json, re
from PIL import Image

SRC="/Users/alvinthong/Downloads/Vipre Design Current State"
APP="/Users/alvinthong/new wonder/vipre-audit"
files=sorted(glob.glob(os.path.join(SRC,"*.png")))

def product_of(b):
    if 'edr-esm' in b: return 'EDR/ESM'
    if '-ies-' in b: return 'IES'
    if 'safesend' in b: return 'SafeSend'
    return 'Portal/Admin'

def slug_of(b):
    s=b.replace('screencapture-ices-dev-portal-electric-net-','')
    s=re.sub(r'-2026-06-17-\d\d_\d\d_\d\d','',s)
    s=s.replace('.png','').replace(' ','').replace('(','-').replace(')','')
    return s

manifest=[]
seen={}
for fn in files:
    b=os.path.basename(fn)
    slug=slug_of(b)
    seen[slug]=seen.get(slug,0)+1
    if seen[slug]>1: slug=f"{slug}-{seen[slug]}"
    im=Image.open(fn).convert('RGB')
    W,H=im.size
    # full display (cap width 1400)
    full=im.copy(); full.thumbnail((1400,20000)); full.save(f"{APP}/public/shots/{slug}.jpg",quality=82)
    th=im.copy(); th.thumbnail((560,8000)); th.save(f"{APP}/public/thumbs/{slug}.jpg",quality=78)
    manifest.append({"orig":b,"slug":slug,"product":product_of(b),
                     "module":slug, "w":W,"h":H})
json.dump(manifest,open(f"{APP}/data/screens.json","w"),indent=2)
print(f"prepped {len(manifest)} screenshots -> public/shots + public/thumbs")
print("sample:", manifest[5]['slug'], manifest[20]['slug'])
