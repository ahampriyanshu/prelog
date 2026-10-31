import test from 'node:test';
import assert from 'node:assert/strict';
import {symbolTerritories,interiorEmblem,polygonClearance} from '../src/territory-symbols.js';
import {geometryContains} from '../src/polity-engine.js';
const square=(x,y,size)=>[[x,y],[x+size,y],[x+size,y+size],[x,y+size],[x,y]];
test('territory image extents follow disconnected land masses and preserve polygon holes',()=>{
 const ring=square(0,0,20),hole=square(5,5,3),island=square(100,40,4);
 const geometry={type:'MultiPolygon',coordinates:[[ring,hole],[island]]};
 const regions=symbolTerritories(geometry);
 assert.equal(regions.length,2);assert.deepEqual(regions[0].bounds,[0,0,20,20]);assert.deepEqual(regions[1].bounds,[100,40,104,44]);
 assert.equal((regions[0].path.match(/M/g)||[]).length,2);
 assert.deepEqual(regions[0].geometry.coordinates,[ring,hole]);
 assert.equal(geometryContains(regions[0].geometry,[6,6]),false);
});
test('emblem placement stays inside concave territory instead of a bounding-box centre',()=>{
 const polygon=[[[0,0],[12,0],[12,2],[2,2],[2,12],[0,12],[0,0]]];
 const spot=interiorEmblem(polygon,[0,0,12,12]);assert.ok(spot&&spot.radius>0);
 assert.equal(geometryContains({type:'Polygon',coordinates:polygon},[6,6]),false);
 assert.ok(geometryContains({type:'Polygon',coordinates:polygon},spot.point));
 for(let i=0;i<32;i++){const angle=i*Math.PI/16;assert.ok(geometryContains({type:'Polygon',coordinates:polygon},[spot.point[0]+Math.cos(angle)*spot.radius,spot.point[1]+Math.sin(angle)*spot.radius]));}
});
test('emblem placement excludes holes and keeps a complete circular footprint within land',()=>{
 const polygon=[square(0,0,20),square(6,6,8)],spot=interiorEmblem(polygon,[0,0,20,20]);
 assert.ok(spot);assert.ok(polygonClearance(spot.point,polygon)>spot.radius);
 for(let i=0;i<32;i++){const angle=i*Math.PI/16;assert.ok(geometryContains({type:'Polygon',coordinates:polygon},[spot.point[0]+Math.cos(angle)*spot.radius,spot.point[1]+Math.sin(angle)*spot.radius]));}
 assert.equal(interiorEmblem([[[1,1],[1,1],[1,1]]],[1,1,1,1]),null);
});

import fs from 'node:fs';
import crypto from 'node:crypto';
import {selectSymbol} from '../src/polity-symbols.js';
import {boundaryForYear} from '../src/political-time.js';
const read=name=>JSON.parse(fs.readFileSync(new URL('../data/empires/'+name+'.json',import.meta.url)));
const packs=['early-western-symbols','early-asian-symbols','early-american-symbols','historical-symbol-identities'];
const all={};for(const name of ['historical-symbols',...packs])for(const [id,entries] of Object.entries(read(name)))all[id]=[...(all[id]||[]),...entries];
const catalogue=JSON.parse(fs.readFileSync(new URL('../public/atlas/catalogue.json',import.meta.url)));
const ratios=read('symbol-image-sizes');
test('early evidence resolves exact catalogue identities, original assets, dates and licenses',()=>{
 const ids=new Set(catalogue.records.map(r=>r.id));
 for(const name of packs)for(const [id,entries] of Object.entries(read(name))){
  assert.ok(ids.has(id),id);
  for(const entry of entries){
   assert.ok(entry.start<=entry.end&&!entry.modernOnly&&entry.start!==0&&entry.end!==0,id);
   assert.ok(entry.note&&entry.license&&entry.attribution&&entry.sourceUrl.startsWith('https://'),id);
   const bytes=fs.readFileSync(new URL('../public'+entry.src,import.meta.url));
   if(entry.sha256)assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),entry.sha256,entry.src);
   assert.ok(ratios[entry.src]>0&&Number.isFinite(ratios[entry.src]),entry.src);
   if(entry.src.endsWith('.svg')){const svg=bytes.toString();assert.match(svg,/<svg\b/);assert.doesNotMatch(svg,/<script\b|<foreignObject\b|\bonload\s*=|\bonerror\s*=/i);}
   else assert.ok(bytes[0]===255&&bytes[1]===216||bytes.subarray(1,4).toString()==='PNG',entry.src);
   if(entry.mapCrop){const [x,y,w,h]=entry.mapCrop;assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=1.000001&&y+h<=1.000001,entry.src);}
  }
 }
});
test('viewing year reveals dated early symbols between boundary records without backdating them',()=>{
 const time={year:-250},map=boundaryForYear(catalogue.snapshots,time.year);
 assert.equal(map.year,-300);assert.equal(selectSymbol(all['atlas-37'],map),null);
 assert.match(selectSymbol(all['atlas-37'],time).label,/Sarnath/);
 assert.equal(selectSymbol(all['atlas-37'],{year:-251}),null);
 assert.equal(selectSymbol(all['atlas-37'],{year:-231}),null);
 assert.equal(selectSymbol(all['atlas-56'],{year:1200}),null);
 assert.ok(selectSymbol(all['atlas-56'],{year:1225}));
 assert.ok(selectSymbol(all['atlas-110'],{year:1025}));
});
test('explicit flag identity joins cover historical records without extending across excluded regimes',()=>{
 assert.ok(selectSymbol(all['map-united-kingdom-of-great-britain-and-ireland'],{year:1900}));
 assert.equal(selectSymbol(all['map-united-kingdom-of-great-britain-and-ireland'],{year:1930}),null);
 assert.ok(selectSymbol(all['map-united-kingdom'],{year:1750}));
 assert.ok(selectSymbol(all['map-united-kingdom'],{year:2015}));
 assert.equal(selectSymbol(all['atlas-246'],{year:1945}),null);
 assert.equal(selectSymbol(all['map-spain'],{year:1938}),null);
 assert.equal(selectSymbol(all['atlas-15'],{year:1700}),null);
 assert.match(selectSymbol(all['atlas-15'],{year:1650}).label,/robe/);
 assert.match(selectSymbol(all['atlas-15'],{year:1900}).label,/1889/);
});
