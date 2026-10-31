import {useEffect,useRef} from 'react';
import {Button,Icon} from './Icons.jsx';
export default function RegionalInspector({region,yearLabel,onSelect,onClose}){
 const heading=useRef(null);
 useEffect(()=>{heading.current?.focus({preventScroll:true});},[region.id]);
 return <aside className="detail-panel regional-panel" aria-label="Regional traditions">
  <div className="panel-top"><Button icon="close" label="Close regional details" onClick={onClose}/></div>
  <div className="detail-scroll"><h1 ref={heading} tabIndex={-1}>{region.label}</h1><div className="detail-date">{yearLabel} · Regional reconstruction</div>
   <p className="summary">Named communities and schools recorded in this region. They can coexist; the shading does not measure their population shares.</p>
   <section className="related-section regional-tradition-list"><h3>Traditions & ideas</h3>{region.items.map(item=><button key={item.id} onClick={()=>onSelect(item.id)}><i style={{background:item.color}}/><span>{item.name}<small>{item.relation}</small></span><Icon name="arrow" size={13}/></button>)}</section>
  </div>
 </aside>;
}
