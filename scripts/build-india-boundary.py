"""Prepare the official India outline and non-overlapping neighbouring geometry.
Offline build dependency: pyshp 2.3.1, pyproj 3.7.2, shapely 2.1.2.
Usage: python scripts/build-india-boundary.py Outline_of_India.zip baseline-modern.json
"""
import hashlib, io, json, pathlib, sys, zipfile
import shapefile
from pyproj import CRS, Transformer
from shapely import get_num_coordinates, make_valid
from shapely.geometry import shape, mapping, Polygon, MultiPolygon
from shapely.ops import transform

ROOT = pathlib.Path(__file__).resolve().parents[1]
URL = 'https://surveyofindia.gov.in/documents/Outline_of_India.zip'
PAGE = 'https://surveyofindia.gov.in/pages/outline-maps-of-india'
ATTRIBUTION = 'Source: Survey of India, Government of India.'
def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
def polygons(g):
    if isinstance(g, Polygon): return [g]
    return [p for part in getattr(g, 'geoms', []) for p in polygons(part)]
def encode(g):
    def rounded(v):
        return [rounded(x) for x in v] if isinstance(v, (list, tuple)) else round(v, 7)
    return {'type': g.geom_type, 'coordinates': rounded(mapping(g)['coordinates'])}
def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':'))+'\n')

def build(archive, baseline):
    with zipfile.ZipFile(archive) as z:
        base='Outline_of_India'
        reader=shapefile.Reader(shp=io.BytesIO(z.read(base+'.shp')), shx=io.BytesIO(z.read(base+'.shx')), dbf=io.BytesIO(z.read(base+'.dbf')))
        assert len(reader)==1 and reader.record(0)['Country']=='India'
        source=shape(reader.shape(0).__geo_interface__)
        assert source.is_valid
        projection=z.read(base+'.prj').decode()
        converter=Transformer.from_crs(CRS.from_wkt(projection), 'EPSG:4326', always_xy=True)
        # 25 m rendering tolerance in the source's metre CRS, below this atlas's
        # pixel scale. Preserve every island and hole; no invented boundary points.
        simplified=source.simplify(25, preserve_topology=True)
        assert len(source.geoms)==len(simplified.geoms)
        india=transform(converter.transform, simplified)
        assert india.is_valid
        metadata={
            'policy':'india-government', 'source':'Survey of India, Government of India',
            'sourceUrl':PAGE, 'downloadUrl':URL, 'attribution':ATTRIBUTION,
            'retrieved':'2026-10-31', 'archiveDate':'2026-02-13',
            'archiveSha256':hashlib.sha256(archive.read_bytes()).hexdigest(),
            'sourceFiles':{n:hashlib.sha256(z.read(n)).hexdigest() for n in z.namelist()},
            'sourceScale':'1:16,000,000, as stated on the download page',
            'sourceCRS':projection, 'outputCRS':'EPSG:4326',
            'sourceVertices':int(get_num_coordinates(source)), 'renderVertices':int(get_num_coordinates(india)),
            'polygonParts':len(india.geoms), 'renderToleranceMetres':25,
            'rights':'Survey of India. Digital display of SOI boundary data is addressed by DST Geospatial Guidelines (2021), paragraph 8(xiii).',
            'rightsUrl':'https://geospatial.dst.gov.in/Guidelines.aspx',
            'transform':'Reprojected from the supplied LCC_WGS84 CRS; topology-preserving 25 m render simplification; seven-decimal coordinate encoding. All source islands and holes retained.',
            'scope':'Modern reference only. India follows the Government of India boundary convention; this is not a territorial-control map. Historical snapshots retain their dated sources.'}
    collection=json.loads(baseline.read_text())
    replacements={}; omitted={}; edits=[]
    for feature in collection['features']:
        p=feature['properties']; id=p['id']; raw=feature['geometry']
        g=shape(raw); fixed=g if g.is_valid else make_valid(g)
        overlap=fixed.intersection(india)
        if id=='country-ind':
            replacements[id]={'inputSha256':digest(raw), 'geometry':encode(india)}
        elif id=='country-kas' or p.get('overlay') and overlap.area/max(fixed.area,1e-12)>.8:
            omitted[id]={'inputSha256':digest(raw),'name':p['name']}
        elif not overlap.is_empty and overlap.area>1e-10:
            clipped=MultiPolygon(polygons(fixed.difference(india)))
            assert clipped.is_valid and not clipped.is_empty, id
            replacements[id]={'inputSha256':digest(raw),'geometry':encode(clipped)}
            edits.append({'id':id,'name':p['name'],'operation':'Clipped against the Survey of India outline; remaining source geometry retained.'})
    # Quantitative QA uses the actual emitted geometry after numeric encoding.
    emitted=shape(replacements['country-ind']['geometry'])
    assert emitted.is_valid
    for id, change in replacements.items():
        if id=='country-ind':continue
        assert emitted.intersection(shape(change['geometry'])).area<1e-6, id
    metadata['neighbourAdjustments']=edits
    metadata['suppressedMapRecords']=[{'id':id,'name':v['name']} for id,v in omitted.items()]
    patch={'metadata':metadata,'replace':replacements,'omit':omitted}
    write(ROOT/'data/empires/boundaries/india-government.json',patch)
    write(ROOT/'public/atlas/india-boundary-provenance.json',metadata)
    print(json.dumps({'vertices':metadata['renderVertices'],'islandsAndMainland':len(india.geoms),'replaced':list(replacements),'omitted':list(omitted)},indent=2))

if __name__=='__main__':build(pathlib.Path(sys.argv[1]),pathlib.Path(sys.argv[2]))
