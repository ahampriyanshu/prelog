import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {geometryContains} from '../src/polity-engine.js';
const root=new URL('../public/atlas/',import.meta.url);
const map=JSON.parse(fs.readFileSync(new URL('maps/modern.json',root)));
const india=map.features.find(f=>f.properties.id==='country-ind');
// These interior places catch the previous de-facto outline and overlay picking.
const places=[['Gilgit',[74.30,35.92]],['Skardu',[75.63,35.30]],['Muzaffarabad',[73.47,34.37]],['Aksai Chin',[79.2,35.2]],['Shaksgam valley',[76.5,36]],['Arunachal Pradesh',[95,28]],['Srinagar',[74.79,34.08]],['New Delhi',[77.21,28.61]]];
test('India follows the government outline across its northern and northeastern territory',()=>{
 for(const [name,point] of places)assert.ok(geometryContains(india.geometry,point),name+' missing from India outline');
});
test('India territory has one flag and one picking identity, without conflicting claim overlays',()=>{
 for(const [name,point] of places){
  const hits=map.features.filter(f=>geometryContains(f.geometry,point)).map(f=>f.properties.id);
  assert.deepEqual(hits,['country-ind'],name+' must select India in this boundary view');
 }
});
test('India boundary adjustment keeps neighbouring capitals outside its outline',()=>{
 for(const [name,point] of [['Islamabad',[73.05,33.69]],['Kathmandu',[85.32,27.72]],['Thimphu',[89.64,27.47]],['Dhaka',[90.41,23.81]],['Lhasa',[91.13,29.65]]])assert.equal(geometryContains(india.geometry,point),false,name);
});
