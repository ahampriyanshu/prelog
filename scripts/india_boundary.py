"""Apply the reviewed Government of India boundary patch after source import.
Uses only the standard library; GIS dependencies are needed only to regenerate it.
"""
import hashlib, json, pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]

def digest(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def read(path):return json.loads(path.read_text())
def write(path,value):path.write_text(json.dumps(value,ensure_ascii=False,separators=(',',':'))+'\n')

def apply_india_boundary(root=ROOT):
    atlas=root/'public/atlas'; patch=read(root/'data/empires/boundaries/india-government.json')
    metadata=patch['metadata']; replacements=patch['replace']; omitted=patch['omit']
    path=atlas/'maps/modern.json'; collection=read(path)
    if collection.get('boundaryPolicy',{}).get('archiveSha256')==metadata['archiveSha256']:
        return
    actual={f['properties']['id']:f for f in collection['features']}
    # Fail closed when underlying country/claim geometry changes: a new source
    # edition must be reviewed, never silently covered by an obsolete patch.
    for id,change in {**replacements,**omitted}.items():
        if id not in actual or digest(actual[id]['geometry'])!=change['inputSha256']:
            raise ValueError('India boundary patch does not match input geometry: '+id)
    for feature in collection['features']:
        id=feature['properties']['id']
        if id in replacements:
            feature['geometry']=replacements[id]['geometry']
            feature['properties']['boundaryPolicy']='india-government'
            if id=='country-ind':feature['properties']['boundarySource']=metadata['source']
    collection['features']=[f for f in collection['features'] if f['properties']['id'] not in omitted]
    collection['boundaryPolicy']=metadata
    write(path,collection)
    catalogue=read(atlas/'catalogue.json')
    count=sum(not f['properties'].get('overlay') for f in collection['features'])
    for snapshot in catalogue['snapshots']:
        if snapshot.get('modern'):
            snapshot['count']=count
            snapshot['boundaryPolicy']={k:metadata[k] for k in ['policy','source','sourceUrl','attribution','sourceScale']}
    for record in catalogue['records']:
        if record['id'] in omitted:
            record['years']=[y for y in record['years'] if y!='modern']
            record['mapSuppressedBy']='india-government'
    catalogue['coverage']['sourceModernMapUnits']=258
    catalogue['coverage']['modernMapUnits']=count
    catalogue['coverage']['modernClaimFeatures']=sum(bool(f['properties'].get('overlay')) for f in collection['features'])
    catalogue['edition']='2026-10-31'
    catalogue['sources'].append({'title':metadata['source'],'url':metadata['sourceUrl'],'license':metadata['rights'],'role':'Official India outline for the modern reference. Neighbouring fills are clipped at this outline; conflicting claim overlays are suppressed in this view.'})
    write(atlas/'catalogue.json',catalogue)
    profile=read(atlas/'profiles/country-ind.json')
    profile['boundaryNote']='India’s modern outline follows Survey of India, Government of India. Source scale 1:16 million; source file dated 13 February 2026. This boundary convention does not describe present territorial control.'
    profile['sources'].insert(0,{'title':metadata['attribution'],'url':metadata['sourceUrl']})
    profile['sources'].insert(1,{'title':'India boundary processing & provenance','url':'/atlas/india-boundary-provenance.json'})
    write(atlas/'profiles/country-ind.json',profile)
    write(atlas/'india-boundary-provenance.json',metadata)
    source=read(atlas/'source-manifest.json')
    source['boundaryPolicy']={**metadata,'patchSha256':hashlib.sha256((root/'data/empires/boundaries/india-government.json').read_bytes()).hexdigest()}
    source['transform']+=' Modern India is replaced by the separately attributed Survey of India outline; overlapping neighbour geometry is clipped and conflicting overlays suppressed. See boundaryPolicy.'
    write(atlas/'source-manifest.json',source)
    print(f'India government boundary applied: {count} modern map units, {catalogue["coverage"]["modernClaimFeatures"]} claim overlays.')

if __name__=='__main__':apply_india_boundary()
