import {buildTimeStops} from './political-time.js';
import {DEFAULT_CAMERA,footprintAt,centroid,inRing,mapScale} from './coverage-engine.js';
import {clampCamera} from './map-engine.js';
// Keep the same navigation density and Today endpoint as the Empires atlas.
// Geography retains its own evidence dates; these are navigation stops.
export function thoughtTimeStops(items) {
 const events=items.flatMap(item=>item.stages.map(s=>({year:s.year}))).filter(s=>s.year>=-3450&&s.year<=2020);
 return [-3450,...buildTimeStops(events).filter(y=>y==='modern'||y>-3450)];
}
export const thoughtYear=date=>date==='modern'?new Date().getFullYear():date;

// A globally distributed school is explored at the selected setting. Fitting
// all of its overseas settings into one phone viewport hides the selected area.
export function focusThoughtCamera(item,year,camera,width,height,point=null){
 if(!item)return {...DEFAULT_CAMERA};
 const patches=footprintAt(item,year);
 if(!patches.length)return {...DEFAULT_CAMERA};
 const clicked=point&&patches.some(p=>inRing(point,p.ring));
 const anchor=(clicked?point:null)||(patches.some(p=>inRing(item.label,p.ring))?item.label:centroid(patches[0].ring));
 const next={lon:anchor[0],lat:anchor[1],zoom:Math.max(camera.zoom,width<700?6:3)};
 const scale=mapScale(width,height,next);
 if(width<700)next.lat-=height*.28/scale;else next.lon+=185/scale;
 return clampCamera(next);
}
