import test from 'node:test';
import assert from 'node:assert/strict';
import { nodes, nodeById, edges, scopes, sources } from '../src/data.js';
import { WORLD, clampRange, zoomRange, panRange, scopeRange, breadcrumbs, searchNodes, formatYear, timeLayout, networkLayout, scopeNodes } from '../src/engine.js';

test('each node, relationship, scope, and citation resolves',()=>{
 assert.equal(new Set(nodes.map(n=>n.id)).size,nodes.length);
 for(const n of nodes){assert.ok(sources[n.source],`${n.id}: missing source`);assert.ok(Number.isFinite(n.year));assert.ok(n.summary);if(n.enter)assert.ok(scopes[n.enter]);}
 for(const e of edges){assert.ok(nodeById[e.from]);assert.ok(nodeById[e.to]);assert.ok(e.note.length>20);assert.ok(sources[e.source]);}
 for(const [id,scope] of Object.entries(scopes)){assert.equal(new Set(scope.ids).size,scope.ids.length);for(const item of scope.ids)assert.ok(nodeById[item],`${id}: ${item}`);for(const n of scopeNodes(id)){assert.equal(scope.rows.filter(r=>r.region?r.region===n.region:r.ids.includes(n.id)).length,1,`${id}: ${n.id} must occupy one lane`);}assert.ok(breadcrumbs(id).length<10);assert.equal(breadcrumbs(id)[0],'world');}
});
test('chronological navigation stays within bounds and respects minimum zoom',()=>{
 assert.deepEqual(panRange([-3000,-2000],-10000),[WORLD[0],WORLD[0]+1000]);
 assert.deepEqual(panRange([1500,2000],10000),[WORLD[1]-500,WORLD[1]]);
 assert.deepEqual(clampRange([-99999,99999]),WORLD);
 const zoom=zoomRange([-1000,1000],.5,.25);assert.deepEqual(zoom,[-750,250]);
 assert.equal(zoomRange([-50,150],.01)[1]-zoomRange([-50,150],.01)[0],180);
});
test('nested scope ranges contain all members and breadcrumbs preserve hierarchy',()=>{
 assert.deepEqual(breadcrumbs('mahayana'),['world','buddhism','mahayana']);
 assert.deepEqual(breadcrumbs('islam'),['world','abrahamic','islam']);
 for(const id of Object.keys(scopes)){const range=scopeRange(id);for(const n of scopeNodes(id))assert.ok(n.year>=range[0]&&n.year<=range[1]);}
});
test('search handles spelling variants, diacritics, and the historical Hinayana label',()=>{
 assert.ok(searchNodes('advaita vedanta').some(n=>n.id==='advaita'));
 assert.ok(searchNodes('communism').some(n=>n.id==='marxism'));
 assert.ok(searchNodes('hinayana').some(n=>n.id==='early-schools'));
 assert.ok(!searchNodes('hinayana').some(n=>n.id==='theravada'));
 assert.ok(searchNodes('vaishnavism').length>0);
 assert.ok(searchNodes('nonexistent-query-2748').length===0);
 assert.equal(formatYear(-500),'500 BCE');assert.equal(formatYear(0),'1 CE');
});
test('graph layouts are finite, stable, and chronologically faithful',()=>{
 const items=scopeNodes('buddhism');const range=scopeRange('buddhism');const timeline=timeLayout(items,'buddhism',range,900,500,null);
 const sorted=[...items].sort((a,b)=>a.year-b.year);for(let i=1;i<sorted.length;i++)assert.ok(timeline[sorted[i].id].x>=timeline[sorted[i-1].id].x);
 const network=networkLayout(items,'buddhism',900,500);assert.deepEqual(network,networkLayout(items,'buddhism',900,500));for(const p of Object.values(network)){assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));assert.ok(p.x>=0&&p.x<=900&&p.y>=0&&p.y<=500);}
});

test('world network does not collapse against the canvas edges',()=>{
 const network=Object.values(networkLayout(nodes,'world',1150,520));
 const onBorder=network.filter(p=>p.x<=36||p.x>=1114||p.y<=46||p.y>=491);
 assert.ok(onBorder.length<network.length*.3,`${onBorder.length} nodes pinned to borders`);
});

test('requested spellings and denominations are directly searchable',()=>{
 for(const [q,id] of [['digambar','digambara'],['svetambar','svetambara'],['wahabi','wahhabi'],['hadesim','hasidism'],['orthodox judaism','orthodox-judaism'],['advait','advaita'],['communism','communism']])assert.ok(searchNodes(q).some(n=>n.id===id),q);
});
