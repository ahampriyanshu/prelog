import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {snapshotYear,compositionFor,rankedGroups,buildPopulationFeatures} from '../src/religion-population.js';
import {nodes} from '../src/data.js';
const map=JSON.parse(fs.readFileSync(new URL('../public/atlas/maps/modern.json',import.meta.url)));
const data=JSON.parse(fs.readFileSync(new URL('../public/atlas/religion/composition.json',import.meta.url)));

test('population snapshots never appear before observation or invent intermediate estimates',()=>{
 assert.equal(snapshotYear(2009),null);assert.equal(snapshotYear(2010),2010);
 assert.equal(snapshotYear(2019),2010);assert.equal(snapshotYear(2020),2020);assert.equal(snapshotYear(2025),2020);
 assert.equal(compositionFor(data,'India',2000),null);
});
test('all 201 measured countries map explicitly; smaller unsurveyed places remain unknown',()=>{
 const features=buildPopulationFeatures(map,data);
 const mapped=new Set(features.map(f=>f.properties.demographicCountry).filter(Boolean));
 assert.equal(mapped.size,201);assert.deepEqual([...mapped].sort(),Object.keys(data.countries).sort());
 assert.equal(features.find(f=>f.properties.id==='country-grl').properties.demographicCountry,null);
 assert.ok(features.every(f=>!f.properties.id.startsWith('claim-')));
 for(const feature of features)if(feature.properties.demographicCountry){
  for(const year of [2010,2020]){
   const shares=compositionFor(data,feature.properties.demographicCountry,year);
   assert.equal(Object.keys(shares).length,7);
   assert.ok(Math.abs(Object.values(shares).reduce((a,b)=>a+b,0)-100)<.5);
  }
 }
});
test('population map preserves the approved India outline and separates overseas datasets',()=>{
 const features=buildPopulationFeatures(map,data);
 assert.deepEqual(features.find(f=>f.properties.id==='country-ind').geometry,map.features.find(f=>f.properties.id==='country-ind').geometry);
 for(const country of ['French Guiana','Martinique','Guadeloupe','Reunion','Channel Islands'])assert.ok(features.some(f=>f.properties.demographicCountry===country),country);
});
test('country compositions retain minority religions and unaffiliated identities',()=>{
 const india=rankedGroups(compositionFor(data,'India',2025));
 assert.equal(india[0].id,'hindu');assert.ok(india.find(g=>g.id==='islam').share>10);
 assert.equal(rankedGroups(compositionFor(data,'China',2025))[0].id,'unaffiliated');
 assert.equal(india.length,7);
});
test('catalogue titles use identifiable names rather than vague placeholders',()=>{
 for(const n of nodes)assert.ok(!/traditions|sacred worlds|flowerings|textual worlds|beliefs|currents/i.test(n.name),n.name);
});
