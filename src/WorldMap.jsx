import {useEffect,useMemo,useRef,useState} from 'react';
import land from './land.json';
import {compositionFor,rankedGroups,snapshotYear} from './religion-population.js';
import {PopulationTooltip} from './ReligionPopulation.jsx';
import {continentLabels,oceanLabels} from './geography.js';
import {clampCamera} from './map-engine.js';
import {footprintAt,projectPoint,unprojectPoint,mapScale,visibleLabels,historiesAt,stageAt,statusAt} from './coverage-engine.js';
const pathFor=ring=>ring.map(([x,y],i)=>`${i?'L':'M'}${x},${y}`).join(' ')+'Z';
const landPath=land.map(pathFor).join(' ');
const softPath=ring=>{const mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];return `M${mid(ring.at(-1),ring[0]).join(',')}`+ring.map((p,i)=>`Q${p.join(',')} ${mid(p,ring[(i+1)%ring.length]).join(',')}`).join(' ')+'Z';};

export default function WorldMap({items,year,selected,camera,setCamera,onTravel,onSelect,onHover,population,populationMode=false,populationSelected,onPopulationSelect,leftInset=0,rightInset=0}){
 const ref=useRef(null),drag=useRef(null),cameraRef=useRef(camera),travelRef=useRef(onTravel);
 const [size,setSize]=useState(()=>({width:window.innerWidth,height:window.innerHeight})),[dragging,setDragging]=useState(false),[hover,setHover]=useState(null);
 cameraRef.current=camera;travelRef.current=onTravel;
 useEffect(()=>{const observer=new ResizeObserver(([entry])=>setSize({width:entry.contentRect.width,height:entry.contentRect.height}));observer.observe(ref.current);return()=>observer.disconnect();},[]);
 const {width,height}=size,scale=mapScale(width,height,camera);
 const shapes=useMemo(()=>items.map(item=>({item,patches:footprintAt(item,year)})).filter(s=>s.patches.length).sort((a,b)=>Number(a.item.id===selected)-Number(b.item.id===selected)),[items,year,selected]);
 const labels=visibleLabels(items,year,width,height,camera,selected,{left:leftInset,right:rightInset});
 const currentHover=!populationMode&&hover&&shapes.find(s=>s.item.id===hover.id)?.item;
 const hoveredCountry=populationMode&&hover&&population?.features.find(f=>f.properties.id===hover.id);
 const populationShapes=useMemo(()=>population?.features.map(feature=>({feature,color:rankedGroups(compositionFor(population.data,feature.properties.demographicCountry,year))[0]?.color}))||[],[population,snapshotYear(year)]);
 useEffect(()=>{onHover?.(currentHover?.id||null);},[currentHover?.id,onHover]);
 useEffect(()=>{setHover(null);},[selected,year,populationMode,populationSelected]);
 useEffect(()=>{const el=ref.current;const wheel=e=>{e.preventDefault();if(e.ctrlKey||e.metaKey){setCamera(old=>clampCamera({...old,zoom:old.zoom*Math.exp(-e.deltaY*.006)}));}else travelRef.current((e.deltaY||e.deltaX)*(e.deltaMode===1?16:e.deltaMode===2?400:1));};el.addEventListener('wheel',wheel,{passive:false});return()=>el.removeEventListener('wheel',wheel);},[setCamera]);
 const locate=(event,id)=>{if(dragging)return;const rect=ref.current.getBoundingClientRect();setHover({id,x:event.clientX-rect.left,y:event.clientY-rect.top});};
 const select=(event,id)=>{if(drag.current?.moved)return;const rect=ref.current.getBoundingClientRect();const point=unprojectPoint([event.clientX-rect.left,event.clientY-rect.top],width,height,camera);const overlaps=historiesAt(items,year,point).map(item=>item.id);onSelect(id,overlaps);setHover(null);};
 const down=e=>{if(e.button!==0||e.target.closest('button'))return;drag.current={x:e.clientX,y:e.clientY,lastY:e.clientY,camera:cameraRef.current,type:e.pointerType,moved:false};};
 const move=e=>{const d=drag.current;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(!d.moved&&Math.hypot(dx,dy)<5)return;d.moved=true;setDragging(true);setHover(null);if(!e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.setPointerCapture(e.pointerId);if(d.type==='touch'&&Math.abs(dy)>Math.abs(dx)){travelRef.current((d.lastY-e.clientY)*2);d.lastY=e.clientY;}else setCamera(clampCamera({...d.camera,lon:d.camera.lon-dx/mapScale(width,height,d.camera),lat:d.camera.lat+dy/mapScale(width,height,d.camera)}));};
 const up=()=>{setDragging(false);requestAnimationFrame(()=>{drag.current=null;});};
 const keyboardSelect=(event,id)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();onSelect(id,[]);setHover(null);}};
 return <main ref={ref} className={`world-map ${dragging?'dragging':''}`} data-testid="world-map" tabIndex={0} aria-label="Historical area map. Scroll down to move forward in time, up to rewind. Drag to pan. Select a shaded region for details." onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
  <svg className="map-svg" width={width} height={height} aria-label="Geographic areas through time">
   <g className="geographic-layer" style={{transform:`translate(${width/2}px,${height/2}px) scale(${scale},${-scale}) translate(${-camera.lon}px,${-camera.lat}px)`}}>
    <defs><clipPath id="land-clip"><path d={landPath}/></clipPath><pattern id="religion-unmeasured" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#e3e6db"/><path d="M0,0L3,3" stroke="#a8b09b" strokeWidth=".3"/></pattern></defs>
    <g className="graticule" aria-hidden="true">{[-150,-120,-90,-60,-30,0,30,60,90,120,150].map(lon=><path key={lon} d={`M${lon},-62V82`}/>)}{[-60,-30,0,30,60].map(lat=><path key={lat} className={lat===0?'equator':''} d={`M-180,${lat}H180`}/>)}</g>
    <path className="land" d={landPath} aria-hidden="true"/>
    {populationMode&&<g className="religious-populations">{populationShapes.map(({feature,color})=><path key={feature.properties.id} d={feature.path} data-population-country={feature.properties.demographicCountry||feature.properties.name} className={`population-area ${populationSelected===feature.properties.id?'selected':''}`} fill={color||'url(#religion-unmeasured)'} fillRule="evenodd" role="button" tabIndex={0} aria-label={`Religious composition of ${feature.properties.name}`} onPointerEnter={e=>locate(e,feature.properties.id)} onPointerMove={e=>locate(e,feature.properties.id)} onPointerLeave={()=>setHover(null)} onClick={()=>{if(!drag.current?.moved){onPopulationSelect(feature);setHover(null);}}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();onPopulationSelect(feature);}}} onFocus={()=>{const [x,y]=projectPoint(feature.properties.label,width,height,camera);setHover({id:feature.properties.id,x,y});}} onBlur={()=>setHover(null)}/>)}</g>}
    <g style={{display:populationMode?'none':undefined}} className="historical-regions" clipPath="url(#land-clip)">
     {shapes.map(({item,patches})=><g key={item.id} className={`history-region ${selected===item.id?'selected':''} ${selected&&selected!==item.id?'dimmed':''} ${currentHover?.id===item.id?'hovered':''}`} style={{'--region-color':item.color}}>
      {patches.map((patch,i)=><path key={patch.key} d={softPath(patch.ring)} className="region-area" data-entity={item.id} data-area={patch.area} style={{'--presence':patch.presence}} role="button" tabIndex={i===0?0:-1} aria-label={`${item.name}: ${statusAt(item,year)}. Open details.`} aria-pressed={selected===item.id} onPointerEnter={e=>locate(e,item.id)} onPointerMove={e=>locate(e,item.id)} onPointerLeave={()=>setHover(null)} onClick={e=>select(e,item.id)} onKeyDown={e=>keyboardSelect(e,item.id)} onFocus={()=>{const [x,y]=projectPoint(item.label,width,height,camera);setHover({id:item.id,x,y});}} onBlur={()=>setHover(null)}/>)}
     </g>)}
    </g>
    <path className="coastline" d={landPath} aria-hidden="true"/>
   </g>
  </svg>
  <div className="map-text" aria-hidden="true">{[...continentLabels,...oceanLabels].map(([name,lon,lat])=>{const [x,y]=projectPoint([lon,lat],width,height,camera);return <span key={name} className={name.includes('OCEAN')?'ocean-name':'continent-name'} style={{left:x,top:y,opacity:camera.zoom>2.3?0:undefined}}>{name}</span>;})}</div>
  <div className="region-labels" style={{display:populationMode?'none':undefined}}>{labels.map(({item,x,y,nearby})=><div key={item.id} className={`region-label-group ${selected===item.id?'selected':''} ${selected&&selected!==item.id?'dimmed':''}`} style={{left:x,top:y,'--region-color':item.color}}><button className="region-label" onClick={()=>onSelect(item.id,historiesAt(items,year,item.label).map(c=>c.id))} onPointerEnter={e=>locate(e,item.id)} onPointerMove={e=>locate(e,item.id)} onPointerLeave={()=>setHover(null)} onFocus={()=>setHover({id:item.id,x,y})} onBlur={()=>setHover(null)} aria-label={`Explore ${item.name}`} aria-pressed={selected===item.id}>{item.name}</button>{nearby.length>0&&<button className="nearby-count" onClick={()=>onSelect(item.id,nearby)} aria-label={`Explore ${nearby.length} more schools near ${item.name}`}>+{nearby.length}</button>}</div>)}</div>
  {hoveredCountry&&!dragging&&<div className="map-tooltip population-tooltip" role="tooltip" style={{left:Math.max(14,Math.min(width-290,hover.x+20)),top:Math.max(85,Math.min(height-275,hover.y-25))}}><PopulationTooltip feature={hoveredCountry} data={population.data} year={year}/></div>}
  {currentHover&&!dragging&&<div className="map-tooltip" role="tooltip" style={{left:Math.max(14,Math.min(width-290,hover.x+20)),top:Math.max(85,Math.min(height-235,hover.y-25)),'--region-color':currentHover.color}}><div><span className="swatch"/>{statusAt(currentHover,year)}</div><h2>{currentHover.name}</h2><p>{currentHover.summary}</p><small>{currentHover.relation}</small><footer>Click to explore <span>↗</span></footer></div>}
 </main>;
}
