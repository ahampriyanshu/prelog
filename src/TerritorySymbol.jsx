import {assetUrl} from './asset-url.js';
import {memo,useId,useState} from 'react';
import ratios from '../data/empires/symbol-image-sizes.json';
import {territorySymbolLayout} from './territory-symbols.js';

function TerritorySymbol({geometry,symbol,selected,muted,hovered,scale}) {
 const uid=useId().replaceAll(':',''),[failed,setFailed]=useState(null);
 if(!symbol||failed===symbol.src)return null;
 const emblem=symbol.kind!=='flag'||symbol.display==='emblem';
 const layout=territorySymbolLayout(geometry,emblem);
 const ratio=ratios[symbol.src]||4/3;
 const mode=emblem?'emblem':'flag';
 const emphasis=selected?'selected':muted?'muted':hovered?'hovered':'';
 if(emblem){
  const spot=layout.emblem,primary=layout.territories[0];
  if(!spot||spot.radius*scale<5)return null;
  const [x,y]=spot.point,r=Math.min(spot.radius,32/scale),extent=r/Math.SQRT2,crop=symbol.mapCrop||[0,0,1,1],photo=!symbol.src.endsWith('.svg');
  return <g className={`territory-symbol territory-${mode} ${emphasis}`} aria-hidden="true" pointerEvents="none" data-symbol-source={symbol.src} data-symbol-kind={symbol.kind}>
   <defs><clipPath id={`${uid}-territory`}><path d={primary.path} clipRule="evenodd"/></clipPath><clipPath id={`${uid}-artifact`}><circle cx={x} cy={y} r={r}/></clipPath></defs>
   <g clipPath={`url(#${uid}-territory)`}><g clipPath={photo?`url(#${uid}-artifact)`:undefined}>
    {photo&&<circle cx={x} cy={y} r={r} fill="#f7f3e8" stroke="#6b755d" strokeOpacity=".4" strokeWidth={1/scale}/>}
    <svg x={x-extent} y={-y-extent} width={extent*2} height={extent*2} transform="scale(1,-1)" viewBox={`${crop[0]*ratio} ${crop[1]} ${crop[2]*ratio} ${crop[3]}`} preserveAspectRatio="xMidYMid meet" overflow="hidden"><image key={symbol.src} href={assetUrl(symbol.src)} width={ratio} height="1" onError={()=>setFailed(symbol.src)}/></svg>
   </g></g>
  </g>;
 }
 return <g className={`territory-symbol territory-${mode} ${emphasis}`} aria-hidden="true" pointerEvents="none" data-symbol-source={symbol.src} data-symbol-kind={symbol.kind}>
  {layout.territories.map((part,i)=>{const [w,s,e,n]=part.bounds;if((e-w)*scale<3||(n-s)*scale<3)return null;return <g key={i}>
   <defs><clipPath id={`${uid}-${i}`} clipPathUnits="userSpaceOnUse"><path d={part.path} clipRule="evenodd"/></clipPath></defs>
   <g clipPath={`url(#${uid}-${i})`}><svg x={w} y={-n} width={e-w} height={n-s} transform="scale(1,-1)" viewBox={`0 0 ${ratio} 1`} preserveAspectRatio="none" overflow="hidden"><image href={assetUrl(symbol.src)} width={ratio} height="1" onError={()=>setFailed(symbol.src)}/></svg></g>
  </g>;})}
 </g>;
}
export default memo(TerritorySymbol);
