"""Apply hash-checked, precomputed post-war India regional deltas (stdlib only)."""
import copy, hashlib, json, pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
def read(p): return json.loads(p.read_text())
def write(p,d): p.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n')
def digest(d): return hashlib.sha256(json.dumps(d,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def apply_postwar_india(root=ROOT):
    atlas=root/'public/atlas'; patch=read(root/'data/empires/boundaries/india-postwar.json'); catalogue=read(atlas/'catalogue.json')
    patch_hash=hashlib.sha256((root/'data/empires/boundaries/india-postwar.json').read_bytes()).hexdigest()
    if catalogue.get('postwarIndiaPatch')==patch_hash: return
    bases={p['baseYear']:read(atlas/'maps'/f"{p['baseYear']}.json") for p in patch['snapshots'].values()}
    for p in patch['snapshots'].values():
        if digest(bases[p['baseYear']])!=p['inputSha256']: raise ValueError(f"Post-war boundary input changed: {p['baseYear']}. Rebuild and review the regional deltas.")
    snapshot_index={s['year']:s for s in catalogue['snapshots'] if not s.get('modern')}
    policy=read(root/'data/empires/boundaries/india-government.json')['metadata']
    for y,p in patch['snapshots'].items():
        year=int(y); base=copy.deepcopy(bases[p['baseYear']]); features=[]
        for f in base['features']:
            key=f['properties']['key']
            if key in p['omit']: continue
            if key in p['replace']: f['geometry']=p['replace'][key]; f['properties']['boundaryPolicy']='india-government'
            features.append(f)
        base.update(year=year,features=features+p['add'],regionalUpdate={'region':'India and neighbouring South Asia','year':year,'worldSourceYear':p['baseYear'],'provenance':'/atlas/india-postwar-provenance.json'})
        write(atlas/'maps'/f'{year}.json',base)
        s=copy.deepcopy(snapshot_index[p['baseYear']]); s.update(year=year,file=f'{year}.json',count=len(base['features']),worldSourceYear=p['baseYear'],regionalUpdate='India and neighbouring South Asia',boundaryPolicy={k:policy[k] for k in ['policy','source','sourceUrl','attribution','sourceScale']})
        if year==1945: s.pop('boundaryPolicy',None)
        snapshot_index[year]=s
    catalogue['snapshots']=sorted(snapshot_index.values(),key=lambda s:s['year'])+[s for s in catalogue['snapshots'] if s.get('modern')]
    definitions=[('curated-portuguese-goa','Portuguese Goa',1510,1961,'Portuguese territory','Panaji','Portuguese territory on India’s west coast; integrated into India in December 1961.',1961),('curated-kingdom-sikkim','Kingdom of Sikkim',1642,1975,'Monarchy / protectorate','Gangtok','Himalayan kingdom under Chogyal rulers; an Indian protectorate from 1950 and an Indian state from May 1975.',1975),('curated-french-india','French settlements in India',None,1954,'French territory','Pondicherry','Remaining French settlements transferred to Indian administration in November 1954; de jure transfer followed in 1962.',1954)]
    record_index={r['id']:r for r in catalogue['records']}
    for id,name,start,end,type_label,capital,summary,milestone in definitions:
        record_index[id]={'id':id,'name':name,'aliases':[],'type':'historical','typeLabel':type_label,'region':'Asia','start':start,'end':end,'capital':capital,'summary':summary,'profile':id+'.json','years':[],'evidence':'Reviewed regional reconstruction'}
        sources=patch['metadata']['sources']+[{'title':m['event'],'url':m['url']} for m in patch['metadata']['milestones'] if m['year']==milestone]
        write(atlas/'profiles'/f'{id}.json',{'summary':summary,'start':start,'end':end,'capital':capital,'coverage':'regional-history','provenance':'Selected regional milestones; annual snapshots show the end-of-year state.','boundaryNote':patch['metadata']['geometry']+' '+patch['metadata']['scope'],'sources':sources})
    record_index['country-ind'].update(start=1947,evidence='Reviewed regional history and current reference')
    for record in record_index.values(): record['years']=[]
    for s in catalogue['snapshots']:
        for id in {f['properties']['id'] for f in read(atlas/'maps'/s['file'])['features']}:
            record_index[id]['years'].append('modern' if s.get('modern') else s['year'])
    catalogue['records']=sorted(record_index.values(),key=lambda r:r['name'].casefold())
    catalogue['coverage'].update(records=len(record_index),boundarySnapshots=len(catalogue['snapshots']))
    catalogue['postwarIndiaPatch']=patch_hash
    catalogue['sources'].append({'title':'India · post-independence regional chronology','url':'/atlas/india-postwar-provenance.json','license':'SOI attribution; Natural Earth public domain; Historical Basemaps GPL-3.0','role':patch['metadata']['geometry']})
    write(atlas/'catalogue.json',catalogue)
    profile=read(atlas/'profiles/country-ind.json')
    profile['boundaryNote']=patch['metadata']['boundaryConvention']+' '+patch['metadata']['geometry']
    profile['periodNote']='Independent from 15 August 1947; a dominion until 26 January 1950, then a republic. Regional snapshots use the year-end convention.'
    profile['sources'].append({'title':'Post-independence boundary chronology & sources','url':'/atlas/india-postwar-provenance.json'})
    write(atlas/'profiles/country-ind.json',profile)
    write(atlas/'india-postwar-provenance.json',patch['metadata'])
    manifest=read(atlas/'source-manifest.json'); manifest['postwarIndia']={**patch['metadata'],'patchSha256':patch_hash}; write(atlas/'source-manifest.json',manifest)
    print('Applied regional chronology:',len(patch['snapshots']),'snapshots')
if __name__=='__main__': apply_postwar_india()
