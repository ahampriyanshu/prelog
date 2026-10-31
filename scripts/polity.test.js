import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fitPolity,contemporarySnapshot,snapshotKey,geometryContains,geometryPath,geometryBounds,nearestSnapshot,stepSnapshot,searchPolities,availableYear,validateSnapshot} from '../src/polity-engine.js';
const polygon={type:'Polygon',coordinates:[[[0,0],[10,0],[10,10],[0,10],[0,0]],[[3,3],[7,3],[7,7],[3,7],[3,3]]]};
test('political geometry preserves holes and disconnected territory',()=>{assert.equal(geometryContains(polygon,[1,1]),true);assert.equal(geometryContains(polygon,[5,5]),false);assert.equal(geometryContains(polygon,[12,5]),false);assert.equal((geometryPath(polygon).match(/Z/g)||[]).length,2);assert.deepEqual(geometryBounds(polygon),[0,0,10,10]);const multi={type:'MultiPolygon',coordinates:[polygon.coordinates,[[[20,20],[21,20],[21,21],[20,20]]]]};assert.equal(geometryContains(multi,[20.8,20.3]),true);});
test('travel selects only source snapshots and reverses without inventing boundary years',()=>{const snapshots=[{year:-400},{year:100},{year:1500},{year:2026}];assert.equal(nearestSnapshot(snapshots,1420).year,1500);assert.equal(stepSnapshot(2,1,4),3);assert.equal(stepSnapshot(stepSnapshot(2,-1,4),1,4),2);assert.equal(stepSnapshot(0,-5,4),0);assert.equal(stepSnapshot(3,5,4),3);});
test('catalogue search resolves aliases and respects independent filters',()=>{const records=[{id:'a',name:'Mauryan Empire',aliases:['Maurya'],type:'historical',region:'Asia'},{id:'b',name:'State of Palestine',aliases:['Palestine'],type:'disputed',region:'Asia'}];assert.equal(searchPolities(records,'maurya')[0].id,'a');assert.deepEqual(searchPolities(records,'',{type:'disputed',present:new Set(['a'])}),[]);assert.equal(searchPolities(records,'palestine',{region:'Asia'})[0].id,'b');});
test('unmapped actors do not inherit another entity’s territorial geometry',()=>{const snapshots=[{year:100,file:'100.json'},{year:2026,file:'2026.json'}];assert.equal(availableYear({years:[]},snapshots,snapshots[1]),null);assert.equal(availableYear({years:[100]},snapshots,snapshots[1]),snapshots[0]);assert.throws(()=>validateSnapshot({type:'FeatureCollection',features:[{properties:{id:'x'},geometry:{type:'Point',coordinates:[0,0]}}]}));});
const root=new URL('../public/atlas/',import.meta.url);
test('every shipped snapshot resolves identities and valid finite polygon coordinates',()=>{const catalogue=JSON.parse(fs.readFileSync(new URL('catalogue.json',root))),ids=new Set(catalogue.records.map(r=>r.id));assert.equal(ids.size,catalogue.records.length);let last=-Infinity;for(const s of catalogue.snapshots){if(!s.modern){assert.ok(s.year>last);assert.notEqual(s.year,0);last=s.year;}else{assert.equal(s.year,null);assert.equal(s.observationDate,null);}const d=validateSnapshot(JSON.parse(fs.readFileSync(new URL('maps/'+s.file,root))));assert.equal(d.year,s.year);for(const f of d.features){assert.ok(ids.has(f.properties.id),f.properties.id);assert.ok(catalogue.records.find(r=>r.id===f.properties.id).years.includes(snapshotKey(s)));const polygons=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;for(const p of polygons)for(const r of p){assert.ok(r.length>=4);assert.deepEqual(r[0],r.at(-1),'rings must remain closed');for(const [x,y] of r){assert.ok(Number.isFinite(x)&&Number.isFinite(y));assert.ok(x>=-180.001&&x<=180.001&&y>=-90&&y<=90,`${x},${y}`);}}}}});
test('source records keep modern disputes separate and make incomplete coverage explicit',()=>{const d=JSON.parse(fs.readFileSync(new URL('catalogue.json',root)));assert.equal(d.coverage.complete,false);assert.equal(d.coverage.sourceModernMapUnits,258);assert.equal(d.coverage.modernMapUnits,257);for(const id of ['country-psx','country-twn','country-sah']){const r=d.records.find(x=>x.id===id);assert.equal(r.type,'disputed');const p=JSON.parse(fs.readFileSync(new URL('profiles/'+r.profile,root)));assert.ok(p.recognition);assert.ok(p.asOf);}for(const id of ['actor-hamas','actor-houthis','actor-al-qaeda','actor-isis']){const r=d.records.find(x=>x.id===id);assert.equal(r.type,'non-state');assert.deepEqual(r.years,[]);}const map=JSON.parse(fs.readFileSync(new URL('maps/modern.json',root)));assert.notEqual(map.features.find(f=>f.properties.id==='country-psx').properties.subject,map.features.find(f=>f.properties.id==='country-isr').properties.subject);});

test('modern reference is not treated as a dated historical observation',()=>{const snapshots=[{year:1500},{year:2010},{year:null,modern:true}];assert.equal(nearestSnapshot(snapshots,2026).year,2010);assert.equal(contemporarySnapshot({type:'non-state',start:1987,end:null,years:[]},snapshots,snapshots[0]),snapshots[2]);assert.equal(contemporarySnapshot({type:'historical',start:1400,end:1600,years:[1500]},snapshots,snapshots[2]),snapshots[0]);});
test('reviewed identity matches cannot overwrite other dynasties or geographic entities',()=>{const profile=id=>JSON.parse(fs.readFileSync(new URL('profiles/'+id+'.json',root)));assert.notEqual(profile('atlas-3').name,'Byzantine Empire');assert.notEqual(profile('atlas-503').name,'Byzantine Empire');assert.equal(profile('atlas-103').name,'Qin Empire');assert.equal(profile('atlas-104').name,'Han Empire');assert.notEqual(profile('atlas-170').name,'Neo-Assyrian Empire');const d=JSON.parse(fs.readFileSync(new URL('catalogue.json',root)));for(const id of ['country-hkg','country-mac','country-grl'])assert.equal(d.records.find(r=>r.id===id).type,'territory');for(const id of ['country-sol','country-cyn'])assert.equal(d.records.find(r=>r.id===id).typeLabel,'Disputed polity');});


test('archived country extraction preserves currencies, capital qualifications and observation dates',()=>{
 const profile=id=>JSON.parse(fs.readFileSync(new URL('profiles/country-'+id+'.json',root)));
 assert.equal(profile('usa').currency,'US dollar (USD)');
 assert.equal(profile('ecu').currency,'US dollar (USD)');
 assert.match(profile('nor').currency,/Norwegian/);
 assert.match(profile('sds').currency,/South Sudanese/);
 assert.match(profile('nld').capital,/The Hague/);
 assert.match(profile('msr').capital,/Brades/);
 assert.match(profile('lby').military,/Libyan National Army/);
 assert.match(profile('yem').military,/Houthi/);
 assert.match(profile('sdn').military,/personal command/);
 assert.match(profile('usa').asOf,/Archived/);
 for(const file of fs.readdirSync(new URL('profiles/',root))){
  const p=JSON.parse(fs.readFileSync(new URL('profiles/'+file,root)));
  if(p.coverage!=='country-reference')continue;
  for(const date of (p.sourceFields?.military||'').match(/\([^)]*\b(?:19|20)\d{2}[^)]*\)/g)||[])assert.ok(p.military.includes(date),file+' lost '+date);
 }
});
test('mobile entity focus keeps its centre above the detail sheet',()=>{
 const map=JSON.parse(fs.readFileSync(new URL('maps/modern.json',root))),f=map.features.find(f=>f.properties.id==='country-ind');
 const width=390,height=844,bottom=height*.52+100,c=fitPolity(f,width,height,0,bottom),b=geometryBounds(f.geometry),scale=Math.min(width/370,height/170)*c.zoom;
 const y=height/2-((b[1]+b[3])/2-c.lat)*scale;
 assert.ok(y>110&&y<height-bottom,`focused centre ${y} should be in visible map`);
});

test('map unit classifications preserve sovereign and associated states',()=>{const d=JSON.parse(fs.readFileSync(new URL('catalogue.json',root)));for(const id of ['country-cub','country-kaz','country-isr','country-cok','country-niu'])assert.equal(d.records.find(r=>r.id===id).type,'state',id);});

test('reviewed historical boundary aliases join only their reviewed years',()=>{const joins=JSON.parse(fs.readFileSync(new URL('../data/empires/curated/boundary-aliases.json',import.meta.url)));for(const join of joins){for(const year of [...join.observedYears,...join.excludedYears]){const map=JSON.parse(fs.readFileSync(new URL('maps/'+year+'.json',root)));const features=map.features.filter(f=>f.properties.sourceName===join.sourceName);if(join.observedYears.includes(year))assert.ok(features.some(f=>f.properties.id===join.targetId),join.sourceName+' '+year);else assert.ok(features.every(f=>f.properties.id!==join.targetId),join.sourceName+' '+year+' must not attach');if(join.quarantineYears.includes(year))assert.equal(features.length,0);}}});
