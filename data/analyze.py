import json, glob, re, os
from collections import defaultdict

files = sorted(glob.glob('raw/*.json'))
merged = {"products": [], "screens": [], "observations": []}
for f in files:
    d = json.load(open(f))
    prod = d.get('product','?')
    for s in d.get('screens',[]):
        s['product']=prod; merged['screens'].append(s)
    for o in d.get('observations',[]):
        o['product']=prod; merged['observations'].append(o)
    merged['products'].append({"product":prod,"tokens":d.get('tokens',{})})

def norm_hex(c):
    if not isinstance(c,str): return None
    m=re.search(r'#([0-9a-fA-F]{3,6})', c)
    if not m: return None
    h=m.group(1).lower()
    if len(h)==3: h=''.join(ch*2 for ch in h)
    return '#'+h

# ---- variant counts per component_type ----
type_variants=defaultdict(set)
type_variants_by_prod=defaultdict(lambda: defaultdict(set))
type_count=defaultdict(int)
for o in merged['observations']:
    t=o.get('component_type','?'); vk=(o.get('variant_key') or '').strip().lower()
    type_count[t]+=1
    if vk: type_variants[t].add(vk); type_variants_by_prod[t][o['product']].add(vk)

print("="*70)
print("VARIANT COUNT PER COMPONENT TYPE (distinct variant_key)")
print("="*70)
rows=[]
for t in sorted(type_variants, key=lambda x:-len(type_variants[x])):
    nprod=len(type_variants_by_prod[t])
    rows.append((t,len(type_variants[t]),type_count[t],nprod))
print(f"{'component_type':<22}{'variants':>9}{'instances':>11}{'products':>10}")
for t,v,c,p in rows:
    print(f"{t:<22}{v:>9}{c:>11}{p:>10}")

# ---- token divergence ----
all_colors=set(); accent=set(); fonts=set(); radii=set(); headsizes=set()
for p in merged['products']:
    tk=p['tokens']
    for c in tk.get('colors',[]):
        n=norm_hex(c);
        if n: all_colors.add(n)
    for c in tk.get('accent_primary',[]):
        n=norm_hex(c)
        if n: accent.add(n)
    fg=tk.get('font_family_guess')
    if fg: fonts.add(fg.strip())
    for r in tk.get('radii_px_guess',[]): radii.add(r)
    for h in tk.get('heading_sizes_px_guess',[]): headsizes.add(h)
# also pull accent-ish blues from button observations
btn_blues=set()
for o in merged['observations']:
    if o.get('component_type')=='button':
        a=o.get('attributes',{})
        n=norm_hex(a.get('color',''))
        role=str(a.get('role','')).lower()
        if n and 'primary' in role: btn_blues.add(n)

print("\n"+"="*70)
print("TOKEN DIVERGENCE")
print("="*70)
print(f"distinct colors observed (whole portal): {len(all_colors)}")
print(f"distinct declared accent/primary colors: {len(accent)}  -> {sorted(accent)}")
print(f"distinct primary-button fills:           {len(btn_blues)} -> {sorted(btn_blues)}")
print(f"distinct font-family guesses:            {len(fonts)} -> {sorted(fonts)}")
print(f"distinct corner radii (px guesses):      {sorted(radii)}")
print(f"distinct heading sizes (px guesses):     {sorted(headsizes)}")

# screens per product
prodscreens=defaultdict(int)
for s in merged['screens']: prodscreens[s['product']]+=1
print("\nscreens per product:", dict(prodscreens), " total=", len(merged['screens']))
print("total observations:", len(merged['observations']))

json.dump(merged, open('catalog.json','w'), indent=2)
print("\nwrote catalog.json")
