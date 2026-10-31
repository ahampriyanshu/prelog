export const populationGroups=[
 {id:'christian',name:'Christianity',color:'#718ab6',family:'christian'},
 {id:'islam',name:'Islam',color:'#509485',family:'islamic'},
 {id:'hindu',name:'Hinduism',color:'#c39451',family:'indian'},
 {id:'buddhist',name:'Buddhism',color:'#c07d59',family:'buddhist'},
 {id:'jewish',name:'Judaism',color:'#a17cb1',family:'jewish'},
 {id:'other',name:'Other religions¹',color:'#859657',family:null},
 {id:'unaffiliated',name:'Religiously unaffiliated',color:'#9c9f9e',family:null},
];
export const snapshotYear=year=>year>=2020?2020:year>=2010?2010:null;
export const compositionFor=(data,country,year)=>data?.countries[country]?.[snapshotYear(year)]||null;
export const rankedGroups=shares=>shares?populationGroups.map(group=>({...group,share:shares[group.id]})).sort((a,b)=>b.share-a.share):[];
export const formatShare=share=>share===0?'<0.1%':`${share.toFixed(1)}%`;
const aliases={
 'The Bahamas':'Bahamas','Cabo Verde':'Cape Verde','Curaçao':'Curacao',Czechia:'Czech Republic',eSwatini:'Eswatini',
 'Hong Kong S.A.R.':'Hong Kong','Macao S.A.R':'Macao',Palestine:'Palestinian territories',
 'São Tomé and Principe':'São Tomé and Príncipe','Republic of Serbia':'Serbia','Saint Lucia':'St. Lucia',
 'Saint Vincent and the Grenadines':'St. Vincent and the Grenadines','United Republic of Tanzania':'Tanzania',
 'East Timor':'Timor-Leste','United States Virgin Islands':'U.S. Virgin Islands','United States of America':'United States',
 Jersey:'Channel Islands',Guernsey:'Channel Islands',
};
const frenchArea=polygon=>{
 const ring=polygon[0],lon=ring.reduce((s,p)=>s+p[0]/ring.length,0),lat=ring.reduce((s,p)=>s+p[1]/ring.length,0);
 if(lon>-55&&lon<-50&&lat>1&&lat<7)return 'French Guiana';
 if(lon>-62.5&&lon<-60&&lat>15.7&&lat<17)return 'Guadeloupe';
 if(lon>-62&&lon<-60&&lat>14&&lat<15.7)return 'Martinique';
 if(lon>54&&lon<57&&lat>-23&&lat<-19)return 'Reunion';
 if(lon>44&&lon<46&&lat>-14&&lat<-12)return 'Mayotte';
 if(lon>-6&&lon<10&&lat>40&&lat<52)return 'France';
 return null;
};
export function buildPopulationFeatures(map,data){
 return map.features.filter(f=>f.properties.id.startsWith('country-')).flatMap(feature=>{
  const {name}=feature.properties;
  if(name==='France'){
   const groups={};
   for(const polygon of feature.geometry.coordinates){const country=frenchArea(polygon);(groups[country||'France overseas (not measured)']??=[]).push(polygon);}
   return Object.entries(groups).map(([country,coordinates])=>({...feature,properties:{...feature.properties,id:country==='France'?feature.properties.id:`religion-${country.toLowerCase().replaceAll(' ','-')}`,name:country,demographicCountry:data.countries[country]?country:null},geometry:{type:'MultiPolygon',coordinates}}));
  }
  const country=aliases[name]||name;
  return [{...feature,properties:{...feature.properties,demographicCountry:data.countries[country]?country:null}}];
 });
}
export function geometryPath(geometry){
 const polygons=geometry.type==='Polygon'?[geometry.coordinates]:geometry.coordinates;
 return polygons.map(poly=>poly.map(ring=>ring.map(([x,y],i)=>`${i?'L':'M'}${x},${y}`).join(' ')+'Z').join(' ')).join(' ');
}
