import test from 'node:test';
import assert from 'node:assert/strict';
import {nodes,nodeById,sources} from '../src/data.js';
import {coverageById,lineageFor} from '../src/coverage-data.js';
import {footprintAt} from '../src/coverage-engine.js';
import {searchNodes} from '../src/engine.js';
import {additionRecords} from '../src/religion-additions.js';

test('requested missing religions resolve by familiar and misspelled names',()=>{
 for(const [query,id] of [['ahamadiya','ahmadiyya'],['nirankari','nirankari'],['mormon','latter-day-saints'],['scientalogy','scientology']])assert.ok(searchNodes(query).some(n=>n.id===id),query);
});
test('living named denominations have their own present-day geography and citations',()=>{
 for(const id of ['ahmadiyya','nirankari','sant-nirankari','latter-day-saints','scientology','community-of-christ','assyrian-east']){
  const n=nodeById[id],item=coverageById[id];assert.ok(n,id);assert.ok(sources[n.source]);
  assert.ok(item?.patches.length,id);assert.ok(footprintAt(item,2025).length,`${id} disappears at the endpoint`);
  assert.equal(footprintAt(item,item.start-1).length,0);
 }
});
test('different similarly named movements are not merged into one identity',()=>{
 assert.notEqual(nodeById.nirankari?.id,nodeById['sant-nirankari']?.id);
 assert.notEqual(nodeById['latter-day-saints']?.id,nodeById['community-of-christ']?.id);
 assert.ok(lineageFor('scientology').every(n=>n.id!=='christianity'));
 assert.ok(nodes.length>=200);
});

test('new living communities remain represented and animation ramps are not events',()=>{
 for(const n of additionRecords)assert.ok(footprintAt(coverageById[n.id],2025).length,n.id);
 assert.deepEqual(coverageById['latter-day-saints'].stages.map(s=>s.year),[1830,1847]);
 assert.deepEqual(coverageById['sant-nirankari'].stages.map(s=>s.year),[1929,1947]);
 assert.equal(coverageById.kegon.parentId,'huayan');
});
