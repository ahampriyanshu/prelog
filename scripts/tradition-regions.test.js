import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {regionalSettingsAt,datedBaseShapes} from '../src/tradition-regions.js';
import {populationRecordFor} from '../src/religion-population.js';
import {coverage,coverageById,areas} from '../src/coverage-data.js';
const pew=JSON.parse(fs.readFileSync(new URL('../public/atlas/religion/composition.json',import.meta.url)));

test('regional settings retain their complete sourced area rather than isolated growing centres',()=>{
 const regions=regionalSettingsAt(coverage,-600);
 const ganges=regions.find(r=>r.area==='ganges');
 assert.ok(ganges);
 assert.deepEqual(ganges.ring,areas.ganges);
 assert.ok(ganges.items.some(i=>i.id==='vedic'));
 assert.ok(!regions.some(r=>r.items.some(i=>i.id==='islam')));
});
test('regional settings retain coexisting schools and dated decline',()=>{
 const regions=regionalSettingsAt(coverage,1200);
 assert.ok(regions.find(r=>r.area==='ganges').items.length>3);
 assert.ok(regions.some(r=>r.items.some(i=>i.id==='advaita')));
 assert.ok(!regionalSettingsAt([coverageById.mesopotamia],700).length);
});
test('dated figures never leak into earlier years or replace newer observed figures',()=>{
 const data={...pew,historical:{source:'World Religion Project',countries:{India:{1950:{shares:{hindu:84},branches:[]},2000:{shares:{hindu:80},branches:[]}}}}};
 assert.equal(populationRecordFor(data,'India',1949),null);
 assert.equal(populationRecordFor(data,'India',1954).year,1950);
 assert.equal(populationRecordFor(data,'India',2010).year,2010);
 assert.equal(populationRecordFor(data,'India',2026).year,2020);
 assert.equal(populationRecordFor(data,'India',2026).shares.hindu,pew.countries.India[2020].hindu);
});
const historical=JSON.parse(fs.readFileSync(new URL('../public/atlas/religion/history.json',import.meta.url)));
test('historical joins exclude larger predecessor populations rather than coloring modern successors',()=>{
 const data={...pew,historical};
 assert.equal(populationRecordFor(data,'Russia',1985),null);
 assert.equal(populationRecordFor(data,'India',1945),null);
 assert.equal(populationRecordFor(data,'Pakistan',1965),null);
 assert.equal(populationRecordFor(data,'Ethiopia',1990),null);
 assert.equal(historical.countries.Sudan,undefined);
 assert.equal(populationRecordFor(data,'India',1950).year,1950);
 assert.equal(populationRecordFor(data,'Pakistan',1975).year,1975);
 assert.equal(populationRecordFor(data,'Ethiopia',1995).year,1995);
});
test('historical data retain dated, named affiliations and explicit source coverage',()=>{
 const india=populationRecordFor({...pew,historical},'India',2005);
 assert.ok(india.branches.some(b=>b.name==='Sunni Islam'));
 assert.ok(india.branches.some(b=>b.name==='Jainism'));
 assert.ok(Object.keys(historical.countries).length>180);
 for(const rows of Object.values(historical.countries))for(const [year,row] of Object.entries(rows)){
  assert.ok(Number(year)>=1945&&Number(year)<=2010&&Number(year)%5===0);
  assert.equal(Object.keys(row.shares).length,7);
  assert.ok(Object.values(row.shares).every(x=>Number.isFinite(x)&&x>=0));
 }
});

test('rewinding removes future country observations even from outgoing transition layers',()=>{
 const older={kind:'country',record:{year:1950}},newer={kind:'country',record:{year:2020}},region={kind:'region'};
 assert.deepEqual(datedBaseShapes([older,newer,region],2010),[older,region]);
 assert.deepEqual(datedBaseShapes([older,newer,region],1940),[region]);
});
import * as navigation from '../src/thought-map.js';
import {projectPoint} from '../src/coverage-engine.js';
const world=JSON.parse(fs.readFileSync(new URL('../public/atlas/maps/modern.json',import.meta.url)));
test('country selection remains above the phone sheet in both hemispheres',()=>{
 assert.equal(typeof navigation.focusRegionalCamera,'function');
 for(const [id,point] of [['country-ind',[79,23]],['country-aus',[134,-25]],['country-egy',[30,27]]]){
  const geometry=world.features.find(f=>f.properties.id===id).geometry;
  const camera=navigation.focusRegionalCamera(geometry,432,988);
  const [x,y]=projectPoint(point,432,988,camera);
  assert.ok(x>12&&x<420,`${id} outside phone width at ${x}`);
  assert.ok(y>116&&y<315,`${id} hidden behind phone controls/sheet at ${y}`);
 }
});
