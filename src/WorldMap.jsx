import {useEffect,useMemo,useRef,useState} from 'react';
import land from './land.json';
import {rankedGroups,populationRecordFor} from './religion-population.js';
import {PopulationTooltip} from './ReligionPopulation.jsx';
import {oceanLabels} from './geography.js';
import {clampCamera} from './map-engine.js';
import {footprintAt,projectPoint,unprojectPoint,mapScale,historiesAt,statusAt} from './coverage-engine.js';
import {lineageFor} from './coverage-data.js';
import {regionalSettingsAt} from './tradition-regions.js';
import {placeAreaLabels} from './map-labels.js';
import {polygonArea} from './territory-symbols.js';
import {ringContains} from './polity-engine.js';
import {overviewSchoolsAt,countryOverview} from './tradition-overview.js';
const labelNames={advaita:'Advaita',sunni:'Sunni',shia:'Shiʿi',theravada:'Theravāda',pureland:'Pure Land',confucian:'Confucianism'};
const pathFor=ring=>ring.map(([x,y],i)=>`${i?'L':'M'}${x},${y}`).join(' ')+'Z';
const landPath=land.map(pathFor).join(' ');
const polygonsOf=geometry=>geometry.type==='Polygon'?[geometry.coordinates]:geometry.coordinates;
const geometryIndex=new WeakMap();
const contains=(geometry,point)=>{
 if(!geometryIndex.has(geometry))geometryIndex.set(geometry,polygonsOf(geometry).map(p=>({p,left:Math.min(...p[0].map(c=>c[0])),right:Math.max(...p[0].map(c=>c[0])),bottom:Math.min(...p[0].map(c=>c[1])),top:Math.max(...p[0].map(c=>c[1]))})));
 return geometryIndex.get(geometry).some(({p,left,right,bottom,top})=>point[0]>=left&&point[0]<=right&&point[1]>=bottom&&point[1]<=top&&ringContains(point,p[0])&&!p.slice(1).some(hole=>ringContains(point,hole)));
};
const measureCache=new Map();let textContext;
function measureName(text,size){
 if(!textContext)textContext=document.createElement('canvas').getContext('2d');
 const key=size+':'+text;
 if(!measureCache.has(key)){textContext.font=`500 ${size}px "DM Sans", Arial, sans-serif`;measureCache.set(key,textContext.measureText(text).width);}
 return measureCache.get(key);
}
export default function WorldMap({items,year,yearLabel,selected,camera,setCamera,onTravel,onSelect,onHover,population,populationSelected,onPopulationSelect,regionSelected,onRegionSelect,leftInset=0,rightInset=0}){
 const ref=useRef(null),drag=useRef(null),cameraRef=useRef(camera),travelRef=useRef(onTravel);
 const [size,setSize]=useState(()=>({width:window.innerWidth,height:window.innerHeight})),[dragging,setDragging]=useState(false),[hover,setHover]=useState(null),[fontVersion,setFontVersion]=useState(0);
 cameraRef.current=camera;travelRef.current=onTravel;
 useEffect(()=>{const observer=new ResizeObserver(([entry])=>setSize({width:entry.contentRect.width,height:entry.contentRect.height}));observer.observe(ref.current);return()=>observer.disconnect();},[]);
 useEffect(()=>{let alive=true;document.fonts?.ready.then(()=>{measureCache.clear();if(alive)setFontVersion(v=>v+1);});return()=>{alive=false;};},[]);
 const {width,height}=size,scale=mapScale(width,height,camera);
 const regions=useMemo(()=>regionalSettingsAt(items,year),[items,year]);
 const populationShapes=useMemo(()=>population?.features.flatMap(feature=>{
  const record=populationRecordFor(population.data,feature.properties.demographicCountry||feature.properties.name,year);
  const group=record&&rankedGroups(record.shares)[0];
  return group?[{kind:'country',id:feature.properties.id,feature,record,group,overview:countryOverview(feature,record,items,year)}]:[];
 })||[],[population,year,items]);
 const baseShapes=useMemo(()=>[...regions.map(region=>({kind:'region',id:region.id,region})),...populationShapes],[regions,populationShapes]);
 const related=useMemo(()=>selected?new Set([...lineageFor(selected).map(item=>item.id),...items.filter(item=>lineageFor(item.id).some(parent=>parent.id===selected)).map(item=>item.id)]):null,[selected,items]);
 const shapes=useMemo(()=>overviewSchoolsAt(items,year,selected),[items,year,selected]);
 const projectedLand=useMemo(()=>land.map(ring=>[ring.map(p=>projectPoint(p,width,height,camera))]),[width,height,camera]);
 const hasDetail=selected||populationSelected||regionSelected;
 const insets={left:leftInset,right:rightInset,top:width<700?116:95,bottom:width<700&&hasDetail?height*.56+120:130};
 const labels=useMemo(()=>{
  const project=point=>projectPoint(point,width,height,camera);
  const entries=regions.filter(region=>!populationShapes.some(s=>contains(s.feature.geometry,region.anchor))).map(region=>({item:{id:region.id,name:region.name,priority:10,kind:'region',region},regions:[{area:region.area,polygon:[region.ring.map(project)],anchor:project(region.anchor)}]}));
  for(const {feature,overview,record} of populationShapes){
   const polygons=polygonsOf(feature.geometry);
   entries.push({item:{id:feature.properties.id,name:overview.name,priority:overview.kind==='ideology'?1000:5,overview,kind:'country',feature,record},regions:[...polygons].sort((a,b)=>polygonArea(b)-polygonArea(a)).slice(0,3).map((polygon,i)=>({area:String(i),polygon:polygon.map(ring=>ring.map(project)),anchor:project(feature.properties.label)}))});
  }
  for(const {item,patches} of shapes.filter(s=>!populationShapes.some(p=>p.overview.schoolId===s.item.id))){
   const local=patches.map(p=>({area:p.area,polygon:[p.ring.map(project)],anchor:project(item.label)}));
   // A country label names a community documented within that reporting area;
   // its exact local footprint remains the interactive geometry beneath it.
   const contexts=populationShapes.filter(s=>patches.some(p=>contains(s.feature.geometry,p.ring.reduce((sum,point)=>[sum[0]+point[0]/p.ring.length,sum[1]+point[1]/p.ring.length],[0,0])))).slice(0,1).flatMap(s=>[...polygonsOf(s.feature.geometry)].sort((a,b)=>polygonArea(b)-polygonArea(a)).slice(0,1).map(polygon=>({area:`country-context:${s.id}`,polygon:polygon.map(ring=>ring.filter((_,i)=>i%Math.max(1,Math.ceil(ring.length/80))===0||i===ring.length-1).map(project)),anchor:project(item.label)})));
   entries.push({item:{...item,name:labelNames[item.id]||item.name,kind:'school',priority:item.id===selected?1e9:100+(item.priority||0)},regions:[...local,...contexts]});
  }
  return placeAreaLabels(entries,{width,height,selected:selected||populationSelected||(regionSelected&&'region-'+regionSelected),insets,land:projectedLand,measure:measureName,maxPerItem:1,fontSizes:[11,10,9,8],textPadding:1,linePadding:0,gapX:1,gapY:1,minWidth:16,minHeight:10,widthFraction:.98});
 },[regions,populationShapes,shapes,width,height,camera,selected,populationSelected,regionSelected,leftInset,rightInset,projectedLand,fontVersion]);
 const namedAreas=useMemo(()=>new Set(labels.map(l=>`${l.item.id}:${l.area}`)),[labels]);
 const currentHover=hover?.kind==='school'&&shapes.find(s=>s.item.id===hover.id)?.item;
 const hoveredCountryShape=hover?.kind==='country'&&populationShapes.find(s=>s.id===hover.id);
 const hoveredCountry=hoveredCountryShape?.feature;
 const hoveredRegion=hover?.kind==='region'&&regions.find(r=>r.id===hover.id);
 useEffect(()=>{onHover?.(currentHover?.id||null);},[currentHover?.id,onHover]);
 useEffect(()=>{setHover(null);},[selected,year,populationSelected,regionSelected]);
 useEffect(()=>{const el=ref.current;const wheel=e=>{e.preventDefault();if(e.ctrlKey||e.metaKey)setCamera(old=>clampCamera({...old,zoom:old.zoom*Math.exp(-e.deltaY*.006)}));else travelRef.current((e.deltaY||e.deltaX)*(e.deltaMode===1?16:e.deltaMode===2?400:1));};el.addEventListener('wheel',wheel,{passive:false});return()=>el.removeEventListener('wheel',wheel);},[setCamera]);
 const locate=(event,kind,id,area)=>{if(dragging)return;const rect=ref.current.getBoundingClientRect();setHover({kind,id,area,x:event.clientX-rect.left,y:event.clientY-rect.top});};
 const choose=(id,point)=>{onSelect(id,historiesAt(items,year,point).map(item=>item.id),point);setHover(null);};
 const select=(event,id)=>{if(drag.current?.moved)return;const rect=ref.current.getBoundingClientRect();choose(id,unprojectPoint([event.clientX-rect.left,event.clientY-rect.top],width,height,camera));};
 const chooseBase=shape=>{if(drag.current?.moved)return;shape.kind==='country'?onPopulationSelect(shape.feature):onRegionSelect(shape.region);setHover(null);};
 const focusAt=(kind,id,anchor,area)=>{const [x,y]=projectPoint(anchor,width,height,camera);setHover({kind,id,area,x,y});};
 const down=e=>{if(e.button!==0||e.target.closest('button,[data-idea-label],[data-region-label],[data-population-label]'))return;drag.current={x:e.clientX,y:e.clientY,lastY:e.clientY,camera:cameraRef.current,type:e.pointerType,moved:false};};
 const move=e=>{const d=drag.current;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(!d.moved&&Math.hypot(dx,dy)<5)return;d.moved=true;setDragging(true);setHover(null);if(!e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.setPointerCapture(e.pointerId);if(d.type==='touch'&&Math.abs(dy)>Math.abs(dx)){travelRef.current((d.lastY-e.clientY)*2);d.lastY=e.clientY;}else setCamera(clampCamera({...d.camera,lon:d.camera.lon-dx/mapScale(width,height,d.camera),lat:d.camera.lat+dy/mapScale(width,height,d.camera)}));};
 const up=()=>{setDragging(false);requestAnimationFrame(()=>{drag.current=null;});};
 const activate=(event,action)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();action();}};
 const labelNode=label=>{
  const item=label.item;
  const action=()=>item.kind==='country'?(item.overview?.schoolId?choose(item.overview.schoolId,item.feature.properties.label):chooseBase({kind:'country',feature:item.feature,overview:item.overview})):item.kind==='region'?chooseBase({kind:'region',region:item.region}):choose(item.id,label.area.startsWith('country-context:')?item.label:unprojectPoint([label.x,label.y],width,height,camera));
  const aria=item.kind==='country'?`Religious composition of ${item.feature.properties.name}`:item.kind==='region'?`Traditions in ${item.region.label}`:`Explore ${item.name}`;
  return <g key={`${item.id}:${label.area}`} data-idea-label={item.kind==='school'?item.id:undefined} data-region-label={item.kind==='region'?item.id:undefined} data-population-label={item.kind==='country'?item.id:undefined} data-label-area={label.area} className={`idea-map-label ${selected===item.id?'selected':''}`} transform={`translate(${unprojectPoint([label.x,label.y],width,height,camera).join(' ')}) scale(${1/scale} ${-1/scale})`} role="button" tabIndex={0} aria-label={aria} onClick={action} onKeyDown={e=>activate(e,action)}>
   <text textAnchor="middle" dominantBaseline="central" style={{fontSize:label.fontSize}}>{label.lines.map((line,i)=><tspan key={i} x="0" y={(i-(label.lines.length-1)/2)*label.lineHeight}>{line}</tspan>)}</text>
  </g>;
 };
 const compact=currentHover&&!namedAreas.has(`${currentHover.id}:${hover.area}`);
 const compactCountry=hoveredCountry&&!labels.some(l=>l.item.id===hoveredCountry.properties.id);
 const compactRegion=hoveredRegion&&!labels.some(l=>l.item.id===hoveredRegion.id);
 return <main ref={ref} className={`world-map thought-map unified-traditions ${dragging?'dragging':''}`} data-testid="world-map" tabIndex={0} aria-label="Traditions map. Scroll forward and backward through history. Drag to pan; select a region to explore." onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
  <svg className="map-svg" width={width} height={height} aria-label={`Traditions, ${yearLabel}`}>
   <g className="geographic-layer" style={{transform:`translate(${width/2}px,${height/2}px) scale(${scale},${-scale}) translate(${-camera.lon}px,${-camera.lat}px)`}}>
    <defs><clipPath id="thought-land-clip"><path d={landPath}/></clipPath></defs>
    <g className="graticule" aria-hidden="true">{[-150,-120,-90,-60,-30,0,30,60,90,120,150].map(lon=><path key={lon} d={`M${lon},-62V82`}/>)}{[-60,-30,0,30,60].map(lat=><path key={lat} d={`M-180,${lat}H180`}/>)}</g>
    <path className="land" d={landPath} aria-hidden="true"/>
    <g className="regional-basemap" clipPath="url(#thought-land-clip)"><g data-regional-year={year}>
     {baseShapes.map(shape=>shape.kind==='region'?<g key={shape.id}>
      <defs><pattern id={`tradition-${shape.id}`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">{shape.region.colors.map((color,i,colors)=><rect key={i} x={4*i/colors.length} y="0" width={4/colors.length+.03} height="4" fill={color}/>)}</pattern></defs>
      <path d={pathFor(shape.region.ring)} className={`tradition-region-area ${regionSelected===shape.region.area?'selected':''}`} data-regional-area={shape.region.area} fill={`url(#tradition-${shape.id})`} role="button" tabIndex={0} aria-label={`Traditions in ${shape.region.label}`} onPointerEnter={e=>locate(e,'region',shape.id)} onPointerMove={e=>locate(e,'region',shape.id)} onPointerLeave={()=>setHover(null)} onClick={()=>chooseBase(shape)} onKeyDown={e=>activate(e,()=>chooseBase(shape))} onFocus={()=>focusAt('region',shape.id,shape.region.anchor)} onBlur={()=>setHover(null)}/>
     </g>:<path key={shape.id} d={shape.feature.path} data-population-country={shape.feature.properties.demographicCountry||shape.feature.properties.name} data-estimate-year={shape.record.year} className={`population-area ${populationSelected===shape.id?'selected':''}`} fill={shape.overview.color} data-overview-kind={shape.overview.kind} fillRule="evenodd" role="button" tabIndex={0} aria-label={`Religious composition of ${shape.feature.properties.name}`} onPointerEnter={e=>locate(e,'country',shape.id)} onPointerMove={e=>locate(e,'country',shape.id)} onPointerLeave={()=>setHover(null)} onClick={()=>chooseBase(shape)} onKeyDown={e=>activate(e,()=>chooseBase(shape))} onFocus={()=>focusAt('country',shape.id,shape.feature.properties.label)} onBlur={()=>setHover(null)}/>)}
    </g></g>
    <g className="idea-areas tradition-details" clipPath="url(#thought-land-clip)"><g data-thought-year={year}>
     {shapes.map(({item,patches})=><g key={item.id} className={`idea-region ${selected===item.id?'selected':''} ${related&&!related.has(item.id)?'quiet':''}`} style={{'--idea-color':item.color}}>{patches.map((patch,i)=><path key={patch.key} d={pathFor(patch.ring)} className="idea-region-hit" data-entity={item.id} data-area={patch.area} role="button" tabIndex={i===0?0:-1} aria-label={`${item.name}: ${statusAt(item,year)}. Open details.`} aria-pressed={selected===item.id} onPointerEnter={e=>locate(e,'school',item.id,patch.area)} onPointerMove={e=>locate(e,'school',item.id,patch.area)} onPointerLeave={()=>setHover(null)} onClick={e=>select(e,item.id)} onKeyDown={e=>activate(e,()=>choose(item.id,item.label))} onFocus={()=>focusAt('school',item.id,item.label,patch.area)} onBlur={()=>setHover(null)}/>)}</g>)}
    </g></g>
    <path className="coastline" d={landPath} aria-hidden="true"/>
   </g>
   <g className="geographic-layer idea-map-labels" style={{transform:`translate(${width/2}px,${height/2}px) scale(${scale},${-scale}) translate(${-camera.lon}px,${-camera.lat}px)`}}>{labels.map(labelNode)}</g>
  </svg>
  <div className="map-text" aria-hidden="true">{oceanLabels.map(([name,lon,lat])=>{const [x,y]=projectPoint([lon,lat],width,height,camera);return <span key={name} className="ocean-name" style={{left:x,top:y,opacity:camera.zoom>2.3?0:undefined}}>{name}</span>;})}</div>
  {hover&&!dragging&&(compactCountry||compact||compactRegion)&&<div className={`map-tooltip compact-map-tooltip ${compactCountry?'population-tooltip':''}`} role="tooltip" style={{left:Math.max(14,Math.min(width-280,hover.x+16)),top:Math.max(110,Math.min(height-200,hover.y+16))}}>{compactCountry?hoveredCountryShape.overview.kind==='ideology'?<><h2>{hoveredCountryShape.overview.name}</h2><small>State ideology · Mao Zedong Thought remains a guiding principle of the PRC; this is not a population estimate.</small></>:<PopulationTooltip feature={hoveredCountry} data={population.data} year={year}/>:compact?<><h2>{currentHover.name}</h2><small>{currentHover.relation}</small></>:compactRegion?<><h2>{hoveredRegion.label}</h2><small>{hoveredRegion.items.slice(0,4).map(i=>i.name).join(' · ')}</small></>:null}</div>}
 </main>;
}
