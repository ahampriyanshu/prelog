import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {coverage} from '../src/coverage-data.js';
import {populationRecordFor} from '../src/religion-population.js';
import {placeAreaLabels} from '../src/map-labels.js';
import * as overview from '../src/tradition-overview.js';
const pew=JSON.parse(fs.readFileSync(new URL('../public/atlas/religion/composition.json',import.meta.url)));
const historical=JSON.parse(fs.readFileSync(new URL('../public/atlas/religion/history.json',import.meta.url)));
const map=JSON.parse(fs.readFileSync(new URL('../public/atlas/maps/modern.json',import.meta.url)));
const feature=name=>map.features.find(f=>f.properties.name===name);

test('base overview includes named sects and philosophies without a zoom threshold',()=>{
 assert.equal(typeof overview.overviewSchoolsAt,'function');
 const ids=new Set(overview.overviewSchoolsAt(coverage,2020).map(s=>s.item.id));
 for(const id of ['advaita','stoicism','sunni','shia','digambara','svetambara','maoism'])assert.ok(ids.has(id),id);
 const early=new Set(overview.overviewSchoolsAt(coverage,-500).map(s=>s.item.id));
 assert.ok(!early.has('maoism'));assert.ok(!early.has('advaita'));
});
test('China overview shows Maoist communism from the PRC period without rewriting religious observations',()=>{
 assert.equal(typeof overview.countryOverview,'function');
 const record=populationRecordFor(pew,'China',2020),before=JSON.stringify(record);
 const display=overview.countryOverview(feature('China'),record,coverage,2020);
 assert.equal(display.name,'Maoist communism');assert.equal(display.schoolId,'maoism');assert.equal(display.kind,'ideology');
 assert.equal(JSON.stringify(record),before);
 const older=populationRecordFor({...pew,historical},'China',1948);
 assert.notEqual(overview.countryOverview(feature('China'),older,coverage,1948).schoolId,'maoism');
 assert.notEqual(overview.countryOverview(feature('Taiwan'),record,coverage,2020).schoolId,'maoism');
});
test('dated source families appear as precise overview names where reported',()=>{
 assert.equal(typeof overview.countryOverview,'function');
 const record=populationRecordFor({...pew,historical},'United States',1950);
 assert.equal(overview.countryOverview(feature('United States of America'),record,coverage,1950).name,'Protestantism');
 assert.ok(record.shares.christian>record.branches.find(b=>b.id==='protestant').share);
});
test('compact base-zoom labels fit small regions without being moved outside their area',()=>{
 const polygon=[[[200,150],[234,150],[234,168],[200,168],[200,150]]];
 const labels=placeAreaLabels([{item:{id:'sunni',name:'Sunni'},regions:[{area:'small',polygon}]}],{width:500,height:400,fontSizes:[10,9,8],textPadding:4,linePadding:2,gapX:2,gapY:2});
 assert.equal(labels.length,1);
 assert.ok(labels[0].fontSize<=10);
 assert.ok(labels[0].samples.every(([x,y])=>x>=200&&x<=234&&y>=150&&y<=168));
});
