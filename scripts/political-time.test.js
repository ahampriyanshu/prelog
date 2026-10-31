import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildTimeStops,timeResolution,timePosition,stepTime,boundaryForYear,wheelBudget,clampPoliticalYear} from '../src/political-time.js';
import {selectSymbol} from '../src/polity-symbols.js';
const catalogue=JSON.parse(fs.readFileSync(new URL('../public/atlas/catalogue.json',import.meta.url)));
const stops=buildTimeStops(catalogue.snapshots);
test('adaptive time gives progressively finer navigation without skipping source dates',()=>{
 assert.equal(timeResolution(-501),250);assert.equal(timeResolution(-500),50);
 assert.equal(timeResolution(1),25);assert.equal(timeResolution(1500),20);
 assert.equal(timeResolution(1700),10);assert.equal(timeResolution(1800),5);
 assert.equal(stepTime(stops,1700,1),1710);assert.equal(stepTime(stops,1800,1),1805);
 assert.equal(stepTime(stops,1805,-1),1800);
 for(const s of catalogue.snapshots)assert.ok(stops.includes(s.modern?'modern':s.year));
 assert.ok(!stops.includes(0));assert.equal(new Set(stops).size,stops.length);
});
test('navigation reverses at every step and clamps its endpoints',()=>{
 for(let i=0;i<stops.length-1;i++)assert.equal(stepTime(stops,stepTime(stops,stops[i],1),-1),stops[i]);
 assert.equal(stepTime(stops,stops[0],-1),stops[0]);assert.equal(stepTime(stops,'modern',1),'modern');
 assert.equal(clampPoliticalYear(0),1);assert.equal(clampPoliticalYear(-9000),-4000);assert.equal(clampPoliticalYear(5000),2025);
});
test('custom dates retain their position and never borrow future boundary evidence',()=>{
 const s=boundaryForYear(catalogue.snapshots,1776);assert.ok(s.year<=1776);
 assert.equal(boundaryForYear(catalogue.snapshots,1805).year,1800);
 assert.equal(stepTime(stops,1803,-1),1800);assert.equal(stepTime(stops,1803,1),1805);
 assert.ok(!stops.includes(1776));
 const pos=timePosition(stops,1776);assert.ok(pos>stops.indexOf(1770)&&pos<stops.indexOf(1780));
 for(const y of stops.filter(y=>y!=='modern'))assert.ok(boundaryForYear(catalogue.snapshots,y).year<=y);
 assert.ok(boundaryForYear(catalogue.snapshots,'modern').modern);
});
test('wheel momentum is bounded and reversing a gesture discards old momentum',()=>{
 assert.equal(wheelBudget(220,1000),240);assert.equal(wheelBudget(-220,-1000),-240);
 assert.equal(wheelBudget(220,-50),-50);assert.equal(wheelBudget(-200,20),20);
 assert.equal(wheelBudget(20,30),50);
});
const modern=JSON.parse(fs.readFileSync(new URL('../data/empires/modern-symbols.json',import.meta.url)));
const historical=JSON.parse(fs.readFileSync(new URL('../data/empires/historical-symbols.json',import.meta.url)));
test('historical flags respect period boundaries and modern flags cannot leak into history',()=>{
 const ottoman=historical['atlas-2'];assert.equal(selectSymbol(ottoman,{year:1800}),null);
 assert.equal(selectSymbol(ottoman,{year:1844}),ottoman[0]);assert.equal(selectSymbol(ottoman,{year:1923}),null);
 assert.equal(selectSymbol(ottoman,{year:1800},true),null);
 assert.equal(selectSymbol(ottoman,null,true),ottoman.at(-1));
 assert.equal(selectSymbol(ottoman,{modern:true}),null);
 const flags=Object.values(modern)[0];assert.equal(selectSymbol(flags,{year:2025}),null);
 assert.equal(selectSymbol(flags,{modern:true}),flags[0]);
 assert.equal(selectSymbol(historical['atlas-24'],{year:1938}),null);
 assert.match(selectSymbol(historical['atlas-230'],{year:1945}).src,/1936/);
 assert.match(selectSymbol(historical['atlas-230'],{year:1960}).src,/1955/);
});
test('every symbol resolves a catalogue identity, local SVG, attribution and non-overlapping period',()=>{
 const ids=new Set(catalogue.records.map(r=>r.id));
 for(const [id,entries] of Object.entries({...modern,...historical})){
  assert.ok(ids.has(id),id);
  for(const entry of entries){
   assert.ok(entry.label&&entry.license&&entry.attribution&&entry.sourceUrl.startsWith('https://'),id);
   const svg=fs.readFileSync(new URL('../public'+entry.src,import.meta.url),'utf8');
   assert.match(svg,/<svg\b/);assert.doesNotMatch(svg,/<script\b|<foreignObject\b|\bonload\s*=|\bonerror\s*=/i);
   if(entry.modernOnly){assert.equal(entry.start,null);assert.equal(entry.end,null);}else assert.ok(entry.start<=entry.end);
  }
  for(let i=1;i<entries.length;i++)assert.ok(entries[i-1].end<entries[i].start,id);
 }
 assert.equal(modern['country-afg'],undefined,'No obsolete Afghan republic flag');
});
