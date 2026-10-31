import test from 'node:test';
import assert from 'node:assert/strict';
import { nodes, scopes } from '../src/data.js';
import { WORLD, scopeNodes } from '../src/engine.js';
import { places } from '../src/geography.js';
import { timeProgress, yearAtProgress, scrollYear, followYear, project, mapClusters, cameraForScope, TIME_END } from '../src/map-engine.js';
const worldCamera = { lon: 0, lat: 15, zoom: 1 };
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-7, `${a} ≠ ${b}`);

test('every historical moment has a valid, named geographic setting', () => {
  assert.deepEqual(Object.keys(places).sort(), nodes.map(n=>n.id).sort());
  for(const place of Object.values(places)) {
    assert.ok(place.name.length>3);
    assert.ok(Number.isFinite(place.lon) && Math.abs(place.lon)<=180);
    assert.ok(Number.isFinite(place.lat) && Math.abs(place.lat)<=90);
  }
});

test('shared time controls round-trip across ancient and modern eras', () => {
  const years=[WORLD[0],-3000,-2600,-1500,-800,-301,0,799,1700,1848,1950,2025];
  for(const year of years) close(yearAtProgress(timeProgress(year)),year);
  for(let i=1;i<years.length;i++) assert.ok(timeProgress(years[i])>timeProgress(years[i-1]));
  assert.equal(yearAtProgress(-1),WORLD[0]);
  assert.equal(yearAtProgress(2),TIME_END);
});

test('scrolling forwards then backwards restores time and clamps both ends', () => {
  for(const year of [-3000,-500,800,1800,1950]) {
    const future=scrollYear(year,120);
    assert.ok(future>year);
    close(scrollYear(future,-120),year);
  }
  assert.equal(scrollYear(WORLD[0],-1000),WORLD[0]);
  assert.equal(scrollYear(TIME_END,1000),TIME_END);
  for(const year of [WORLD[0],-2600,0,1800,TIME_END]) {
    const range=followYear(year,[-3250,-1950]);
    assert.ok(range[0]<=year && year<=range[1]);
    close(range[1]-range[0],1300);
  }
});

test('map reveals only reached moments and rewinding removes later moments', () => {
  for(const year of [WORLD[0],-2600,-500,800,1900,TIME_END]) {
    const clusters=mapClusters(nodes,year,1400,700,worldCamera);
    const ids=clusters.flatMap(c=>c.nodes.map(n=>n.id)).sort();
    assert.deepEqual(ids,nodes.filter(n=>n.year<=year).map(n=>n.id).sort());
    assert.equal(new Set(ids).size,ids.length);
  }
  assert.equal(mapClusters(nodes,WORLD[0],1400,700,worldCamera).length,0);
});

test('grouped markers retain every moment and the selected representative', () => {
  const clusters=mapClusters(nodes,TIME_END,800,500,worldCamera);
  const group=clusters.find(c=>c.nodes.length>1);
  assert.ok(group);
  const id=group.nodes[0].id;
  const selected=mapClusters(nodes,TIME_END,800,500,worldCamera,id).find(c=>c.nodes.some(n=>n.id===id));
  assert.equal(selected.feature.id,id);
  assert.equal(selected.active,true);
});

test('scope cameras and projections remain finite, including empty filters', () => {
  assert.deepEqual(cameraForScope([]),worldCamera);
  for(const id of Object.keys(scopes)) {
    const camera=cameraForScope(scopeNodes(id));
    assert.ok(Object.values(camera).every(Number.isFinite));
    assert.ok(camera.zoom>=1 && camera.zoom<=9);
    const p=project(camera.lon,camera.lat,1000,600,camera);
    assert.deepEqual(p,{x:500,y:300});
  }
});
