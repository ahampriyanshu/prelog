import './religion.css';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {nodeById,sources,edges} from './data.js';
import {searchNodes,formatYear,WORLD} from './engine.js';
import {clampCamera} from './map-engine.js';
import {thoughtTimeStops,thoughtYear,focusThoughtCamera} from './thought-map.js';
import {stepTime,wheelBudget} from './political-time.js';
import PoliticalTimeControls from './PoliticalTimeControls.jsx';
const thoughtStops=thoughtTimeStops(coverage);
import {coverage,coverageById,coverageForNode,familyById,lineageFor} from './coverage-data.js';
import {DEFAULT_CAMERA,footprintAt,stageAt,fitFootprint} from './coverage-engine.js';
import {Icon,Button} from './Icons.jsx';
import WorldMap from './WorldMap.jsx';
import DatasetTabs from './DatasetTabs.jsx';
import {loadReligionPopulation,PopulationLegend,PopulationInspector} from './ReligionPopulation.jsx';
import {snapshotYear} from './religion-population.js';

function Search({onClose,onSelect}){
 const [query,setQuery]=useState('');const ref=useRef(null),input=useRef(null);
 useEffect(()=>{ref.current.showModal();input.current.focus();},[]);
 const results=searchNodes(query);
 return <dialog ref={ref} className="search-dialog" aria-label="Search the atlas" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
  <div className="search-input"><Icon name="search"/><input ref={input} aria-label="Search religions and philosophies" placeholder="Find a religion, school or philosophy…" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&results[0])onSelect(results[0].id);}}/><Button icon="close" label="Close search" onClick={onClose}/></div>
  <div className="search-meta">{results.length} historical records <span>ESC to close</span></div>
  <div className="search-results">{results.map(n=>{const layer=coverageForNode(n.id);return <button key={n.id} onClick={()=>onSelect(n.id)}><i style={{background:layer?.color||'#a4aba0'}}/><span><strong>{n.name}</strong><small>{layer?`${familyById[layer.family].name} · ${layer.relation}`:'Reading record · extent not yet mapped'}</small></span><time>{formatYear(n.year)}</time><Icon name="arrow" size={14}/></button>;})}{!results.length&&<p className="empty">No matching history. Try a broader name.</p>}</div>
 </dialog>;
}
function Method({onClose}){
 const ref=useRef(null);useEffect(()=>{ref.current.showModal();},[]);
 return <dialog ref={ref} className="method-dialog" aria-labelledby="method-title" onCancel={onClose}><div className="panel-top"><span>READING THE MAP</span><Button icon="close" label="Close map guide" onClick={onClose}/></div><h2 id="method-title">Presence has<br/>many meanings.</h2><p>The map keeps the same geographic view through time, ending at 2020 and then Today. Shading cross-fades between dates; earlier estimates are not invented. Population view uses Pew Research Center’s 2010 and 2020 estimates for 201 countries and territories. Colour identifies the largest affiliation; click any country for all seven measured groups. A majority colour does not make every resident a member. Hatching marks places outside this dataset.</p><p>Schools & ideas shows named communities, lineages and philosophical centres. Its footprints and transitions are approximate illustrations, not measured religious borders. A blank historical area means this catalogue has not mapped a centre there. It never means people had no beliefs.</p><p>Names sit inside their mapped areas; zooming reveals smaller schools. If a name cannot fit, hover its shaded area or select it for details. Related branches share a colour. Communities and ideas overlap. Select a region to read its explanation, dated stages, and sources. Every one of the {coverage.length} entries has its own mapped settings. The catalogue includes denominations, legal schools, spiritual lineages, philosophies and political currents. These categories overlap; they are not mutually exclusive populations. Use search or select a mapped area to look more closely. Religion and philosophy share this collection; the Empires atlas is separate.</p><div className="guide-controls"><span>Scroll down / up</span><b>Move forward / rewind</b><span>Drag · + / −</span><b>Pan · zoom</b><span>Hover · click an area</span><b>Preview · explore</b><span>Space · ← / →</span><b>Play / pause · step through time</b></div><a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noreferrer">Public-domain basemap: Natural Earth ↗</a></dialog>;
}
function Inspector({id,year,yearLabel,overlaps,onClose,onSelect,onYear,onFit}){
 const n=nodeById[id],layer=coverageForNode(id),heading=useRef(null);
 useEffect(()=>{heading.current?.focus({preventScroll:true});},[id]);
 const stage=layer&&stageAt(layer,year),visible=layer&&footprintAt(layer,year).length>0;
 const children=coverage.filter(c=>c.parentId===id),siblings=coverage.filter(c=>c.parentId&&c.parentId===layer?.parentId&&c.id!==id);
 const related=[...new Set([...siblings.map(c=>c.id),...edges.filter(e=>e.from===id||e.to===id).map(e=>e.from===id?e.to:e.from)])].filter(key=>key!==id&&!children.some(child=>child.id===key)&&!lineageFor(id).some(parent=>parent.id===key));
 const lineage=lineageFor(id);
 const reading=sources[n.source];
 return <aside className="detail-panel" aria-label="Historical details" style={{'--region-color':layer?.color||'#80917b'}}>
  <div className="panel-top"><span>{familyById[layer.family].name}</span><Button icon="close" label="Close details" onClick={onClose}/></div>
  <div className="detail-scroll"><span className="detail-eyebrow"><i/>{layer.relation.toUpperCase()}</span>{lineage.length>1&&<nav className="lineage-path" aria-label="Historical relationships">{lineage.map((ancestor,i)=><span key={ancestor.id}>{i>0&&<span aria-hidden="true">›</span>}<button disabled={ancestor.id===id} onClick={()=>onSelect(ancestor.id)}>{ancestor.name}</button></span>)}</nav>}<h1 ref={heading} tabIndex={-1}>{n.name}</h1><div className="detail-date">{n.date||`${n.approx?'c. ':''}${formatYear(n.year)}`}</div><p className="summary">{n.summary}</p><div className="idea-tags">{n.ideas.map(idea=><span key={idea}>{idea}</span>)}</div>
   {layer?<><section className="now-card"><div><span>AT {yearLabel}</span><span className="status-dot"/></div><h2>{stage?.title||'Before the first mapped record'}</h2><p>{stage?.text||`The first regional record in this layer begins around ${formatYear(layer.start)}.`}</p>{layer.geographyNote&&<p className="mapping-note">{layer.geographyNote}</p>}<button className="text-action" onClick={()=>visible?onFit(layer):onYear(layer.start)}>{visible?'Focus this area':'Go to the first record'}<Icon name="arrow" size={15}/></button></section>
   <section className="stage-section"><h3>How the geography changes</h3>{layer.stages.map((s,i)=><button key={s.year} className={stage===s?'active':''} onClick={()=>onYear(s.year)}><span className="stage-track"><i/></span><span><time>{formatYear(s.year)}</time><strong>{s.title}</strong></span><Icon name="arrow" size={13}/></button>)}</section></>:<section className="now-card"><h2>A reading record</h2><p>A defensible regional extent has not been mapped for this idea yet. Its historical context and sources remain available here.</p></section>}
   {overlaps.filter(key=>key!==layer?.id).length>0&&<section className="related-section"><h3>Other mapped histories nearby</h3>{overlaps.filter(key=>key!==layer?.id).map(key=><button key={key} onClick={()=>onSelect(key)}><i style={{background:coverageById[key].color}}/>{coverageById[key].name}<Icon name="arrow" size={13}/></button>)}</section>}
   {!!children.length&&<section className="related-section"><h3>Branches & later schools</h3>{children.map(child=><button key={child.id} onClick={()=>onSelect(child.id)}><span>{child.name}<small>{child.relation}</small></span><Icon name="arrow" size={13}/></button>)}</section>}
   {!!related.length&&<section className="related-section"><h3>Related schools & movements</h3>{related.map(key=><button key={key} onClick={()=>onSelect(key)}><span>{nodeById[key].name}<small>{formatYear(nodeById[key].year)}</small></span><Icon name="arrow" size={13}/></button>)}</section>}
   {n.note&&<p className="historical-note">{n.note}</p>}
   <section className="source-section"><h3>Sources & interpretation</h3><p>Approximate regional sketches. The readings support the historical context; the boundaries are illustrative.</p>{[...(layer?.readings||[]),{title:reading[1],url:reading[2]}].filter((source,i,all)=>all.findIndex(s=>s.url===source.url)===i).map(source=><a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title}<Icon name="external" size={13}/></a>)}</section>
  </div>
 </aside>;
}
export default function App({onDataset}){
 const [date,setDate]=useState('modern'),[camera,setCamera]=useState(()=>window.innerWidth<700?{lon:60,lat:18,zoom:4.4}:window.innerWidth/window.innerHeight<1.15?{lon:38,lat:23,zoom:1.7}:DEFAULT_CAMERA),[selected,setSelected]=useState(null),[overlaps,setOverlaps]=useState([]);
 const [family,setFamily]=useState(''),[searchOpen,setSearchOpen]=useState(false),[guideOpen,setGuideOpen]=useState(false);
 const year=thoughtYear(date),yearLabel=date==='modern'?'Today':formatYear(year);
 const [playing,setPlaying]=useState(false),[fullscreen,setFullscreen]=useState(false),[notice,setNotice]=useState('');
 const [population,setPopulation]=useState(null),[populationError,setPopulationError]=useState(false),[populationRetry,setPopulationRetry]=useState(0),[mapMode,setMapMode]=useState('schools'),[populationSelected,setPopulationSelected]=useState(null);
 const hasPopulation=snapshotYear(year)!==null,populationMode=hasPopulation&&mapMode==='population';
 useEffect(()=>{if(!hasPopulation||mapMode!=='population')return;let cancelled=false;setPopulationError(false);loadReligionPopulation().then(data=>{if(!cancelled)setPopulation(data);}).catch(()=>{if(!cancelled)setPopulationError(true);});return()=>{cancelled=true;};},[hasPopulation,mapMode,populationRetry]);
 useEffect(()=>{if(!hasPopulation)setPopulationSelected(null);},[hasPopulation]);
 const dateRef=useRef(date),wheel=useRef(0),wheelTimer=useRef(null),yearRef=useRef(year),mapRef=useRef(null),searchTrigger=useRef(null),actions=useRef({});
 yearRef.current=year;dateRef.current=date;
 const items=useMemo(()=>coverage.filter(item=>!family||item.family===family),[family]);
 const mapItems=items;
 const selectedLayer=selected&&coverageForNode(selected);
 const active=items.filter(item=>footprintAt(item,year).length);
 const moveTo=useCallback(value=>{const next=value==='modern'||value>2020?'modern':Math.max(WORLD[0],Math.min(2020,Math.round(value)||1));dateRef.current=next;yearRef.current=thoughtYear(next);setDate(next);},[]);
 const stopWheel=useCallback(()=>{clearTimeout(wheelTimer.current);wheelTimer.current=null;wheel.current=0;},[]);
 useEffect(()=>()=>stopWheel(),[stopWheel]);
 const travel=useCallback(delta=>{
  if(!delta)return;setPlaying(false);wheel.current=wheelBudget(wheel.current,delta);
  const consume=()=>{wheelTimer.current=null;if(Math.abs(wheel.current)<100)return;const direction=Math.sign(wheel.current);wheel.current-=direction*100;moveTo(stepTime(thoughtStops,dateRef.current,direction));wheelTimer.current=setTimeout(consume,140);};
  if(!wheelTimer.current)consume();
 },[moveTo]);
 const jump=value=>{stopWheel();setPlaying(false);moveTo(value);};
 const select=(id,others=[],point=null)=>{stopWheel();setMapMode('schools');setPopulationSelected(null);setPlaying(false);setSelected(id);setOverlaps(others);setSearchOpen(false);const layer=coverageForNode(id);if(layer)fit(layer,yearRef.current,point);};
 const explore=id=>{const layer=coverageById[id];let at=yearRef.current;if(!footprintAt(layer,at).length){at=layer.start;moveTo(at);}if(family&&layer.family!==family)setFamily('');select(id);};
 function chooseFamily(id){setMapMode('schools');setPopulationSelected(null);setFamily(id);setSelected(null);setOverlaps([]);if(!id){setCamera(DEFAULT_CAMERA);return;}const patches=coverage.filter(c=>c.family===id).flatMap(c=>c.patches);const combined={patches};if(!footprintAt(combined,yearRef.current).length)return;const next=fitFootprint(combined,yearRef.current);setCamera(clampCamera(next));}
 const closeDetail=()=>{setPopulationSelected(null);setSelected(null);setOverlaps([]);requestAnimationFrame(()=>document.querySelector('.world-map')?.focus({preventScroll:true}));};
 function fit(layer,atYear=yearRef.current,point=null){setCamera(focusThoughtCamera(layer,atYear,camera,window.innerWidth,window.innerHeight,point));}
 const step=direction=>jump(stepTime(thoughtStops,dateRef.current,direction));
 const togglePlay=()=>{stopWheel();if(!playing&&dateRef.current==='modern')moveTo(WORLD[0]);setPlaying(v=>!v);};
 async function toggleFullscreen(){
  try{
   if(document.fullscreenElement||document.webkitFullscreenElement){await (document.exitFullscreen?.()||document.webkitExitFullscreen?.());}
   else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();
   else if(document.documentElement.webkitRequestFullscreen)document.documentElement.webkitRequestFullscreen();
   else setNotice('Browser fullscreen is unavailable here. The map already fills this window.');
  }catch{setNotice('Browser fullscreen is unavailable here. Open this preview in a browser to use fullscreen.');}
 }
 useEffect(()=>{const update=()=>setFullscreen(Boolean(document.fullscreenElement||document.webkitFullscreenElement));update();document.addEventListener('fullscreenchange',update);document.addEventListener('webkitfullscreenchange',update);return()=>{document.removeEventListener('fullscreenchange',update);document.removeEventListener('webkitfullscreenchange',update);};},[]);
 useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),6000);return()=>clearTimeout(timer);},[notice]);
 useEffect(()=>{if(!playing)return;const timer=setTimeout(()=>{const next=stepTime(thoughtStops,dateRef.current,1);moveTo(next);if(next==='modern')setPlaying(false);},1100);return()=>clearTimeout(timer);},[playing,date,moveTo]);
 useEffect(()=>{if(searchOpen||guideOpen){stopWheel();setPlaying(false);}},[searchOpen,guideOpen,stopWheel]);
 actions.current={step,togglePlay,closeDetail};
 useEffect(()=>{const key=e=>{if(searchOpen||guideOpen)return;if(e.key==='Escape'){actions.current.closeDetail();return;}if(/INPUT|SELECT|TEXTAREA|BUTTON|A|PATH/.test(e.target.tagName.toUpperCase()))return;if(e.key==='/'){e.preventDefault();setSearchOpen(true);}if(e.key===' '){e.preventDefault();actions.current.togglePlay();}if(e.key==='ArrowRight'){e.preventDefault();actions.current.step(1);}if(e.key==='ArrowLeft'){e.preventDefault();actions.current.step(-1);}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[searchOpen,guideOpen]);
 return <div className={`atlas-app thought-atlas ${selected||populationSelected?'has-detail':''}`} ref={mapRef}>
  <WorldMap items={mapItems} year={year} yearLabel={yearLabel} selected={selectedLayer?.id} camera={camera} setCamera={setCamera} onTravel={travel} onSelect={select} population={population} populationMode={populationMode} populationSelected={populationSelected?.properties.id} onPopulationSelect={feature=>{setPopulationSelected(feature);setSelected(null);}} leftInset={0} rightInset={(selected||populationSelected)&&window.innerWidth>700?370:0}/>
  <header className="floating-brand"><button className="brand" aria-label="Prelog, reset world map" onClick={()=>{closeDetail();fit();setFamily('');}}><span>prelog<span className="brand-period">.</span></span></button><i/><DatasetTabs active="thought" onChange={onDataset}/></header>
  <div className="top-actions"><Button ref={searchTrigger} icon="search" label="Search the atlas" onClick={()=>setSearchOpen(true)}/><Button icon="info" label="How to read the map" onClick={()=>setGuideOpen(true)}/></div>
  {family&&<div className="map-filter-status"><span>{familyById[family].name}</span><button aria-label="Clear map filters" onClick={()=>{setFamily('');}}>×</button></div>}
  {hasPopulation&&!selected&&!populationSelected&&<PopulationLegend year={year} mode={mapMode} loading={!population&&!populationError} error={populationError} onRetry={()=>setPopulationRetry(v=>v+1)} onMode={mode=>{setMapMode(mode);setFamily('');setSelected(null);setPopulationSelected(null);}}/>}
  <div className="map-controls"><Button icon="plus" label="Zoom in" onClick={()=>setCamera(old=>clampCamera({...old,zoom:old.zoom*1.3}))}/><Button icon="minus" label="Zoom out" onClick={()=>setCamera(old=>clampCamera({...old,zoom:old.zoom/1.3}))}/><i/><Button icon="globe" label="Show the whole world" onClick={()=>fit()}/><Button icon="fit" label={fullscreen?'Exit browser fullscreen':'Enter browser fullscreen'} onClick={toggleFullscreen}/></div>
  <PoliticalTimeControls year={date} stops={thoughtStops} snapshots={[]} playing={playing} onMove={step} onPlay={togglePlay} onJump={jump} closeKey={`${selected||''}|${searchOpen}|${guideOpen}`} travelLabel="Travel through religion and philosophy" showRecords={false} minYear={-3450}/>
  <div className="map-credit"><button onClick={()=>setGuideOpen(true)}>{populationMode?`Population estimates · ${snapshotYear(year)}`:'Illustrative community & teaching centres'}</button><span>·</span><a href={populationMode?'https://www.pewresearch.org/religion/feature/religious-composition-by-country-2010-2020/':'https://www.naturalearthdata.com/about/terms-of-use/'} target="_blank" rel="noreferrer">{populationMode?'Pew Research Center':'Natural Earth'}</a>{populationMode&&<a href="https://surveyofindia.gov.in/pages/outline-maps-of-india" target="_blank" rel="noreferrer">India: Survey of India</a>}</div>
  {!populationMode&&active.length===0&&items.length>0&&<div className="empty-map">No entries mapped at this date.<button onClick={()=>jump(Math.min(...items.map(item=>item.start)))}>Go to the first mapped setting</button></div>}
  {populationSelected&&populationMode&&population&&<PopulationInspector feature={populationSelected} data={population.data} year={year} onClose={closeDetail} onFamily={chooseFamily}/>}
  {selected&&<Inspector id={selected} year={year} yearLabel={yearLabel} overlaps={overlaps} onClose={closeDetail} onSelect={explore} onYear={value=>{jump(value);if(selectedLayer)fit(selectedLayer,value);}} onFit={fit}/>}
  {searchOpen&&<Search onClose={()=>{setSearchOpen(false);searchTrigger.current?.focus();}} onSelect={explore}/>}
  {guideOpen&&<Method onClose={()=>setGuideOpen(false)}/>}
  {notice&&<div className="notice" role="status">{notice}<button aria-label="Dismiss notice" onClick={()=>setNotice('')}>×</button></div>}
 </div>;
}
