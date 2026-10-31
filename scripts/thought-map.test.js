import test from 'node:test';
import assert from 'node:assert/strict';
import {coverage,coverageById} from '../src/coverage-data.js';
import {visibleLabels,footprintAt,projectPoint,inRing} from '../src/coverage-engine.js';
import {thoughtTimeStops,thoughtYear,focusThoughtCamera} from '../src/thought-map.js';
import {stepTime} from '../src/political-time.js';

test('religion time ends at 2020 then Today and reverses across recorded milestones',()=>{
 const stops=thoughtTimeStops(coverage);
 assert.deepEqual(stops.slice(-2),[2020,'modern']);assert.equal(stops[0],-3450);
 assert.equal(stepTime(stops,'modern',-1),2020);assert.equal(stepTime(stops,2020,1),'modern');
 for(const y of [1800,1848,1875,1900,1956])assert.ok(stops.includes(y),String(y));
 assert.ok(thoughtYear('modern')>=2020);assert.equal(thoughtYear(-500),-500);
});
test('map names stay wholly inside their geographic region and do not overlap',()=>{
 const camera={lon:78,lat:22,zoom:5},width=1400,height=900;
 const labels=visibleLabels(coverage,2020,width,height,camera,'advaita');
 assert.ok(labels.some(l=>l.item.id==='advaita'));
 for(const label of labels){
  assert.ok(label.lines.join(' ')===label.item.name);
  assert.ok(!('nearby' in label),'No count badge payload');
  const region=footprintAt(label.item,2020).find(p=>p.area===label.area);
  for(const point of label.samples){
   const projected=region.ring.map(p=>projectPoint(p,width,height,camera));
   assert.ok(inRing(point,projected),label.item.id+' escaped its own overlay');
  }
 }
 for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){
  const a=labels[i].box,b=labels[j].box;
  assert.ok(a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom,`${labels[i].item.id} / ${labels[j].item.id}`);
 }
});
test('a small region keeps its clickable footprint without a displaced label or a count',()=>{
 const item=coverageById.advaita;
 assert.ok(footprintAt(item,2020).length);
 const labels=visibleLabels([item],2020,390,844,{lon:77,lat:20,zoom:1},null);
 assert.equal(labels.length,0);
});

import {placeAreaLabels} from '../src/map-labels.js';
test('labels avoid sea and geographic holes even inside a large bounding box',()=>{
 const square=[[100,150],[500,150],[500,500],[100,500],[100,150]];
 const hole=[[200,250],[400,250],[400,450],[200,450],[200,250]];
 const land=[[[[410,150],[500,150],[500,500],[410,500],[410,150]]]];
 const entries=[{item:{id:'test',name:'A named school'},regions:[{area:'region',polygon:[square,hole]}]}];
 const labels=placeAreaLabels(entries,{width:700,height:700,land});
 assert.equal(labels.length,1);
 for(const label of labels)for(const point of label.samples){assert.ok(inRing(point,land[0][0]));assert.ok(!inRing(point,hole));}
 const none=placeAreaLabels(entries,{width:700,height:700,land:[[[[0,0],[20,0],[20,20],[0,20],[0,0]]]]});
 assert.equal(none.length,0);
});

test('phone selection keeps the chosen setting readable above the detail sheet',()=>{
 for(const [point,id] of [[[65,35],'hanafi'],[[25,-30],'ubuntu']]){
  const item=coverageById[id];
  assert.ok(footprintAt(item,2020).some(p=>inRing(point,p.ring)),id+' test setting must be in its own footprint');
  const previous={lon:60,lat:18,zoom:4.4},camera=focusThoughtCamera(item,2020,previous,432,988,point);
  assert.ok(camera.zoom>=previous.zoom);
  const [x,y]=projectPoint(point,432,988,camera);
  assert.ok(x>12&&x<420);assert.ok(y>116&&y<315,`${id} hidden at ${y}`);
 }
});
