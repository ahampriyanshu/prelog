import {useMemo,useState} from 'react';
import {nodes} from './data.js';
import {coverage,coverageById,families,familyById,featuredIds} from './coverage-data.js';
import {normalize,formatYear} from './engine.js';
import {footprintAt} from './coverage-engine.js';
import {Icon,Button} from './Icons.jsx';
export default function Catalogue({year,kind,onKind,family,onFamily,hidden,onToggle,onShowAll,onSelect,onClose}){
 const [query,setQuery]=useState(''),[period,setPeriod]=useState('all');
 const results=useMemo(()=>{
  const terms=normalize(query).split(' ').filter(Boolean);
  return nodes.filter(n=>{const c=coverageById[n.id];return (kind==='all'||n.kind===kind)&&(!family||c.family===family)&&(period==='all'||footprintAt(c,year).length)&&terms.every(t=>normalize(`${n.name} ${n.aliases||''} ${n.ideas.join(' ')} ${c.relation} ${familyById[c.family].name}`).includes(t));}).sort((a,b)=>{
   const ai=featuredIds.indexOf(a.id),bi=featuredIds.indexOf(b.id);
   return (ai<0?100:ai)-(bi<0?100:bi)||a.name.localeCompare(b.name);
  });
 },[query,kind,family,period,year]);
 return <aside className="layer-panel catalogue" aria-label="Schools and ideologies">
  <div className="panel-top"><span>EXPLORE {coverage.length} SCHOOLS & IDEAS</span><Button icon="close" label="Close catalogue" onClick={onClose}/></div>
  <label className="catalogue-query"><Icon name="search" size={14}/><input aria-label="Find a school or ideology" placeholder="Ahmadiyya, Nirankari, Mormon…" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button aria-label="Clear catalogue search" onClick={()=>setQuery('')}>×</button>}</label>
  <select className="family-select" aria-label="Filter by family" value={family} onChange={e=>onFamily(e.target.value)}><option value="">Every family</option>{families.filter(f=>kind==='all'||f.ids.some(id=>coverageById[id].kind===kind)).map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select>
  <div className="catalogue-period"><button aria-pressed={period==='all'} onClick={()=>setPeriod('all')}>All history</button><button aria-pressed={period==='now'} onClick={()=>setPeriod('now')}>At {formatYear(year)}</button><span>{results.length}</span></div>
  <div className="layer-list">{results.map(n=>{const item=coverageById[n.id],present=footprintAt(item,year).length>0;return <div className={`layer-row ${present?'present':''}`} key={n.id}>
   <label title={`Show ${n.name} on the map`}><input type="checkbox" aria-label={`Show ${n.name}`} checked={!hidden.includes(n.id)} onChange={()=>onToggle(n.id)}/><i style={{background:item.color}}/></label>
   <button aria-label={`Explore ${n.name} from catalogue`} onClick={()=>onSelect(n.id)}><span>{n.name}<small>{item.parentId?coverageById[item.parentId].name:item.relation} · {formatYear(n.year)}</small></span><span className={`catalogue-date-status ${present?'active':''}`} title={present?'Mapped at this date':'Selecting jumps to its mapped period'}>{present?<i/>:<Icon name="arrow" size={12}/>}</span></button>
  </div>;})}{!results.length&&<p className="empty">No matches in this selection.<button onClick={()=>{setQuery('');onKind('all');onFamily('');setPeriod('all');}}>Show all schools and ideas</button></p>}</div>
  <div className="catalogue-bottom"><span>{period==='all'?'Select any entry to visit its time and place.':'Each entry has its own geographic record.'}</span>{hidden.length>0&&<button onClick={onShowAll}>Restore hidden</button>}</div>
 </aside>;
}
