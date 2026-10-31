import { areas } from './coverage-data.js';
import {placeAreaLabels} from './map-labels.js';
export const DEFAULT_CAMERA={lon:0,lat:18,zoom:1};
export function valueAt(frames,year){
 if(year<frames[0][0])return 0;
 for(let i=1;i<frames.length;i++)if(year<frames[i][0]){
  const [a,av]=frames[i-1],[b,bv]=frames[i];
  const t=(year-a)/(b-a);return av+(bv-av)*t;
 }
 return frames.at(-1)[1];
}
export function centroid(ring){return ring.reduce((p,c)=>[p[0]+c[0]/ring.length,p[1]+c[1]/ring.length],[0,0]);}
export function footprintAt(item,year){
 return item.patches.flatMap((patch,index)=>{
  const presence=valueAt(patch.frames,year);if(presence<=.005)return [];
  const ring=areas[patch.area],center=centroid(ring),scale=.45+.55*Math.sqrt(presence);
  return [{key:`${item.id}-${index}`,area:patch.area,presence,ring:ring.map(([x,y])=>[center[0]+(x-center[0])*scale,center[1]+(y-center[1])*scale])}];
 });
}
export const stageAt=(item,year)=>item.stages.findLast(s=>s.year<=year);
export function statusAt(item,year){
 const sum=y=>item.patches.reduce((v,p)=>v+valueAt(p.frames,y),0);
 const current=sum(year),next=sum(year+25),before=sum(year-25);
 if(!current)return year<item.stages[0].year?'Before this record':'Later than this footprint';
 if(next+0.015<current||current+.015<before)return 'Changing footprint';
 if(next>current+.015||current>before+.015)return 'Expanding footprint';
 return 'Regional presence';
}
export function inRing([x,y],ring){
 let inside=false;
 for(let i=0,j=ring.length-1;i<ring.length;j=i++){
  const [xi,yi]=ring[i],[xj,yj]=ring[j];
  if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;
 }
 return inside;
}
export const historiesAt=(items,year,point)=>items.filter(item=>footprintAt(item,year).some(p=>inRing(point,p.ring)));
export function fitFootprint(item,year){
 const shapes=footprintAt(item,year);const points=shapes.flatMap(p=>p.ring);
 if(!points.length)return {...DEFAULT_CAMERA};
 const minX=Math.min(...points.map(p=>p[0])),maxX=Math.max(...points.map(p=>p[0]));
 const minY=Math.min(...points.map(p=>p[1])),maxY=Math.max(...points.map(p=>p[1]));
 return {lon:(minX+maxX)/2,lat:(minY+maxY)/2,zoom:Math.min(4.5,Math.max(1,180/Math.max(45,maxX-minX),0))};
}
// Projection and inverse share a scale so hover, pan, and hit testing agree at every zoom.
export const mapScale=(width,height,camera)=>Math.min(width/370,height/170)*camera.zoom;
export function projectPoint([lon,lat],width,height,camera){const scale=mapScale(width,height,camera);return [width/2+(lon-camera.lon)*scale,height/2-(lat-camera.lat)*scale];}
export function unprojectPoint([x,y],width,height,camera){const scale=mapScale(width,height,camera);return [camera.lon+(x-width/2)/scale,camera.lat-(y-height/2)/scale];}
export function ringPath(ring,width,height,camera){return ring.map((p,i)=>`${i?'L':'M'}${projectPoint(p,width,height,camera).map(v=>v.toFixed(2)).join(',')}`).join(' ')+'Z';}
export function visibleLabels(items,year,width,height,camera,selected,insets={},options={}){
 const entries=items.map(item=>({item,regions:footprintAt(item,year).map(patch=>({area:patch.area,polygon:[patch.ring.map(p=>projectPoint(p,width,height,camera))],anchor:projectPoint(item.label,width,height,camera)}))}));
 return placeAreaLabels(entries,{width,height,selected,insets,maxPerItem:3,...options});
}
