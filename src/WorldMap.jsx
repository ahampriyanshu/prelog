import {useEffect,useMemo,useRef,useState} from 'react';
import land from './land.json';
import {compositionFor,rankedGroups,snapshotYear} from './religion-population.js';
import {PopulationTooltip} from './ReligionPopulation.jsx';
import {oceanLabels} from './geography.js';
import {clampCamera} from './map-engine.js';
import {footprintAt,projectPoint,unprojectPoint,mapScale,visibleLabels,historiesAt,statusAt} from './coverage-engine.js';
import {familyById,lineageFor} from './coverage-data.js';
import {placeAreaLabels} from './map-labels.js';
import {polygonArea} from './territory-symbols.js';
import useBoundaryTransition from './useBoundaryTransition.js';
const pathFor=ring=>ring.map(([x,y],i)=>`${i?'L':'M'}${x},${y}`).join(' ')+'Z';
const landPath=land.map(pathFor).join(' ');
const measureCache=new Map();let textContext;
function measureName(text,size){
 if(!textContext)textContext=document.createElement('canvas').getContext('2d');
 const key=size+':'+text;
 if(!measureCache.has(key)){textContext.font=`500 ${size}px "DM Sans", Arial, sans-serif`;measureCache.set(key,textContext.measureText(text).width);}
 return measureCache.get(key);
}

export default function WorldMap({items,year,yearLabel,selected,camera,setCamera,onTravel,onSelect,onHover,population,populationMode=false,populationSelected,onPopulationSelect,leftInset=0,rightInset=0}){
 const ref=useRef(null),drag=useRef(null),cameraRef=useRef(camera),travelRef=useRef(onTravel);
 const [size,setSize]=useState(()=>({width:window.innerWidth,height:window.innerHeight})),[dragging,setDragging]=useState(false),[hover,setHover]=useState(null),[fontVersion,setFontVersion]=useState(0);
 cameraRef.current=camera;travelRef.current=onTravel;
 useEffect(()=>{const observer=new ResizeObserver(([entry])=>setSize({width:entry.contentRect.width,height:entry.contentRect.height}));observer.observe(ref.current);return()=>observer.disconnect();},[]);
 useEffect(()=>{let alive=true;document.fonts?.ready.then(()=>{measureCache.clear();if(alive)setFontVersion(v=>v+1);});return()=>{alive=false;};},[]);
 const {width,height}=size,scale=mapScale(width,height,camera);
 const shapes=useMemo(()=>items.map(item=>({item,patches:footprintAt(item,year)})).filter(s=>s.patches.length).sort((a,b)=>Number(a.item.id===selected)-Number(b.item.id===selected)),[items,year,selected]);
 const snapshot=useMemo(()=>({file:`thought-${year}`,year}),[year]);
 const layers=useBoundaryTransition(shapes,snapshot);
 const projectedLand=useMemo(()=>land.map(ring=>[ring.map(p=>projectPoint(p,width,height,camera))]),[width,height,camera]);
 const insets={left:leftInset,right:rightInset,top:width<700?116:95,bottom:width<700&&(selected||populationSelected)?height*.56+120:130};
 const labels=useMemo(()=>visibleLabels(items,year,width,height,camera,selected,insets,{land:projectedLand,measure:measureName}),[items,year,width,height,camera,selected,leftInset,rightInset,projectedLand,fontVersion]);
 const namedAreas=useMemo(()=>new Set(labels.map(l=>`${l.item.id}:${l.area}`)),[labels]);
 const currentHover=!populationMode&&hover&&shapes.find(s=>s.item.id===hover.id)?.item;
 const hoveredCountry=populationMode&&hover&&population?.features.find(f=>f.properties.id===hover.id);
 const populationShapes=useMemo(()=>population?.features.map(feature=>({feature,group:rankedGroups(compositionFor(population.data,feature.properties.demographicCountry,year))[0]}))||[],[population,snapshotYear(year)]);
 const populationLabels=useMemo(()=>{
  if(!populationMode)return [];
  const entries=populationShapes.filter(s=>s.group).map(({feature,group})=>{
   const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;
   return {item:{id:feature.properties.id,name:group.name,priority:Math.max(...polygons.map(polygonArea)),color:group.color},regions:[...polygons].sort((a,b)=>polygonArea(b)-polygonArea(a)).slice(0,3).map((p,i)=>({area:String(i),polygon:p.map(ring=>ring.map(point=>projectPoint(point,width,height,camera))),anchor:projectPoint(feature.properties.label,width,height,camera)}))};
  });
  return placeAreaLabels(entries,{width,height,selected:populationSelected,insets,measure:measureName});
 },[populationMode,populationShapes,width,height,camera,populationSelected,leftInset,rightInset,fontVersion]);
 const related=useMemo(()=>selected?new Set([...lineageFor(selected).map(item=>item.id),...items.filter(item=>lineageFor(item.id).some(parent=>parent.id===selected)).map(item=>item.id)]):null,[selected,items]);
 useEffect(()=>{onHover?.(currentHover?.id||null);},[currentHover?.id,onHover]);
 useEffect(()=>{setHover(null);},[selected,year,populationMode,populationSelected]);
 useEffect(()=>{const el=ref.current;const wheel=e=>{e.preventDefault();if(e.ctrlKey||e.metaKey)setCamera(old=>clampCamera({...old,zoom:old.zoom*Math.exp(-e.deltaY*.006)}));else travelRef.current((e.deltaY||e.deltaX)*(e.deltaMode===1?16:e.deltaMode===2?400:1));};el.addEventListener('wheel',wheel,{passive:false});return()=>el.removeEventListener('wheel',wheel);},[setCamera]);
 const locate=(event,id,area)=>{if(dragging)return;const rect=ref.current.getBoundingClientRect();setHover({id,area,x:event.clientX-rect.left,y:event.clientY-rect.top});};
 const choose=(id,point)=>{onSelect(id,historiesAt(items,year,point).map(item=>item.id),point);setHover(null);};
 const select=(event,id)=>{if(drag.current?.moved)return;const rect=ref.current.getBoundingClientRect();choose(id,unprojectPoint([event.clientX-rect.left,event.clientY-rect.top],width,height,camera));};
 const down=e=>{if(e.button!==0||e.target.closest('button,[data-idea-label]'))return;drag.current={x:e.clientX,y:e.clientY,lastY:e.clientY,camera:cameraRef.current,type:e.pointerType,moved:false};};
 const move=e=>{const d=drag.current;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(!d.moved&&Math.hypot(dx,dy)<5)return;d.moved=true;setDragging(true);setHover(null);if(!e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.setPointerCapture(e.pointerId);if(d.type==='touch'&&Math.abs(dy)>Math.abs(dx)){travelRef.current((d.lastY-e.clientY)*2);d.lastY=e.clientY;}else setCamera(clampCamera({...d.camera,lon:d.camera.lon-dx/mapScale(width,height,d.camera),lat:d.camera.lat+dy/mapScale(width,height,d.camera)}));};
 const up=()=>{setDragging(false);requestAnimationFrame(()=>{drag.current=null;});};
 const keyboardSelect=(event,id,point)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();choose(id,point);}};
 const compact=currentHover&&!namedAreas.has(`${currentHover.id}:${hover.area}`);
 const compactCountry=hoveredCountry&&!populationLabels.some(l=>l.item.id===hoveredCountry.properties.id);
 const labelNode=(label,populationLabel=false)=><g key={`${label.item.id}:${label.area}`} data-idea-label={populationLabel?undefined:label.item.id} data-population-label={populationLabel?label.item.id:undefined} data-label-area={label.area} className={`idea-map-label ${selected===label.item.id?'selected':''} ${related&&!related.has(label.item.id)?'quiet':''}`} transform={`translate(${unprojectPoint([label.x,label.y],width,height,camera).join(' ')}) scale(${1/scale} ${-1/scale})`} role="button" tabIndex={0} aria-label={populationLabel?`Religious composition of ${population.features.find(f=>f.properties.id===label.item.id)?.properties.name}`:`Explore ${label.item.name}`} aria-pressed={populationLabel?populationSelected===label.item.id:selected===label.item.id} onClick={()=>populationLabel?onPopulationSelect(population.features.find(f=>f.properties.id===label.item.id)):choose(label.item.id,unprojectPoint([label.x,label.y],width,height,camera))} onKeyDown={e=>{if(populationLabel){if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();onPopulationSelect(population.features.find(f=>f.properties.id===label.item.id));}}else keyboardSelect(e,label.item.id,unprojectPoint([label.x,label.y],width,height,camera));}}>
   <text textAnchor="middle" dominantBaseline="central" style={{fontSize:label.fontSize}}>{label.lines.map((line,i)=><tspan key={i} x="0" y={(i-(label.lines.length-1)/2)*label.lineHeight}>{line}</tspan>)}</text>
  </g>;
 return <main ref={ref} className={`world-map thought-map ${dragging?'dragging':''}`} data-testid="world-map" tabIndex={0} aria-label="Historical area map. Scroll down to move forward in time, up to rewind. Drag to pan. Select a shaded region for details." onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
  <svg className="map-svg" width={width} height={height} aria-label={`Religions and philosophies, ${yearLabel}`}>
   <g className="geographic-layer" style={{transform:`translate(${width/2}px,${height/2}px) scale(${scale},${-scale}) translate(${-camera.lon}px,${-camera.lat}px)`}}>
    <defs><clipPath id="thought-land-clip"><path d={landPath}/></clipPath><pattern id="religion-unmeasured" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#e3e6db"/><path d="M0,0L3,3" stroke="#a8b09b" strokeWidth=".3"/></pattern></defs>
    <g className="graticule" aria-hidden="true">{[-150,-120,-90,-60,-30,0,30,60,90,120,150].map(lon=><path key={lon} d={`M${lon},-62V82`}/>)}{[-60,-30,0,30,60].map(lat=><path key={lat} d={`M-180,${lat}H180`}/>)}</g>
    <path className="land" d={landPath} aria-hidden="true"/>
    {populationMode?<g className="religious-populations">{populationShapes.map(({feature,group})=><path key={feature.properties.id} d={feature.path} data-population-country={feature.properties.demographicCountry||feature.properties.name} className={`population-area ${populationSelected===feature.properties.id?'selected':''}`} fill={group?.color||'url(#religion-unmeasured)'} fillRule="evenodd" role="button" tabIndex={0} aria-label={`Religious composition of ${feature.properties.name}`} onPointerEnter={e=>locate(e,feature.properties.id)} onPointerMove={e=>locate(e,feature.properties.id)} onPointerLeave={()=>setHover(null)} onClick={()=>{if(!drag.current?.moved){onPopulationSelect(feature);setHover(null);}}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();onPopulationSelect(feature);}}} onFocus={()=>{const [x,y]=projectPoint(feature.properties.label,width,height,camera);setHover({id:feature.properties.id,x,y});}} onBlur={()=>setHover(null)}/>)}</g>:
    <g className="idea-areas" clipPath="url(#thought-land-clip)">{layers.map(layer=>{
     const families=[...new Set(layer.shapes.map(s=>s.item.family))];
     return <g key={layer.key} className="idea-era" data-thought-year={layer.snapshot.year} style={{opacity:layer.opacity,pointerEvents:layer.key===`thought-${year}`?undefined:'none'}} aria-hidden={layer.key!==`thought-${year}`||undefined}>
      <defs>{families.map(family=><clipPath key={family} id={`${layer.key}-${family}`}>{layer.shapes.filter(s=>s.item.family===family).flatMap(s=>s.patches.map(patch=><path key={patch.key} d={pathFor(patch.ring)}/>))}</clipPath>)}</defs>
      {families.map(family=><rect key={family} x="-180" y="-90" width="360" height="180" fill={familyById[family].color} clipPath={`url(#${layer.key}-${family})`} className="idea-family-fill" aria-hidden="true" pointerEvents="none"/>)}
      {layer.shapes.map(({item,patches})=><g key={item.id} className={`idea-region ${selected===item.id?'selected':''} ${related&&!related.has(item.id)?'quiet':''} ${currentHover?.id===item.id?'hovered':''}`} style={{'--idea-color':item.color}}>{patches.map((patch,i)=><path key={patch.key} d={pathFor(patch.ring)} className="idea-region-hit" data-entity={item.id} data-area={patch.area} role="button" tabIndex={i===0&&layer.key===`thought-${year}`?0:-1} aria-label={`${item.name}: ${statusAt(item,year)}. Open details.`} aria-pressed={selected===item.id} onPointerEnter={e=>locate(e,item.id,patch.area)} onPointerMove={e=>locate(e,item.id,patch.area)} onPointerLeave={()=>setHover(null)} onClick={e=>select(e,item.id)} onKeyDown={e=>keyboardSelect(e,item.id,item.label)} onFocus={()=>{const [x,y]=projectPoint(item.label,width,height,camera);setHover({id:item.id,area:patch.area,x,y});}} onBlur={()=>setHover(null)}/>)}</g>)}
     </g>;
    })}</g>}
    <path className="coastline" d={landPath} aria-hidden="true"/>
   </g>
   <g className="geographic-layer idea-map-labels" style={{transform:`translate(${width/2}px,${height/2}px) scale(${scale},${-scale}) translate(${-camera.lon}px,${-camera.lat}px)`}}>{(populationMode?populationLabels:labels).map(l=>labelNode(l,populationMode))}</g>
  </svg>
  <div className="map-text" aria-hidden="true">{oceanLabels.map(([name,lon,lat])=>{const [x,y]=projectPoint([lon,lat],width,height,camera);return <span key={name} className="ocean-name" style={{left:x,top:y,opacity:camera.zoom>2.3?0:undefined}}>{name}</span>;})}</div>
  {compactCountry&&!dragging&&<div className="map-tooltip population-tooltip compact-map-tooltip" role="tooltip" style={{left:Math.max(14,Math.min(width-280,hover.x+20)),top:Math.max(90,Math.min(height-275,hover.y-25))}}><PopulationTooltip feature={hoveredCountry} data={population.data} year={year}/></div>}
  {compact&&!dragging&&<div className="map-tooltip compact-map-tooltip" role="tooltip" style={{left:Math.max(14,Math.min(width-245,hover.x+16)),top:Math.max(110,Math.min(height-145,hover.y+16)),'--region-color':currentHover.color}}><h2>{currentHover.name}</h2><small>{currentHover.relation}</small></div>}
 </main>;
}
