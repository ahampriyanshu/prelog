"""Rebuild dated WRP estimates using the official COW country crosswalk."""
import csv, json
from pathlib import Path
root=Path(__file__).resolve().parent.parent
names={r['StateAbb']:r['StateNme'] for r in csv.DictReader((root/'data/religion/cow-country-codes.csv').open(encoding='utf-8-sig'))}
aliases={'United States of America':'United States','Antigua & Barbuda':'Antigua and Barbuda','St. Kitts and Nevis':'Saint Kitts and Nevis','Macedonia':'North Macedonia','Sao Tome and Principe':'São Tomé and Príncipe','Congo':'Republic of the Congo','Swaziland':'Eswatini','East Timor':'Timor-Leste'}
# These observations refer to larger/different historical units. They must not
# silently become estimates for one present-day successor's territory.
excluded={'GFR','GDR','CZE','YUG','YAR','YPR','RVN','SUD'}
branches={'chrstprot':('Protestantism','christian','protestant'),'chrstcat':('Roman Catholicism','christian','catholic'),'chrstorth':('Orthodox Christianity','christian','orthodox-christianity'),'chrstang':('Anglicanism','christian','anglican'),'judorth':('Orthodox Judaism','jewish','orthodox-judaism'),'judcons':('Conservative Judaism','jewish','conservative-judaism'),'judref':('Reform Judaism','jewish','reform-judaism'),'islmsun':('Sunni Islam','islam','sunni'),'islmshi':('Shiʿi Islam','islam','shia'),'islmibd':('Ibadi Islam','islam','ibadi'),'islmahm':('Ahmadiyya','islam','ahmadiyya'),'budmah':('Mahāyāna','buddhist','mahayana'),'budthr':('Theravāda','buddhist','theravada'),'sikhgen':('Sikhism','other','sikh'),'jaingen':('Jainism','other','jainism'),'taogen':('Daoism','other','religious-daoism'),'confgen':('Confucianism','other','confucian'),'shntgen':('Shintō','other','shinto'),'zorogen':('Zoroastrianism','other','zoroastrian'),'bahgen':('Bahá’í Faith','other','bahai')}
countries={};skipped=[]
for row in csv.DictReader((root/'data/religion/wrp-national-1.1.csv').open(encoding='utf-8-sig')):
 code=row['name'];year=int(row['year'])
 if code in excluded or (code=='RUS' and year<1992) or (code=='DRV' and year<1976) or (code=='GMY' and year<1990) or (code=='IND' and year<1947) or (code=='PAK' and year<1971) or (code=='ETH' and year<1993):
  skipped.append([code,year]);continue
 name=aliases.get(names.get(code),names.get(code))
 if not name: raise ValueError(code)
 def pct(field):
  value=float(row.get(field,'0') or 0)
  return round(value*100,2) if value>=0 else None
 shares={k:pct(v+'pct') for k,v in [('christian','chrstgen'),('jewish','judgen'),('islam','islmgen'),('buddhist','budgen'),('hindu','hindgen'),('unaffiliated','nonrelig')]}
 extra=[pct(f+'pct') for f in ['zorogen','sikhgen','shntgen','bahgen','taogen','jaingen','confgen','syncgen','anmgen','othrgen']]
 shares['other']=round(sum(v for v in extra if v is not None),2)
 if any(v is None for v in shares.values()): continue
 detail=[{'name':label,'group':group,'id':key,'share':share} for field,(label,group,key) in branches.items() if (share:=pct(field+'pct')) is not None and share>0]
 countries.setdefault(name,{})[year]={'shares':shares,'branches':detail,'overlap':row['dualrelig']!='0','quality':row['reliabilevel']}
result={'source':'World Religion Project 1.1','url':'https://correlatesofwar.org/data-sets/world-religion-data/','citation':'Maoz, Zeev, and Errol A. Henderson. 2013. The World Religion Dataset, 1945–2010: Logic, Estimates, and Trends. International Interactions 39: 265–291.','years':list(range(1945,2011,5)),'countries':countries,'excludedHistoricalUnits':sorted(excluded),'geometryNote':'Reference geography is used for reporting areas; these are not historical political borders. Obsolete units are not assigned to successors.'}
(root/'public/atlas/religion/history.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n')
print(f'Built {sum(map(len,countries.values()))} observations for {len(countries)} reporting areas; excluded {len(skipped)} obsolete-unit observations.')
