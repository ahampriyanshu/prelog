"""Build reviewed regional deltas from unpatched normalized snapshot maps.
Usage: python scripts/build-postwar-india.py /path/to/unpatched/maps
Requires Shapely 2.1.2. The normal importer applies the committed result without GIS.
All geometry comes from the cited SOI / Natural Earth / Historical Basemaps inputs.
"""
import copy, hashlib, json, pathlib, sys
from shapely import make_valid
from shapely.geometry import shape, mapping, Polygon, MultiPolygon
from shapely.ops import unary_union
ROOT=pathlib.Path(__file__).resolve().parents[1]
def read(p): return json.loads(p.read_text())
def digest(d): return hashlib.sha256(json.dumps(d,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def write(p,d): p.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n')
def polygons(g):
    if isinstance(g,Polygon): return [g]
    return [p for part in getattr(g,'geoms',[]) for p in polygons(part)]
def clean(g):
    parts=polygons(make_valid(g)); return MultiPolygon(parts) if len(parts)!=1 else parts[0]
def encode(g):
    def rounded(v): return [rounded(x) for x in v] if isinstance(v,(list,tuple)) else round(v,7)
    g=clean(g); return {'type':g.geom_type,'coordinates':rounded(mapping(g)['coordinates'])}
def feature(id,name,g):
    g=clean(g); p=g.representative_point(); a,b,c,d=g.bounds
    return {'type':'Feature','properties':{'id':id,'key':id,'name':name,'subject':id,'label':[round(p.x,5),round(p.y,5)],'size':(c-a)*(d-b),'boundaryPolicy':'india-government','precision':7},'geometry':encode(g)}

def build(baseline):
    official=read(ROOT/'data/empires/boundaries/india-government.json')
    india=clean(shape(official['replace']['country-ind']['geometry']))
    regions=read(ROOT/'data/empires/boundaries/india-accession-regions.json')
    regions={f['properties']['name']:clean(shape(f['geometry'])).intersection(india) for f in regions['features']}
    originals={y:read(baseline/f'{y}.json') for y in [1945,1960,1994,2000,2010]}
    # Use the source's post-1971 Bangladesh outline to separate East Pakistan.
    bangladesh=unary_union([shape(f['geometry']) for f in originals[1994]['features'] if f['properties']['id']=='atlas-236']).difference(india)
    excluded={'map-india','country-ind','map-pakistan','map-bangladesh','atlas-236','curated-portuguese-goa','curated-kingdom-sikkim','curated-french-india'}
    output={}
    for year,baseyear in [(1945,1945),(1947,1945),(1948,1945),(1954,1945),(1960,1960),(1961,1960),(1971,1960),(1975,1960),(1994,1994),(2000,2000),(2010,2010)]:
        original=originals[baseyear]; additions=[]; replacements={}; omitted=[]
        separate=[]
        for name,id,label,end in [('Goa','curated-portuguese-goa','Portuguese Goa',1961),('Sikkim','curated-kingdom-sikkim','Kingdom of Sikkim',1975),('Puducherry','curated-french-india','French settlements in India',1954)]:
            if year<end:
                separate.append(regions[name]); additions.append(feature(id,label,regions[name]))
        retained=india.difference(unary_union(separate))
        pak=unary_union([clean(shape(f['geometry'])) for f in original['features'] if f['properties']['id'] in ['map-pakistan','map-bangladesh']]).difference(india)
        if year<1947:
            raj=unary_union([clean(shape(f['geometry'])) for f in original['features'] if f['properties']['id'] in ['map-india','map-pakistan','map-bangladesh']]).difference(unary_union(separate))
            additions.append(feature('atlas-5','British Raj',raj))
            protected=raj.union(unary_union(separate))
        else:
            additions.append(feature('country-ind','India',retained))
            if year<1971: pak=pak.union(bangladesh)
            else: pak=pak.difference(bangladesh); additions.append(feature('atlas-236','Bangladesh',bangladesh))
            additions.append(feature('map-pakistan','Pakistan',pak))
            protected=india.union(pak).union(bangladesh)
        for f in original['features']:
            key=f['properties']['key']
            if f['properties']['id'] in excluded: omitted.append(key); continue
            g=clean(shape(f['geometry']))
            if g.intersects(protected):
                difference=g.difference(protected)
                if difference.is_empty: omitted.append(key)
                elif not difference.equals(g): replacements[key]=encode(difference)
        output[str(year)]={'baseYear':baseyear,'inputSha256':digest(original),'omit':omitted,'replace':replacements,'add':additions}
    metadata={
      'version':1,'annualConvention':'Year-end regional snapshots; no claim of day-by-day coverage.',
      'boundaryConvention':'Government of India outline from independence onward. Kashmir accession was signed on 26 October 1947; this legal boundary convention is not a depiction of territorial control.',
      'geometry':'SOI national outline, with Natural Earth 5.1.1 present-day Goa, Sikkim and Puducherry administrative polygons used as regional masks. These internal lines are approximations, not independently surveyed historical borders. Original world maps are retained elsewhere.',
      'scope':'Selected post-independence transitions only; not a complete reconstruction of every princely state, French settlement, Portuguese enclave or later boundary exchange. The 1945 Raj aggregate combines the source’s India, Pakistan and Bangladesh outlines; it does not distinguish directly administered provinces from princely states.',
      'milestones':[{'year':1947,'event':'Indian independence, 15 August; Jammu and Kashmir accession, 26 October.','url':'https://www.mha.gov.in/web/sites/default/files/AnnualReport_03_04.pdf'},{'year':1954,'event':'De facto transfer of remaining French settlements, 1 November.','url':'https://www.py.gov.in/history'},{'year':1961,'event':'Goa integrated, 19 December.','url':'https://www.goavidhansabha.gov.in/infrastructure_detail.php?i_id=6'},{'year':1971,'event':'Independent Bangladesh replaces East Pakistan in the year-end view.','url':'https://www.mofa.gov.bd/'},{'year':1975,'event':'Sikkim became an Indian state, 16 May.','url':'https://mdoner.nic.in/about-north-east/sikkim'}],
      'sources':[{'title':official['metadata']['attribution'],'url':official['metadata']['sourceUrl']},{'title':'Natural Earth 5.1.1 · Admin 1','url':'https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/'},{'title':'Historical Basemaps','url':'https://github.com/aourednik/historical-basemaps'}],
      'inputHashes':{name:hashlib.sha256((ROOT/'data/empires/boundaries'/name).read_bytes()).hexdigest() for name in ['india-government.json','india-accession-regions.json']}}
    write(ROOT/'data/empires/boundaries/india-postwar.json',{'metadata':metadata,'snapshots':output})
    print('Prepared',len(output),'regional deltas')
if __name__=='__main__': build(pathlib.Path(sys.argv[1]))
