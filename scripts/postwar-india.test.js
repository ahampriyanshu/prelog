import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {geometryContains,snapshotLabel} from '../src/polity-engine.js';
import {buildTimeStops,boundaryForYear,stepTime} from '../src/political-time.js';
const root=new URL('../public/atlas/',import.meta.url);
const catalogue=JSON.parse(fs.readFileSync(new URL('catalogue.json',root)));
const mapAt=year=>JSON.parse(fs.readFileSync(new URL('maps/'+boundaryForYear(catalogue.snapshots,year).file,root)));
const owners=(year,point)=>mapAt(year).features.filter(f=>geometryContains(f.geometry,point)).map(f=>f.properties.id);
test('2020 leads straight to Today, and reversing returns to 2020',()=>{
 const stops=buildTimeStops(catalogue.snapshots);
 assert.deepEqual(stops.slice(-2),[2020,'modern']);
 assert.equal(stepTime(stops,2020,1),'modern');assert.equal(stepTime(stops,'modern',-1),2020);
 assert.equal(snapshotLabel(catalogue.snapshots.at(-1)),'Today');
});
test('independence and regional accession dates are explicit reversible stops',()=>{
 const stops=buildTimeStops(catalogue.snapshots);
 for(const year of [1947,1948,1961,1971,1975]){
  assert.ok(stops.includes(year),String(year));assert.equal(boundaryForYear(catalogue.snapshots,year).year,year);
  assert.equal(stepTime(stops,stepTime(stops,year,1),-1),year);
 }
 assert.deepEqual(owners(1945,[77.21,28.61]),['atlas-5']);
});
test('government India boundary is present from independence, including Kashmir by 1948',()=>{
 for(const year of [1947,1948,1960,1961,1971,1975,1994,2000,2010,2020])
 for(const point of [[77.21,28.61],[74.30,35.92],[75.63,35.30],[73.47,34.37],[79.2,35.2],[76.5,36],[95,28]])
  assert.deepEqual(owners(year,point),['country-ind'],`${year} ${point}`);
});
test('Goa and Sikkim merge at their dated transitions, not before',()=>{
 assert.deepEqual(owners(1960,[73.83,15.49]),['curated-portuguese-goa']);
 assert.deepEqual(owners(1961,[73.83,15.49]),['country-ind']);
 assert.deepEqual(owners(1971,[88.61,27.33]),['curated-kingdom-sikkim']);
 assert.deepEqual(owners(1975,[88.61,27.33]),['country-ind']);
 assert.deepEqual(owners(1948,[79.83,11.93]),['curated-french-india']);
 assert.deepEqual(owners(1954,[79.83,11.93]),['country-ind']);
});
test('the regional update does not leave independent Bangladesh before 1971',()=>{
 assert.deepEqual(owners(1960,[90.41,23.81]),['map-pakistan']);
 assert.deepEqual(owners(1971,[90.41,23.81]),['atlas-236']);
});

import {selectSymbol} from '../src/polity-symbols.js';
const flags=JSON.parse(fs.readFileSync(new URL('../data/empires/dated-national-symbols.json',import.meta.url)));
test('dated national flags appear at adoption, not only in the Today layer',()=>{
 for(const [id,start] of [['country-ind',1947],['map-pakistan',1947],['map-china',1949],['map-united-states',1960],['map-canada',1965],['atlas-236',1972],['map-australia',1908],['map-italy',1946],['map-germany',1990]]){
  assert.equal(selectSymbol(flags[id],{year:start-1}),null,id+' before adoption');
  assert.ok(selectSymbol(flags[id],{year:start}),id+' at adoption');
  assert.ok(selectSymbol(flags[id],{year:2020}),id+' in final numbered year');
 }
 const ids=new Set(catalogue.records.map(r=>r.id));
 for(const [id,entries] of Object.entries(flags)){
  assert.ok(ids.has(id),id);
  for(const flag of entries){
   assert.ok(flag.start<=flag.end);assert.ok(flag.sourceUrl&&flag.license&&flag.attribution);
   assert.match(fs.readFileSync(new URL('../public'+flag.src,import.meta.url),'utf8'),/<svg\b/);
  }
 }
});
test('regional dates retain their original world source and documented limits',()=>{
 for(const year of [1947,1948,1954,1961,1971,1975]){
  const s=boundaryForYear(catalogue.snapshots,year);
  assert.ok(s.worldSourceYear<=s.year);assert.ok(s.regionalUpdate);
  assert.equal(mapAt(year).regionalUpdate.worldSourceYear,s.worldSourceYear);
 }
 const provenance=JSON.parse(fs.readFileSync(new URL('india-postwar-provenance.json',root)));
 assert.match(provenance.boundaryConvention,/26 October 1947/);
 assert.match(provenance.geometry,/approximations/);
});
