import {useEffect,useMemo,useRef,useState} from 'react';
import land from './land.json';
import EntitySymbol,{symbolFor} from './EntitySymbol.jsx';
import TerritorySymbol from './TerritorySymbol.jsx';
import useBoundaryTransition from './useBoundaryTransition.js';
import {oceanLabels} from './geography.js';
import {geometryPath,polityColor,snapshotLabel,snapshotKey} from './polity-engine.js';
const landPath=land.map(r=>r.map(([x,y],i)=>`${i?'L':'M'}${x},${y}`).join(' ')+'Z').join(' ');
export const politicalScale=(w,h,c)=>Math.min(w/370,h/170)*c.zoom;
export const boundCamera=c=>({lon:Math.max(-180,Math.min(180,c.lon)),lat:Math.max(-55,Math.min(75,c.lat)),zoom:Math.max(1,Math.min(12,c.zoom))});
export default function PolityMap({features,records,snapshot,symbolTime,selected,filterIds,camera,setCamera,onSelect,onTravel,leftInset=0,rightInset=0}){
 const ref=useRef(null),drag=useRef(null),travel=useRef(onTravel),cam=useRef(camera);
 const [size,setSize]=useState({width:window.innerWidth,height:window.innerHeight}),[hover,setHover]=useState(null),[dragging,setDragging]=useState(false);
 travel.current=onTravel;cam.current=camera;
 useEffect(()=>{const o=new ResizeObserver(([e])=>setSize({width:e.contentRect.width,height:e.contentRect.height}));o.observe(ref.current);return()=>o.disconnect();},[]);
 useEffect(()=>{const el=ref.current;const wheel=e=>{e.preventDefault();if(e.ctrlKey||e.metaKey)setCamera(c=>boundCamera({...c,zoom:c.zoom*Math.exp(-e.deltaY*.006)}));else travel.current((e.deltaY||e.deltaX)*(e.deltaMode===1?16:e.deltaMode===2?400:1));};el.addEventListener('wheel',wheel,{passive:false});return()=>el.removeEventListener('wheel',wheel);},[setCamera]);
 useEffect(()=>setHover(null),[snapshot?.year,selected]);
 const {width,height}=size,scale=politicalScale(width,height,camera);
 const shapes=useMemo(()=>features.map(f=>({...f,path:geometryPath(f.geometry)})),[features]);
 const layers=useBoundaryTransition(shapes,snapshot);
 const visible=useMemo(()=>shapes.filter(f=>!filterIds||filterIds.has(f.properties.id)||f.properties.id===selected),[shapes,filterIds,selected]);
 const labels=useMemo(()=>{const placed=[],boxes=[],seen=new Set();for(const f of [...visible].sort((a,b)=>Number(b.properties.id===selected)-Number(a.properties.id===selected)||(b.properties.size||0)-(a.properties.size||0))){const p=f.properties,r=records[p.id],anchor=p.label;if(!anchor||p.overlay||seen.has(p.id))continue;const x=width/2+(anchor[0]-camera.lon)*scale,y=height/2-(anchor[1]-camera.lat)*scale,text=r?.name||p.name,w=Math.min(205,text.length*5.7+12);if(x<leftInset+25+w/2||x>width-rightInset-25-w/2||y<110||y>height-130)continue;const box={x:x-w/2,y:y-10,w,h:20};if(boxes.some(b=>box.x<b.x+b.w+16&&box.x+box.w>b.x-16&&box.y<b.y+b.h+12&&box.y+box.h>b.y-12))continue;boxes.push(box);seen.add(p.id);placed.push({id:p.id,text,x,y});if(placed.length>75)break;}return placed;},[visible,records,camera,scale,width,height,leftInset,rightInset,selected,snapshot]);
 const locate=(e,id)=>{if(dragging)return;setHover({id,x:e.clientX,y:e.clientY});};
 const down=e=>{if(e.button!==0||e.target.closest('button'))return;drag.current={x:e.clientX,y:e.clientY,lastY:e.clientY,camera:cam.current,moved:false,type:e.pointerType};};
 const move=e=>{const d=drag.current;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(!d.moved&&Math.hypot(dx,dy)<5)return;d.moved=true;setDragging(true);setHover(null);if(!e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.setPointerCapture(e.pointerId);if(d.type==='touch'&&Math.abs(dy)>Math.abs(dx)){travel.current((d.lastY-e.clientY)*2);d.lastY=e.clientY;}else setCamera(boundCamera({...d.camera,lon:d.camera.lon-dx/politicalScale(width,height,d.camera),lat:d.camera.lat+dy/politicalScale(width,height,d.camera)}));};
 const select=id=>{if(drag.current?.moved)return;onSelect(id);setHover(null);};
 const hovered=hover&&records[hover.id];
 return <main ref={ref} className={`world-map political-map ${dragging?'dragging':''}`} tabIndex={0} aria-label="Empires map. Scroll forward and backward through history. Drag to pan." onPointerDown={down} onPointerMove={move} onPointerUp={()=>{setDragging(false);setTimeout(()=>{drag.current=null;},0);}} onPointerCancel={()=>{drag.current=null;setDragging(false);}}>
  <svg className="map-svg" width={width} height={height} aria-label={`Political boundaries, ${snapshotLabel(snapshot)}`}>
   <defs><pattern id="territory-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="5" stroke="#8e6c50" strokeWidth="1.2" opacity=".45"/></pattern></defs>
   <g className="geographic-layer" style={{transform:`translate(${width/2}px,${height/2}px) scale(${scale},${-scale}) translate(${-camera.lon}px,${-camera.lat}px)`}}>
    <g className="graticule" aria-hidden="true">{[-150,-120,-90,-60,-30,0,30,60,90,120,150].map(l=><path key={l} d={`M${l},-60V85`}/>)}{[-60,-30,0,30,60].map(l=><path key={l} d={`M-180,${l}H180`}/>)}</g>
    <path className="land" d={landPath}/>
    {layers.map(layer=><g key={layer.key} className="boundary-layer" style={{opacity:layer.opacity,pointerEvents:layer.key===snapshot.file?undefined:'none'}} aria-hidden={layer.key!==snapshot.file||undefined} data-boundary-layer={layer.key}>{layer.shapes.map(f=>{const p=f.properties,active=!filterIds||filterIds.has(p.id),r=records[p.id];return <g key={p.key||p.id} className="polity-territory"><path aria-hidden="true" className={`polity-underlay ${selected&&selected!==p.id?'muted':''} ${active?'':'filtered'}`} d={f.path} fill={p.overlay?'none':polityColor(p.subject||p.id)} fillRule="evenodd" pointerEvents="none"/>{active&&!p.overlay&&<TerritorySymbol geometry={f.geometry} symbol={symbolFor(p.id,symbolTime)} selected={selected===p.id} muted={!!selected&&selected!==p.id} hovered={hover?.id===p.id} scale={scale}/>}<path className={`polity-area ${p.overlay?'disputed-area':''} ${selected===p.id?'selected':''} ${selected&&selected!==p.id?'muted':''} ${active?'':'filtered'}`} d={f.path} fill={p.overlay?'url(#territory-hatch)':'transparent'} fillRule="evenodd" data-polity={p.id} data-snapshot={snapshotKey(layer.snapshot)} tabIndex={active&&layer.key===snapshot.file?0:-1} role="button" aria-label={`Explore ${r?.name||p.name}`} aria-pressed={selected===p.id} onPointerEnter={e=>active&&locate(e,p.id)} onPointerMove={e=>active&&locate(e,p.id)} onPointerLeave={()=>setHover(null)} onClick={()=>active&&select(p.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();onSelect(p.id);}}} onFocus={()=>{if(p.label)setHover({id:p.id,x:width/2+(p.label[0]-camera.lon)*scale,y:height/2-(p.label[1]-camera.lat)*scale});}} onBlur={()=>setHover(null)}/></g>;})}</g>)}
   </g>
  </svg>
  <div className="map-text" aria-hidden="true">{oceanLabels.map(([name,lon,lat])=><span key={name} className="ocean-name" style={{left:width/2+(lon-camera.lon)*scale,top:height/2-(lat-camera.lat)*scale,opacity:camera.zoom>2.3?0:undefined}}>{name}</span>)}</div>
  <div className="polity-labels">{labels.map(l=><button key={l.id} className={selected===l.id?'selected':''} style={{left:l.x,top:l.y}} onClick={()=>onSelect(l.id)} onPointerEnter={e=>locate(e,l.id)} onPointerLeave={()=>setHover(null)} aria-label={`Open ${l.text} profile`}><span>{l.text}</span></button>)}</div>
  {hovered&&!dragging&&<div role="tooltip" className="map-tooltip polity-tooltip" style={{left:Math.max(12,Math.min(width-292,hover.x+18)),top:Math.max(90,Math.min(height-250,hover.y+16))}}><div>{hovered.typeLabel||hovered.type.replaceAll('-',' ')} · {snapshotLabel(snapshot)}</div><h2><EntitySymbol record={hovered} snapshot={symbolTime}/>{hovered.name}</h2>{hovered.capital&&<p>Capital: {hovered.capital}</p>}<p>{hovered.summary||hovered.periodLabel||'Select to inspect the dated record and sources.'}</p></div>}
 </main>;
}
