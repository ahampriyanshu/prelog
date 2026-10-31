import {geometryPolygons,geometryPath,geometryBounds,ringContains} from './polity-engine.js';

export function polygonArea(polygon) {
 const area=ring=>Math.abs(ring.reduce((sum,[x,y],i)=>{const next=ring[(i+1)%ring.length];return sum+x*next[1]-next[0]*y;},0)/2);
 return Math.max(0,area(polygon[0])-polygon.slice(1).reduce((sum,h)=>sum+area(h),0));
}

// Keep every source vertex and hole. Each disconnected land mass gets its own
// image extent, so an overseas island cannot stretch a flag across an ocean.
export function symbolTerritories(geometry) {
 const polygons=geometryPolygons(geometry).map(coordinates=>{
  const g={type:'Polygon',coordinates};
  return {geometry:g,path:geometryPath(g),bounds:geometryBounds(g),area:polygonArea(coordinates)};
 }).filter(p=>p.bounds&&p.area>0).sort((a,b)=>b.area-a.area);
 const largest=polygons[0]?.area||0;
 return polygons.filter((p,i)=>i===0||p.area>=largest*.005);
}

function segmentDistanceSquared(x,y,a,b) {
 let px=a[0],py=a[1],dx=b[0]-px,dy=b[1]-py;
 if(dx||dy){const t=((x-px)*dx+(y-py)*dy)/(dx*dx+dy*dy);if(t>1){px=b[0];py=b[1];}else if(t>0){px+=dx*t;py+=dy*t;}}
 return (x-px)**2+(y-py)**2;
}
export function polygonClearance(point,polygon) {
 const inside=ringContains(point,polygon[0])&&!polygon.slice(1).some(h=>ringContains(point,h));
 let distance=Infinity;
 for(const ring of polygon)for(let i=0,j=ring.length-1;i<ring.length;j=i++)distance=Math.min(distance,segmentDistanceSquared(...point,ring[i],ring[j]));
 return (inside?1:-1)*Math.sqrt(distance);
}

// Find an interior point with room for an emblem. A bounding-box centre or
// centroid can land in the sea, outside a concavity, or inside a territorial hole.
export function interiorEmblem(polygon,bounds) {
 const [west,south,east,north]=bounds,width=east-west,height=north-south;
 if(width<=0||height<=0)return null;
 const cell=(x,y,h)=>{const d=polygonClearance([x,y],polygon);return{x,y,h,d,max:d+h*Math.SQRT2};};
 const queue=[];
 const push=c=>{queue.push(c);let i=queue.length-1;while(i>0){const p=(i-1)>>1;if(queue[p].max>=c.max)break;queue[i]=queue[p];i=p;}queue[i]=c;};
 const pop=()=>{const top=queue[0],last=queue.pop();if(queue.length){let i=0;while(2*i+1<queue.length){let child=2*i+1;if(child+1<queue.length&&queue[child+1].max>queue[child].max)child++;if(last.max>=queue[child].max)break;queue[i]=queue[child];i=child;}queue[i]=last;}return top;};
 const size=Math.max(Math.min(width,height),Math.max(width,height)/32),half=size/2;
 for(let x=west;x<east;x+=size)for(let y=south;y<north;y+=size)push(cell(x+half,y+half,half));
 let best=cell((west+east)/2,(south+north)/2,0),iterations=0;
 const precision=Math.max(width,height)/180;
 while(queue.length&&iterations++<2500){const c=pop();if(c.d>best.d)best=c;if(c.max-best.d<=precision)continue;const h=c.h/2;for(const dx of [-h,h])for(const dy of [-h,h])push(cell(c.x+dx,c.y+dy,h));}
 return best.d>0?{point:[best.x,best.y],radius:best.d*.82}:null;
}

const layoutCache=new WeakMap();
export function territorySymbolLayout(geometry,emblem=false) {
 let result=layoutCache.get(geometry);
 if(!result){result={territories:symbolTerritories(geometry)};layoutCache.set(geometry,result);}
 if(emblem&&!('emblem' in result)){const primary=result.territories[0];result.emblem=primary?interiorEmblem(primary.geometry.coordinates,primary.bounds):null;}
 return result;
}
