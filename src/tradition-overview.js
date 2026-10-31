import {footprintAt} from './coverage-engine.js';
import {rankedGroups} from './religion-population.js';

// Schools are available at every camera scale; only text placement depends on space.
export function overviewSchoolsAt(items,year,selected){
 return items.filter(item=>!item.context||item.id===selected).map(item=>({item,patches:footprintAt(item,year)})).filter(shape=>shape.patches.length).sort((a,b)=>Number(a.item.id===selected)-Number(b.item.id===selected));
}
export function countryOverview(feature,record,items,year){
 const groups=rankedGroups(record?.shares),dominant=groups[0];
 const mao=items.find(item=>item.id==='maoism');
 if(feature.properties.name==='China'&&year>=1949&&mao&&footprintAt(mao,year).length){
  return {name:'Maoist communism',color:mao.color,schoolId:mao.id,kind:'ideology',sourceUrl:'https://english.www.gov.cn/archive/lawregulations/201911/20/content_WS5ed8856ec6d0b3f0e9499913.html'};
 }
 if(!dominant)return null;
 const branches=(record.branches||[]).filter(branch=>branch.group===dominant.id).sort((a,b)=>b.share-a.share);
 const branch=branches[0],residual=dominant.share-branches.reduce((sum,b)=>sum+b.share,0);
 if(branch&&branch.share>=residual&&groups.slice(1).every(group=>branch.share>=group.share)){
  return {name:branch.name,color:dominant.color,kind:'affiliation'};
 }
 return {name:dominant.name,color:dominant.color,kind:'affiliation'};
}
