import test from 'node:test';
import assert from 'node:assert/strict';
import {areas,coverage,coverageById,coverageForNode,families,lineageFor} from '../src/coverage-data.js';
import {nodeById,nodes} from '../src/data.js';
import {valueAt,footprintAt,stageAt,historiesAt,projectPoint,unprojectPoint,fitFootprint,visibleLabels} from '../src/coverage-engine.js';

test('regional layers resolve their geometry, reading records, sources, and chronological keyframes',()=>{
 assert.equal(new Set(coverage.map(x=>x.id)).size,coverage.length);
 for(const item of coverage){
  assert.ok(nodeById[item.id]);assert.ok(item.readings.length);
  for(const id of item.members)assert.ok(nodeById[id]);
  for(const source of item.readings)assert.ok(source.url.startsWith('https://'));
  for(const patch of item.patches){
   assert.ok(areas[patch.area]?.length>=3,patch.area);
   for(const [x,y] of areas[patch.area])assert.ok(Number.isFinite(x)&&Math.abs(x)<=180&&Number.isFinite(y)&&Math.abs(y)<=90);
   patch.frames.forEach(([year,value],i)=>{assert.ok(Number.isFinite(year)&&value>=0&&value<=1);if(i)assert.ok(year>patch.frames[i-1][0]);});
  }
  item.stages.forEach((stage,i)=>{if(i)assert.ok(stage.year>item.stages[i-1].year);});
 }
});
test('appearance and decline interpolate continuously, and vanish only at the declared endpoint',()=>{
 const frames=[[-2600,.85],[-2300,1],[-1900,.9],[-1300,0]];
 assert.equal(valueAt(frames,-2700),0);assert.equal(valueAt(frames,-2300),1);
 assert.ok(valueAt(frames,-1700)<valueAt(frames,-1900));
 assert.equal(valueAt(frames,-1300),0);assert.equal(valueAt(frames,2025),0);
 assert.ok(Math.abs(valueAt(frames,-1900.01)-valueAt(frames,-1899.99))<.001);
});
test('Indus urban footprint expands, contracts, disappears, and returns when rewinding',()=>{
 const item=coverageById.indus;
 assert.equal(footprintAt(item,-2700).length,0);
 const early=footprintAt(item,-2600),wide=footprintAt(item,-2300),late=footprintAt(item,-1500);
 assert.ok(wide[0].presence>early[0].presence);assert.ok(late[0].presence<early[0].presence);
 assert.equal(footprintAt(item,-1300).length,0);
 assert.deepEqual(footprintAt(item,-2300),wide);
 assert.equal(stageAt(item,-1700).title,'Urban dispersal');
});
test('Buddhist regional expansion and Indian decline coexist with continuing East Asian regions',()=>{
 const item=coverageById.buddhism;
 assert.equal(footprintAt(item,-500).length,0);
 assert.ok(footprintAt(item,800).length>footprintAt(item,-450).length);
 const medieval=footprintAt(item,1500).map(p=>p.area);
 assert.ok(!medieval.includes('deccan'));assert.ok(medieval.includes('japan'));assert.ok(medieval.includes('lanka'));
 assert.ok(footprintAt(item,2025).some(p=>p.area==='ganges'));
});
test('overlapping traditions remain separately discoverable',()=>{
 const items=historiesAt(coverage,800,[83,26]);
 assert.ok(items.some(x=>x.id==='vedic'));assert.ok(items.some(x=>x.id==='buddhism'));assert.ok(items.some(x=>x.id==='hindu'));
});
test('projection and picking agree across screen sizes and camera positions',()=>{
 for(const [width,height] of [[1440,900],[390,844],[320,740]])for(const camera of [{lon:0,lat:15,zoom:1},{lon:75,lat:28,zoom:4}])for(const p of [[72,28],[-90,18],[139,37]]){
  const q=unprojectPoint(projectPoint(p,width,height,camera),width,height,camera);
  assert.ok(Math.abs(p[0]-q[0])<1e-8&&Math.abs(p[1]-q[1])<1e-8);
 }
 for(const item of coverage)assert.ok(Object.values(fitFootprint(item,2025)).every(Number.isFinite));
});
test('every catalogue entry has its own region layer rather than a parent substitution',()=>{
 assert.equal(coverage.length,nodes.length);
 for(const n of nodes){const layer=coverageForNode(n.id);assert.equal(layer.id,n.id);assert.ok(layer.patches.length);assert.ok(layer.place);}
 for(const id of ['advaita','stoicism','communism','absurdism','digambara','svetambara','wahhabi','hasidism','orthodox-judaism'])assert.equal(coverageForNode(id).id,id);
 assert.notDeepEqual(coverageById.digambara.patches,coverageById.svetambara.patches);
 assert.notDeepEqual(coverageById.advaita.patches,coverageById.hindu.patches);
});
test('family membership covers every entry once and relationships preserve distinct kinds',()=>{
 const ids=families.flatMap(f=>f.ids);assert.equal(new Set(ids).size,nodes.length);
 assert.deepEqual(ids.sort(),nodes.map(n=>n.id).sort());
 for(const layer of coverage){const chain=lineageFor(layer.id);assert.ok(chain.length<=coverage.length);assert.equal(chain.at(-1).id,layer.id);if(layer.parentId)assert.ok(coverageById[layer.parentId]);}
 assert.equal(coverageById.hanafi.relation,'School of law');
 assert.equal(coverageById.wahhabi.relation,'Reform movement');
 assert.equal(coverageById.communism.kind,'philosophy');
 assert.equal(coverageById.communism.relation,'Political ideology');
 for(const id of ['legalism',...families.find(f=>f.id==='political').ids])assert.equal(coverageById[id].kind,'philosophy');
 assert.deepEqual(lineageFor('wahhabi').map(c=>c.id),['islam','sunni','hanbali','wahhabi']);
});
test('branches respect their own dates when rewinding, and philosophical reception has separate phases',()=>{
 for(const id of ['digambara','svetambara','wahhabi','deobandi','communism','maoism']){
  const layer=coverageById[id];assert.equal(footprintAt(layer,layer.start-1).length,0);assert.ok(footprintAt(layer,layer.start).length>0);
 }
 assert.ok(footprintAt(coverageById.stoicism,-200).some(p=>p.area==='aegean'));
 assert.equal(footprintAt(coverageById.stoicism,1000).length,0);
 assert.ok(footprintAt(coverageById.stoicism,1700).some(p=>p.area==='lowCountries'));
 assert.ok(footprintAt(coverageById.advaita,2025).length);
 assert.ok(footprintAt(coverageById.communism,2025).length);
});

test('dense labels expose hidden neighbours without dropping the selected school',()=>{
 const items=['digambara','svetambara','murtipujaka','sthanakvasi','terapanth','advaita','ramanuja','madhva'].map(id=>coverageById[id]);
 const labels=visibleLabels(items,2025,900,700,{lon:77,lat:22,zoom:1.2},'advaita');
 assert.ok(labels.some(l=>l.item.id==='advaita'));
 const reachable=new Set(labels.flatMap(l=>[l.item.id,...l.nearby]));
 for(const item of items)assert.ok(reachable.has(item.id),item.id);
});
