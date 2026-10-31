"""Build the local atlas from saved source downloads. Never synthesizes borders.
Usage: python3 scripts/import-empires.py /path/to/source-downloads
"""
import json,pathlib,re,unicodedata,sys,hashlib,html,collections
R=pathlib.Path(sys.argv[1]);P=pathlib.Path(__file__).resolve().parents[1];CURATED=P/'data/empires/curated';OUT=P/'public/atlas';OUT.mkdir(exist_ok=True);(OUT/'maps').mkdir(exist_ok=True);(OUT/'profiles').mkdir(exist_ok=True);(OUT/'licenses').mkdir(exist_ok=True)
def curated_file(name):return CURATED/name if (CURATED/name).exists() else R/name
def norm(s):return re.sub(r'[^\w]+',' ',''.join(c for c in unicodedata.normalize('NFKD',str(s or '')) if not unicodedata.combining(c)).lower()).strip()
def slug(s):return norm(s).replace(' ','-')
for old in (OUT/'profiles').glob('*.json'):old.unlink()
legacy=OUT/'maps/2026.json'
if legacy.exists():legacy.unlink()
def write(path,data):path.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')))
def plain(s):return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',str(s or '')))).strip()
def text_at(d,*keys):
 for k in keys:d=d.get(k,{}) if isinstance(d,dict) else {}
 return plain(d.get('text','')) if isinstance(d,dict) else plain(d)
def brief(s,n=55):
 s=plain(s);w=s.split();return s if len(w)<=n else ' '.join(w[:n])+'…'
def dated_brief(s,n=55):
 result=brief(s,n)
 for date in re.findall(r'\([^)]*\b(?:19|20)\d{2}[^)]*\)',s):
  if date not in result:result+=' '+date
 return result
def rings(g):return [g['coordinates']] if g['type']=='Polygon' else g['coordinates'] if g['type']=='MultiPolygon' else []
def bounds(g):
 pts=[p for poly in rings(g) for p in poly[0]]
 if not pts:return [0,0,0,0]
 return [min(p[0] for p in pts),min(p[1] for p in pts),max(p[0] for p in pts),max(p[1] for p in pts)]
def geo(g):
 # Original vertices retained; numeric encoding only is rounded to 5 decimal places.
 return {'type':g['type'],'coordinates':[[[round(v,5) for v in p] for p in r] for r in g['coordinates']]} if g['type']=='Polygon' else {'type':'MultiPolygon','coordinates':[[[[round(v,5) for v in p] for p in r] for r in poly] for poly in g['coordinates']]}
def region_at(b):
 x,y=(b[0]+b[2])/2,(b[1]+b[3])/2
 return 'Americas' if x<-30 else 'Oceania' if x>110 and y<0 else 'Africa' if -20<x<55 and y<33 else 'Europe' if x<60 and y>35 else 'Asia'
def en_name(e):
 english=next((v for v in e['name_variants'] if v.get('lang')=='en'),None)
 return e['name_original'] if not english or re.search(r'pejorative|derogatory',english.get('context') or '',re.I) else english['name']
records={};profiles={};aliases=collections.defaultdict(list)
for fn in ['atlas-index.json','atlas-index-500.json','atlas-index-1000.json']:
 for e in json.load(open(R/fn))['entities']:
  if e.get('status')=='deprecated':continue
  id='atlas-'+str(e['id']);name=en_name(e);variant=[v['name'] for v in e['name_variants']]+[e['name_original']]
  kind=e['entity_type'];kind='geographic-context' if kind in ['cultural_region','period','city','settlement','earthwork-complex','civilization'] else 'historical'
  record={'id':id,'name':name,'aliases':variant,'start':e['year_start'],'end':e['year_end'],'type':kind,'typeLabel':e['entity_type'].replace('_',' '),'region':e.get('continent') or 'Unassigned','years':[],'capital':e.get('capital',{}).get('name') if e.get('capital') else None,'profile':id+'.json','evidence':'Imported reference'}
  records[id]=record
  profiles[id]={'capital':record['capital'],'capitalHistory':e.get('capital_history',[]),'start':e['year_start'],'end':e['year_end'],'sources':[{'title':'AtlasPI · '+name,'url':'https://atlaspi.it/v1/entities/'+str(e['id'])}]+[{'title':s['citation'],'url':s.get('url')} for s in e.get('sources',[])],'provenance':'AtlasPI metadata; bibliography supplied by its editors. Not independently audited.','coverage':'reference'}
  for a in [name,e['name_original']]:
   if a and norm(a):aliases[norm(a)].append(id)
# Name variants are explicit identity mappings, not fuzzy historical guesses.
for target,names in {'atlas-37':['Mauryan Empire'],'atlas-1':['Roman Empire'],'atlas-12':['Mughal Empire']}.items():
 for name in names:aliases[norm(name)].append(target)
# Apply a reviewed identity crosswalk; incidental aliases never transfer dossier facts.
curated_targets=json.load(open(curated_file('curated-targets.json')))
for filename in ['historical-profiles-west.json','historical-profiles-east.json']:
 content=json.load(open(curated_file(filename)));entries=[dict(v,name=k) for k,v in content.items()] if isinstance(content,dict) else content
 for dossier in entries:
  cross=curated_targets[dossier['name']];targets=cross['atlasIds']
  if not targets:
   id=cross.get('suggestedStandaloneId','curated-'+slug(dossier['name']));targets=[id]
   records[id]={'id':id,'name':dossier['name'],'aliases':dossier.get('aliases',[]),'start':dossier['start'],'end':dossier['end'],'type':'historical','typeLabel':'Historical polity','region':'Unassigned','years':[]}
  for id in targets:
   r=records[id];old=profiles.get(id,{})
   profiles[id]={**old,**dossier,'sources':dossier.get('sources',[])+old.get('sources',[]),'coverage':'researched','identityNote':cross['note'],'provenance':'Researched dossier with an explicitly reviewed identity match. Dates may follow a stated scholarly convention; source boundaries are independently attributed.'}
   r.update({'summary':dossier.get('summary'),'capital':dossier.get('capital'),'profile':id+'.json','evidence':'Researched dossier'})
   if dossier['name']=='Soviet Union':r['typeLabel']='Federal union'
   aliases[norm(dossier['name'])].append(id)
boundary_aliases=json.load(open(curated_file('boundary-aliases.json')))
for join in boundary_aliases:
 if join['targetId'] not in records:raise RuntimeError('Unknown reviewed boundary identity: '+join['targetId'])
 profiles[join['targetId']].setdefault('boundaryIdentityNotes',[]).append({'sourceName':join['sourceName'],'years':join['observedYears'],'note':join['reason']})
 profiles[join['targetId']]['sources'].extend(s for s in join.get('sources',[]) if s not in profiles[join['targetId']]['sources'])
index=json.load(open(R/'history-index.json'))['years'];snapshots=[];unmatched=collections.Counter();sourcefiles=[];quarantined=[]
culture=re.compile(r'cultures?|hunter|gatherer|pastoral|farmers|tribes|peoples|neolithic|bronze age|paleolithic|mesolithic',re.I)
for snap in sorted((x for x in index if -4000<=x['year']<=2010),key=lambda x:x['year']):
 f=R/'maps'/snap['filename']
 if not f.exists():raise RuntimeError('Missing boundary snapshot: '+str(f))
 data=json.load(open(f));features=[]
 for i,feature in enumerate(data['features']):
  p=feature['properties'];name=str(p.get('NAME') or '').strip();g=feature.get('geometry')
  if not name or not g or g['type'] not in ['Polygon','MultiPolygon']:continue
  joined=[j for j in boundary_aliases if j['sourceName']==name]
  if any(snap['year'] in j.get('quarantineYears',[]) for j in joined):
   quarantined.append({'name':name,'snapshot':snap['year'],'reason':'Explicitly reviewed name/year contradiction.'});continue
  exact=[records[j['targetId']] for j in joined if j['validStart']<=snap['year']<=j['validEnd'] and snap['year'] in j['observedYears']]
  candidates=[records[id] for id in set(aliases[norm(name)]) if records[id]['start']<=snap['year'] and (records[id]['end'] is None or records[id]['end']>=snap['year'])]
  if exact:candidates=exact
  if not candidates and aliases[norm(name)] and re.search(r'empire|dynasty|caliphate|sultanate|soviet union',name,re.I):
   quarantined.append({'name':name,'snapshot':snap['year'],'reason':'Snapshot conflicts with every imported lifespan for this exact name.'});continue
  preferred=[r for r in candidates if r.get('evidence')=='Researched dossier']
  if len(preferred)==1:candidates=preferred
  if len(candidates)==1:id=candidates[0]['id']
  else:
   id='map-'+slug(name);unmatched[name]+=1
   if id not in records:
    b=bounds(g);records[id]={'id':id,'name':name,'aliases':[],'type':'geographic-context' if culture.search(name) or p.get('type')=='culture' else 'source-region','typeLabel':'Cultural area' if culture.search(name) or p.get('type')=='culture' else 'Source region · unclassified','region':region_at(b),'years':[],'start':None,'end':None,'evidence':'Boundary record'}
  r=records[id];r['years'].append(snap['year']);b=bounds(g)
  features.append({'type':'Feature','properties':{'id':id,'key':id+'-'+str(i),'name':r['name'],'sourceName':name,'subject':p.get('SUBJECTO') or name,'precision':p.get('BORDERPRECISION'),'label':[(b[0]+b[2])/2,(b[1]+b[3])/2],'size':(b[2]-b[0])*(b[3]-b[1])},'geometry':geo(g)})
 write(OUT/'maps'/f"{snap['year']}.json",{'type':'FeatureCollection','features':features,'year':snap['year'],'source':'historical-basemaps'})
 snapshots.append({'year':snap['year'],'file':f"{snap['year']}.json",'count':len(set(f['properties']['id'] for f in features)),'source':'Historical Basemaps','edition':'Dated reconstruction','sourceUrl':'https://github.com/aourednik/historical-basemaps/blob/master/geojson/'+snap['filename']})
 sourcefiles.append({'file':snap['filename'],'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
# Contemporary geography is a cartographic reference layer, not a live conflict map.
features=[];modern=json.load(open(R/'ne-countries.geojson'));countryfiles={p.stem.split('__')[-1]:p for p in (R/'countries').glob('*.json')}
for f in modern['features']:
 p=f['properties'];id='country-'+p['ADM0_A3'].lower();b=bounds(f['geometry']);kind='disputed' if p['TYPE'] in ['Disputed','Indeterminate'] else 'state' if p['TYPE'] in ['Sovereign country','Sovereignty'] or p['ADMIN']==p['SOVEREIGNT'] and p['TYPE']=='Country' else 'territory'
 if p['ADMIN'] in ['Somaliland','Northern Cyprus','Kosovo','Taiwan','Palestine','Western Sahara']:kind='disputed'
 if p['ADMIN']=='Antarctica':kind='territory'
 if p['ADM0_A3'] in ['ISR','COK','NIU']:kind='state'
 r={'id':id,'name':p['ADMIN'],'aliases':[x for x in [p.get('NAME'),p.get('FORMAL_EN'),p.get('NAME_LONG'),p.get('ISO_A3'),p.get('NAME_ALT')] if x],'type':kind,'typeLabel':{'state':'State','territory':'Territory / dependency','disputed':'Disputed polity / area'}[kind],'sourceType':p['TYPE'],'region':p['CONTINENT'],'years':['modern'],'start':None,'end':None,'profile':id+'.json','evidence':'Modern reference','sovereign':p['SOVEREIGNT']};records[id]=r
 profile={'sources':[{'title':'Natural Earth · Admin 0 countries','url':'https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/'}],'coverage':'reference','recognition':f"Cartographic classification in Natural Earth: {p['TYPE']}. This classification is not a statement of international recognition.",'provenance':'Natural Earth reference geography. Territorial control and recognition can differ; this layer is not a live conflict assessment.'}
 # Natural Earth has absent or obsolete FIPS codes for these map units.
 # Each override was checked against the archive's conventional country name.
 factbook_codes={'NOR':'no','SDS':'od','ISR':'is','CUW':'uc','SXM':'nn','WSB':'ax','ESB':'dx'}
 if p['ADM0_A3']=='ISR':
  profile['recognition']='UN member state. The source’s disputed cartographic classification concerns its territorial outline; it does not change UN membership.'
  profile['sources'].append({'title':'United Nations · member states','url':'https://www.un.org/en/about-us/member-states'})
 if p['ADM0_A3'] in ['COK','NIU']:
  r['typeLabel']='Self-governing state in free association'
  profile['recognition']='Self-governing state in free association with New Zealand.'
  profile['sources'].append({'title':'New Zealand MFAT · '+p['ADMIN'],'url':'https://www.mfat.govt.nz/en/countries-and-regions/australia-and-pacific/'+('cook-islands' if p['ADM0_A3']=='COK' else 'niue')})
 cf=countryfiles.get(factbook_codes.get(p['ADM0_A3'],str(p.get('FIPS_10','')).lower()))
 if cf:
  d=json.load(open(cf));gov=d.get('Government',{});ec=d.get('Economy',{});mil=d.get('Military and Security',{})
  govtype=text_at(gov,'Government type');cap=text_at(gov,'Capital','name');r['capital']=cap
  capital_note=re.sub(r'^note:\s*','',text_at(gov,'Capital','note'),flags=re.I)
  capital_detail=cap+((' · '+capital_note) if capital_note else '')
  currency=text_at(ec,'Exchange rates','Currency').split(' per US dollar')[0].strip(' -')
  if not currency:
   exchange=text_at(ec,'Exchange rates');currency=exchange.split(' per US dollar')[0] if ' per US dollar' in exchange else 'US dollar (USD)' if re.search(r'US dollar.*(?:used|currency|medium of exchange)',exchange,re.I) else None
  if p['ADM0_A3']=='USA':currency='US dollar (USD)'
  rulers='; '.join(dict.fromkeys(text_at(gov,'Executive branch',k) for k in ['chief of state','head of government'] if text_at(gov,'Executive branch',k)))
  overview=text_at(ec,'Economic overview');army=text_at(mil,'Military and security forces');spending=next((plain(v['text']) for k,v in mil.get('Military expenditures',{}).items() if isinstance(v,dict) and 'text' in v),'')
  military=dated_brief(army,45)
  scope_notes={'LBY':'The source also identifies the separate Libyan National Army / Libyan Arab Armed Forces under Khalifa Haftar, with units operating under their own command structures.','YEM':'The source separately identifies Houthi forces and Saudi- and UAE-backed irregular forces; this is not a unified chain of command.','SDN':'The RSF remains under Mohamed Hamdan Dagalo’s personal command; its inclusion does not imply a unified force with the SAF.'}
  if p['ADM0_A3'] in scope_notes:military+=' '+scope_notes[p['ADM0_A3']]
  gdp_data=ec.get('Real GDP (purchasing power parity)',{});gdp=next((plain(v['text']) for k,v in gdp_data.items() if isinstance(v,dict) and 'text' in v),'');gdp_note=plain(gdp_data.get('note',''))
  economy=dated_brief(overview,55)+((' GDP (PPP): '+gdp+'. '+gdp_note) if gdp else '')
  profile.update({'summary':f"{p['FORMAL_EN'] or p['ADMIN']}. {govtype.capitalize()}." if govtype else None,'capital':capital_detail or None,'currency':currency,'rulers':rulers or None,'government':govtype or None,'economy':economy or None,'military':military+((' Expenditure: '+spending) if spending else '') if army else None,'origin':brief(text_at(gov,'Independence'),55) or None,'decline':None,'contributions':None,'asOf':'Archived Factbook edition; individual figures retain their stated years.','coverage':'country-reference','sourceFields':{'military':army,'militaryNotes':text_at(mil,'Military and security forces','note'),'economy':overview,'independence':text_at(gov,'Independence')}})
  region,code=cf.stem.split('__');url=f'https://github.com/factbook/factbook.json/blob/master/{region}/{code}.json';profile['sources'].append({'title':'CIA World Factbook · archived country profile','url':url});profile['provenance']='Country facts are from the archived CIA World Factbook mirror. Officeholders and economic/military data are reference observations, not a live update.'
  if p['ADM0_A3']=='USA':profile['sources'].append({'title':'US Bureau of Engraving and Printing · circulating dollar currency','url':'https://www.bep.gov/currency/circulating-currency/1-note'})
  r['summary']=profile['summary'];profile['periodLabel']=brief(text_at(gov,'Independence'),55) or 'Modern reference edition'
 profiles[id]=profile
 features.append({'type':'Feature','properties':{'id':id,'key':id,'name':r['name'],'subject':id,'label':[p['LABEL_X'],p['LABEL_Y']],'size':(b[2]-b[0])*(b[3]-b[1]),'precision':3},'geometry':geo(f['geometry'])})
# Preserve the dataset's disputed/claim polygons separately from country outlines.
for i,f in enumerate(json.load(open(R/'ne-disputed.geojson'))['features']):
 p=f['properties'];name=p.get('BRK_NAME') or p.get('NAME') or 'Disputed area';id='claim-'+str(p.get('NE_ID',i));b=bounds(f['geometry'])
 if id not in records:records[id]={'id':id,'name':name,'aliases':[],'type':'disputed','typeLabel':'Disputed / claim area','region':region_at(b),'years':['modern'],'start':None,'end':None,'evidence':'Source claim geometry','profile':id+'.json'}
 profiles[id]={'recognition':plain(p.get('NOTE') or p.get('NOTE_BRK') or p.get('BRK_GROUP')) or None,'provenance':'Claim/disputed-area geometry from Natural Earth. It is not a statement of present control or legal sovereignty.','coverage':'boundary-only','sources':[{'title':'Natural Earth · disputed areas','url':'https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-breakaway-disputed-areas/'}]}
 features.append({'type':'Feature','properties':{'id':id,'key':id+'-'+str(i),'name':name,'label':[(b[0]+b[2])/2,(b[1]+b[3])/2],'overlay':True,'size':(b[2]-b[0])*(b[3]-b[1])},'geometry':geo(f['geometry'])})
write(OUT/'maps/modern.json',{'type':'FeatureCollection','features':features,'year':None,'reference':'modern','observationDate':None,'source':'natural-earth'})
version=(R/'ne-version.txt').read_text().strip() if (R/'ne-version.txt').exists() else 'version not specified'
snapshots.append({'year':None,'key':'modern','file':'modern.json','modern':True,'observationDate':None,'count':258,'source':'Natural Earth','edition':version,'sourceUrl':'https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/'})
# Actor dossiers never manufacture control extents.
f=curated_file('contested-actors.json')
if f.exists():
 contents=json.load(open(f));entries=contents if isinstance(contents,list) else list(contents.values())
 for d in entries:
  name=d['name'];modern_ids={'taiwan':'country-twn','palestine':'country-psx','kosovo':'country-kos','somaliland':'country-sol','northern-cyprus':'country-cyn','sadr':'country-sah'}
  target=modern_ids.get(d['id']);matches=[records[target]] if target in records else []
  if not matches and d['type']=='disputed':
   names={'abkhazia':'Abkhazia','south-ossetia':'South Ossetia','transnistria':'Transnistria'}
   matches=[r for r in records.values() if r['id'].startswith('claim-') and norm(r['name'])==norm(names.get(d['id'],name))]
  if not matches:
   id='actor-'+slug(d.get('id',name));records[id]={'id':id,'name':name,'aliases':d.get('aliases',[]),'type':d['type'],'typeLabel':'Non-state actor' if d['type']=='non-state' else 'Contested polity','region':d.get('region') or ('Africa' if d['id'] in ['rsf','al-shabaab','somaliland','sadr'] else 'Europe' if d['id'] in ['kosovo','transnistria'] else 'Asia'),'years':[],'start':d.get('start'),'end':d.get('end'),'profile':id+'.json','evidence':'Researched profile; no control polygon'};matches=[records[id]]
  for r in matches:
   id=r['id'];old=profiles.get(id,{});profiles[id]={**old,**d,'provenance':'Researched dossier. Each cited source has its own date; the newest citation is not a live verification of every field. No control geometry is inferred from areas of activity.','coverage':'researched','sources':d.get('sources',[])+old.get('sources',[])};r['aliases']=list(set(r.get('aliases',[])+[name,d['id'],*d.get('aliases',[])]));r['summary']=d.get('summary');r['type']=d['type'];r['typeLabel']='Non-state actor' if d['type']=='non-state' else 'Disputed polity';r['start']=d.get('start');r['end']=d.get('end');r['capital']=d.get('capital');r['profile']=id+'.json'
for id,r in records.items():
 r['region']={'North America':'Americas','South America':'Americas','Middle East':'Asia','Seven seas (open ocean)':'Other'}.get(r.get('region'),r.get('region','Unassigned'))
 r['years']=sorted(set(r['years']),key=lambda y:9999 if y=='modern' else y)
 if id in profiles:write(OUT/'profiles'/f'{id}.json',profiles[id])
records=sorted(records.values(),key=lambda r:r['name'].casefold())
manifest={'edition':'2026-10-30','records':records,'snapshots':snapshots,'coverage':{'records':len(records),'boundarySnapshots':len(snapshots),'modernMapUnits':258,'researchedProfiles':sum(p.get('coverage')=='researched' for p in profiles.values()),'countryProfiles':sum(p.get('coverage')=='country-reference' for p in profiles.values()),'historicalMetadata':1015,'quarantinedBoundaries':len(quarantined),'complete':False},'sources':[{'title':'Historical Basemaps · André Ourednik and contributors','url':'https://github.com/aourednik/historical-basemaps','license':'GPL-3.0','role':'Dated reconstructed boundaries; not a complete or independently verified chronology.'},{'title':'Natural Earth','url':'https://www.naturalearthdata.com/about/terms-of-use/','license':'Public domain','role':'Modern reference geography; de facto baseline with separate disputed/claim polygons.'},{'title':'AtlasPI','url':'https://atlaspi.it','license':'Apache-2.0','role':'Imported historical names, periods, capitals and bibliographies. Polygon approximations were not imported.'},{'title':'World Factbook JSON archive','url':'https://github.com/factbook/factbook.json','license':'Public-domain US government text','role':'Archived country profiles. Not live officeholder, economic or military data.'}]}
write(OUT/'catalogue.json',manifest)
inputs=[*sorted((R/'maps').glob('*.geojson')),*sorted((R/'countries').glob('*.json')),*[R/x for x in ['atlas-index.json','atlas-index-500.json','atlas-index-1000.json','history-index.json','factbook-tree.json','ne-countries.geojson','ne-disputed.geojson','ne-version.txt']],*[curated_file(x) for x in ['curated-targets.json','boundary-aliases.json','historical-profiles-west.json','historical-profiles-east.json','contested-actors.json']]]
write(OUT/'source-manifest.json',{'retrieved':'2026-10-30','files':[{'file':str(f.relative_to(R)) if f.is_relative_to(R) else 'curated/'+f.name,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()} for f in inputs],'factbookTree':json.load(open(R/'factbook-tree.json')).get('sha'),'naturalEarthVersion':version,'transform':'Five decimal coordinate encoding; original polygon vertices, holes and multipolygons retained. No interpolation or fabricated control extents.'})
for src,target in [('history-license.txt','historical-basemaps-GPL-3.0.txt'),('atlas-license.txt','atlaspi-Apache-2.0.txt')]:
 if (R/src).exists():(OUT/'licenses'/target).write_bytes((R/src).read_bytes())
write(OUT/'quarantined-boundaries.json',quarantined);print(json.dumps(manifest['coverage'],indent=2));write(P/'docs/unmatched-boundary-names.json',dict(unmatched))

# Keep the explicitly selected India boundary convention after every rebuild.
from india_boundary import apply_india_boundary
apply_india_boundary(P)

# Selected dated India milestones must survive a complete source re-import.
import os
if not os.environ.get('PRELOG_SKIP_POSTWAR'):
 from postwar_india import apply_postwar_india
 apply_postwar_india(P)
