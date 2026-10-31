import { WORLD, clampRange } from './engine.js';
import { places } from './geography.js';
export const TIME_END=2025;
export const timeAnchors=[WORLD[0],-2600,-1500,-800,-300,300,800,1300,1700,1850,1950,TIME_END];
export function timeProgress(year){const clamped=Math.max(timeAnchors[0],Math.min(TIME_END,year));const i=Math.min(timeAnchors.length-2,Math.max(0,timeAnchors.findIndex((y,j)=>j<timeAnchors.length-1&&clamped<=timeAnchors[j+1])));return (i+(clamped-timeAnchors[i])/(timeAnchors[i+1]-timeAnchors[i]))/(timeAnchors.length-1);}
export function yearAtProgress(progress){const value=Math.max(0,Math.min(1,progress))*(timeAnchors.length-1);const i=Math.min(timeAnchors.length-2,Math.floor(value));return timeAnchors[i]+(value-i)*(timeAnchors[i+1]-timeAnchors[i]);}
export const scrollYear=(year,pixels)=>yearAtProgress(timeProgress(year)+pixels/8500);
export const followYear=(year,range)=>{const span=range[1]-range[0];return clampRange([year-span*.48,year+span*.52]);};
export function project(lon,lat,width,height,camera){const scale=Math.min((width-40)/360,(height-40)/155)*camera.zoom;return {x:width/2+(lon-camera.lon)*scale,y:height/2-(lat-camera.lat)*scale};}
export function mapPath(rings,width,height,camera){return rings.map(ring=>ring.map(([lon,lat],i)=>{const p=project(lon,lat,width,height,camera);return `${i?'L':'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`;}).join(' ')+'Z').join(' ');}
export function mapClusters(items,year,width,height,camera,selected,highlight){
 const clusters=[];
 const visible=items.filter(n=>n.year<=Math.round(year));
 for(const n of [...visible].sort((a,b)=>a.year-b.year)){
  const place=places[n.id],p=project(place.lon,place.lat,width,height,camera);
  if(p.x<-20||p.x>width+20||p.y<0||p.y>height)continue;
  const cluster=clusters.find(c=>Math.hypot(c.x-p.x,c.y-p.y)<34);
  if(cluster){cluster.nodes.push(n);if(n.id===selected||n.id===highlight){cluster.x=p.x;cluster.y=p.y;cluster.feature=n;}}
  else clusters.push({...p,nodes:[n],feature:n});
 }
 for(const c of clusters){c.feature=c.nodes.find(n=>n.id===selected)||c.nodes.find(n=>n.id===highlight)||c.nodes.at(-1);c.id=c.nodes.map(n=>n.id).sort().join('-');c.active=c.nodes.some(n=>n.id===selected||n.id===highlight);}
 return clusters;
}
export function clampCamera(camera){return {lon:Math.max(-180,Math.min(180,camera.lon)),lat:Math.max(-85,Math.min(85,camera.lat)),zoom:Math.max(1,Math.min(9,camera.zoom))};}
export function cameraForScope(items){if(!items.length||items.length>30)return {lon:0,lat:15,zoom:1};const coords=items.map(n=>places[n.id]);const longitudes=coords.map(p=>p.lon),latitudes=coords.map(p=>p.lat);const minLon=Math.min(...longitudes),maxLon=Math.max(...longitudes),minLat=Math.min(...latitudes),maxLat=Math.max(...latitudes);return clampCamera({lon:(minLon+maxLon)/2,lat:(minLat+maxLat)/2,zoom:Math.min(4,240/Math.max(50,maxLon-minLon),(110/Math.max(28,maxLat-minLat)))});}
