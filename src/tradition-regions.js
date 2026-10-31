import {areas} from './coverage-data.js';
import {valueAt,centroid} from './coverage-engine.js';
const names={ganges:'Ganges plain',punjab:'Punjab',gujarat:'Gujarat',deccan:'Deccan',tamil:'Tamil region',lanka:'Sri Lanka',iran:'Iranian plateau',bactria:'Bactria',tarim:'Tarim Basin',northChina:'Northern China',southChina:'Southern China',mainlandSE:'Mainland Southeast Asia',maritimeSE:'Maritime Southeast Asia',java:'Java',bali:'Bali',levant:'Levant',anatolia:'Anatolia',aegean:'Aegean',italy:'Italy',westernEurope:'Western Europe',easternEurope:'Eastern Europe',northAfrica:'North Africa',westAfrica:'West Africa',eastAfrica:'East Africa',centralAfrica:'Central Africa',southernAfrica:'Southern Africa',northAmerica:'North America',mesoamerica:'Mesoamerica',eastUS:'Eastern North America',pacificNW:'Pacific Northwest',newEngland:'New England',russiaWest:'Western Russia',lowCountries:'Low Countries',centralIndia:'Central India'};
// The regional layer retains the complete geographic setting described by the
// existing readings. Neither its size nor its order estimates adherence.
export function regionalSettingsAt(items,year){
 const grouped=new Map();
 for(const item of items)for(const patch of item.patches){
  const presence=valueAt(patch.frames,year);
  if(presence<=.005)continue;
  if(!grouped.has(patch.area))grouped.set(patch.area,new Map());
  const entries=grouped.get(patch.area),previous=entries.get(item.id);
  if(!previous||presence>previous.presence)entries.set(item.id,{item,presence});
 }
 return [...grouped].map(([area,entries])=>{
  const ranked=[...entries.values()].sort((a,b)=>Number(b.item.kind==='religion')-Number(a.item.kind==='religion')||Number(!!b.item.context)-Number(!!a.item.context)||b.presence-a.presence||(b.item.priority||0)-(a.item.priority||0)||a.item.name.localeCompare(b.item.name));
  const items=ranked.map(x=>x.item),ring=areas[area];
  const families=[...new Map(items.map(item=>[item.family,item.color])).values()];
  return {id:'region-'+area,area,label:names[area]||area.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,s=>s.toUpperCase()),name:items[0].name,ring,anchor:centroid(ring),items,colors:families.slice(0,4),color:items[0].color,presence:Math.max(...ranked.map(x=>x.presence))};
 });
}

// Outgoing reconstruction layers may fade, but a later census must never remain
// visible after the viewer has rewound before its observation date.
export const datedBaseShapes=(shapes,year)=>shapes.filter(shape=>shape.kind!=='country'||shape.record.year<=year);
