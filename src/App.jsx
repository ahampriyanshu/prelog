import './religion.css';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {nodeById,edges} from './data.js';
import {searchNodes,formatYear,WORLD} from './engine.js';
import {clampCamera} from './map-engine.js';
import {thoughtTimeStops,thoughtYear,focusThoughtCamera,focusRegionalCamera} from './thought-map.js';
import {stepTime,wheelBudget} from './political-time.js';
import PoliticalTimeControls from './PoliticalTimeControls.jsx';
const thoughtStops=thoughtTimeStops(coverage);
import {coverage,coverageById,coverageForNode,familyById,lineageFor} from './coverage-data.js';
import {DEFAULT_CAMERA,footprintAt,stageAt,fitFootprint} from './coverage-engine.js';
import {Icon,Button} from './Icons.jsx';
import WorldMap from './WorldMap.jsx';
import DatasetTabs from './DatasetTabs.jsx';
import {loadReligionPopulation,PopulationInspector} from './ReligionPopulation.jsx';
import {snapshotYear,populationRecordFor} from './religion-population.js';
import {regionalSettingsAt} from './tradition-regions.js';
import RegionalInspector from './RegionalInspector.jsx';

function Search({onClose,onSelect}){
 const [query,setQuery]=useState('');const ref=useRef(null),input=useRef(null);
 useEffect(()=>{ref.current.showModal();input.current.focus();},[]);
 const results=searchNodes(query);
 return <dialog ref={ref} className="search-dialog" aria-label="Search the atlas" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
  <div className="search-input"><Icon name="search"/><input ref={input} aria-label="Search traditions" placeholder="Find a religion, school or philosophy…" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&results[0])onSelect(results[0].id);}}/><Button icon="close" label="Close search" onClick={onClose}/></div>
  <div className="search-meta">{results.length} historical records <span>ESC to close</span></div>
  <div className="search-results">{results.map(n=>{const layer=coverageForNode(n.id);return <button key={n.id} onClick={()=>onSelect(n.id)}><i style={{background:layer?.color||'#a4aba0'}}/><span><strong>{n.name}</strong><small>{layer?`${familyById[layer.family].name} · ${layer.relation}`:'Reading record · extent not yet mapped'}</small></span><time>{formatYear(n.year)}</time><Icon name="arrow" size={14}/></button>;})}{!results.length&&<p className="empty">No matching history. Try a broader name.</p>}</div>
 </dialog>;
}
function Method({onClose}){
 const ref=useRef(null);useEffect(()=>{ref.current.showModal();},[]);
 return <dialog ref={ref} className="method-dialog" aria-labelledby="method-title" onCancel={onClose}><div className="panel-top"><Button icon="close" label="Close map guide" onClick={onClose}/></div><h2 id="method-title">Reading the map.</h2>
  <p>One map follows regional traditions through time. Coloured areas show documented regional settings; they are reconstructions, not exclusive territories or measured population shares. Stripes show coexisting families. Hatching marks places not documented in this dataset at the selected date.</p>
  <p>From 1945, available World Religion Project estimates colour reporting areas by their largest religious affiliation. Pew’s 2010 and 2020 observations take precedence where available. Observation dates stay visible in each country’s details. No current figures are projected into earlier centuries. Reference geography is not a reconstruction of political borders.</p>
  <p>Zoom to reveal sects and philosophical schools. Click a regional label for all recorded traditions there, or a country for its measured affiliations. Selected schools remain visible alongside the regional map.</p>
  <div className="guide-controls"><span>Scroll down / up</span><b>Forward / backward in time</b><span>Drag · + / −</span><b>Pan · zoom</b><span>Hover · click</span><b>Preview · explore</b><span>← / → · Space</span><b>Step · play / pause</b></div>
  <h3>Sources &amp; citations</h3><div className="guide-source"><a href="https://correlatesofwar.org/data-sets/world-religion-data/" target="_blank" rel="noreferrer">World Religion Project 1.1</a><p>Maoz &amp; Henderson (2013), The World Religion Dataset, 1945–2010, International Interactions 39: 265–291. Five-year estimates, including named affiliations. Obsolete units are not assigned to modern successors.</p></div><div className="guide-source"><a href="https://www.pewresearch.org/religion/feature/religious-composition-by-country-2010-2020/" target="_blank" rel="noreferrer">Pew Research Center · 2010–2020</a><p>Hackett and colleagues (2025), Religious Composition by Country, 2010–2020. doi:10.58094/5shf-2d69.</p></div><div className="guide-source"><a href="https://pluralism.org/" target="_blank" rel="noreferrer">Harvard · The Pluralism Project</a><p>Historical community settings also draw on the catalogue’s linked university, museum and scholarly readings. Their dated presence is not a census.</p></div><div className="guide-source"><a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noreferrer">Natural Earth · public-domain geography</a></div><div className="guide-source"><a href="https://surveyofindia.gov.in/pages/outline-maps-of-india" target="_blank" rel="noreferrer">India boundary · Survey of India</a></div>
 </dialog>;
}
function Inspector({id,year,yearLabel,overlaps,onClose,onSelect,onYear,onFit}){
 const n=nodeById[id],layer=coverageForNode(id),heading=useRef(null);
 useEffect(()=>{heading.current?.focus({preventScroll:true});},[id]);
 const stage=layer&&stageAt(layer,year),visible=layer&&footprintAt(layer,year).length>0;
 const children=coverage.filter(c=>c.parentId===id),siblings=coverage.filter(c=>c.parentId&&c.parentId===layer?.parentId&&c.id!==id);
 const related=[...new Set([...siblings.map(c=>c.id),...edges.filter(e=>e.from===id||e.to===id).map(e=>e.from===id?e.to:e.from)])].filter(key=>key!==id&&!children.some(child=>child.id===key)&&!lineageFor(id).some(parent=>parent.id===key));
 const lineage=lineageFor(id);
 return <aside className="detail-panel" aria-label="Historical details" style={{'--region-color':layer?.color||'#80917b'}}>
  <div className="panel-top"><Button icon="close" label="Close details" onClick={onClose}/></div>
  <div className="detail-scroll"><span className="detail-eyebrow"><i/>{layer.relation.toUpperCase()}</span>{lineage.length>1&&<nav className="lineage-path" aria-label="Historical relationships">{lineage.map((ancestor,i)=><span key={ancestor.id}>{i>0&&<span aria-hidden="true">›</span>}<button disabled={ancestor.id===id} onClick={()=>onSelect(ancestor.id)}>{ancestor.name}</button></span>)}</nav>}<h1 ref={heading} tabIndex={-1}>{n.name}</h1><div className="detail-date">{n.date||`${n.approx?'c. ':''}${formatYear(n.year)}`}</div><p className="summary">{n.summary}</p><div className="idea-tags">{n.ideas.map(idea=><span key={idea}>{idea}</span>)}</div>
   {layer?<><section className="now-card"><div><span>AT {yearLabel}</span><span className="status-dot"/></div><h2>{stage?.title||'Before the first mapped record'}</h2><p>{stage?.text||`The first regional record in this layer begins around ${formatYear(layer.start)}.`}</p>{layer.geographyNote&&<p className="mapping-note">{layer.geographyNote}</p>}<button className="text-action" onClick={()=>visible?onFit(layer):onYear(layer.start)}>{visible?'Focus this area':'Go to the first record'}<Icon name="arrow" size={15}/></button></section>
   <section className="stage-section"><h3>How the geography changes</h3>{layer.stages.map((s,i)=><button key={s.year} className={stage===s?'active':''} onClick={()=>onYear(s.year)}><span className="stage-track"><i/></span><span><time>{formatYear(s.year)}</time><strong>{s.title}</strong></span><Icon name="arrow" size={13}/></button>)}</section></>:<section className="now-card"><h2>A reading record</h2><p>A defensible regional extent has not been mapped for this idea yet. Its historical context and sources remain available here.</p></section>}
   {overlaps.filter(key=>key!==layer?.id).length>0&&<section className="related-section"><h3>Other mapped histories nearby</h3>{overlaps.filter(key=>key!==layer?.id).map(key=><button key={key} onClick={()=>onSelect(key)}><i style={{background:coverageById[key].color}}/>{coverageById[key].name}<Icon name="arrow" size={13}/></button>)}</section>}
   {!!children.length&&<section className="related-section"><h3>Branches & later schools</h3>{children.map(child=><button key={child.id} onClick={()=>onSelect(child.id)}><span>{child.name}<small>{child.relation}</small></span><Icon name="arrow" size={13}/></button>)}</section>}
   {!!related.length&&<section className="related-section"><h3>Related schools & movements</h3>{related.map(key=><button key={key} onClick={()=>onSelect(key)}><span>{nodeById[key].name}<small>{formatYear(nodeById[key].year)}</small></span><Icon name="arrow" size={13}/></button>)}</section>}
   {n.note&&<p className="historical-note">{n.note}</p>}
  </div>
 </aside>;
}
export default function App({onDataset}){
 const [date,setDate]=useState('modern'),[camera,setCamera]=useState(()=>window.innerWidth<700?{lon:60,lat:18,zoom:4.4}:window.innerWidth/window.innerHeight<1.15?{lon:38,lat:23,zoom:1.7}:DEFAULT_CAMERA),[selected,setSelected]=useState(null),[overlaps,setOverlaps]=useState([]);
 const [family,setFamily]=useState(''),[searchOpen,setSearchOpen]=useState(false),[guideOpen,setGuideOpen]=useState(false);
 const year=thoughtYear(date),yearLabel=date==='modern'?'Today':formatYear(year);
 const [playing,setPlaying]=useState(false),[fullscreen,setFullscreen]=useState(false),[notice,setNotice]=useState('');
 const [population,setPopulation]=useState(null),[populationError,setPopulationError]=useState(false),[populationRetry,setPopulationRetry]=useState(0),[regionSelected,setRegionSelected]=useState(null),[populationSelected,setPopulationSelected]=useState(null);
 const hasPopulation=year>=1945;
 useEffect(()=>{let cancelled=false;setPopulationError(false);loadReligionPopulation().then(data=>{if(!cancelled)setPopulation(data);}).catch(()=>{if(!cancelled)setPopulationError(true);});return()=>{cancelled=true;};},[populationRetry]);
 useEffect(()=>{if(populationSelected&&!populationRecordFor(population?.data,populationSelected.properties.demographicCountry||populationSelected.properties.name,year))setPopulationSelected(null);},[population,populationSelected,year]);
 const dateRef=useRef(date),wheel=useRef(0),wheelTimer=useRef(null),yearRef=useRef(year),mapRef=useRef(null),searchTrigger=useRef(null),actions=useRef({});
 yearRef.current=year;dateRef.current=date;
 const items=useMemo(()=>coverage.filter(item=>!family||item.family===family),[family]);
 const mapItems=items;
 const regionalSetting=useMemo(()=>regionalSettingsAt(mapItems,year).find(r=>r.area===regionSelected),[mapItems,year,regionSelected]);
 const selectedLayer=selected&&coverageForNode(selected);
 useEffect(()=>{if(regionSelected&&!regionalSetting)setRegionSelected(null);},[regionSelected,regionalSetting]);

 const moveTo=useCallback(value=>{const next=value==='modern'||value>2020?'modern':Math.max(WORLD[0],Math.min(2020,Math.round(value)||1));dateRef.current=next;yearRef.current=thoughtYear(next);setDate(next);},[]);
 const stopWheel=useCallback(()=>{clearTimeout(wheelTimer.current);wheelTimer.current=null;wheel.current=0;},[]);
 useEffect(()=>()=>stopWheel(),[stopWheel]);
 const travel=useCallback(delta=>{
  if(!delta)return;setPlaying(false);wheel.current=wheelBudget(wheel.current,delta);
  const consume=()=>{wheelTimer.current=null;if(Math.abs(wheel.current)<100)return;const direction=Math.sign(wheel.current);wheel.current-=direction*100;moveTo(stepTime(thoughtStops,dateRef.current,direction));wheelTimer.current=setTimeout(consume,140);};
  if(!wheelTimer.current)consume();
 },[moveTo]);
 const jump=value=>{stopWheel();setPlaying(false);moveTo(value);};
 const select=(id,others=[],point=null)=>{stopWheel();setRegionSelected(null);setPopulationSelected(null);setPlaying(false);setSelected(id);setOverlaps(others);setSearchOpen(false);const layer=coverageForNode(id);if(layer)fit(layer,yearRef.current,point);};
 const explore=id=>{const layer=coverageById[id];let at=yearRef.current;if(!footprintAt(layer,at).length){at=layer.start;moveTo(at);}if(family&&layer.family!==family)setFamily('');select(id);};
 function chooseFamily(id){setFamily('');setRegionSelected(null);setPopulationSelected(null);if(!id){setSelected(null);setCamera(DEFAULT_CAMERA);return;}const root={indian:'hindu',christian:'christianity',buddhist:'buddhism',islamic:'islam',jewish:'judaism'}[id]||familyById[id]?.ids.find(key=>coverageById[key]);if(root)explore(root);}
 const closeDetail=()=>{setRegionSelected(null);setPopulationSelected(null);setSelected(null);setOverlaps([]);requestAnimationFrame(()=>document.querySelector('.world-map')?.focus({preventScroll:true}));};
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
 return <div className={`atlas-app thought-atlas ${selected||populationSelected||regionalSetting?'has-detail':''}`} ref={mapRef}>
  <WorldMap items={mapItems} year={year} yearLabel={yearLabel} selected={selectedLayer?.id} camera={camera} setCamera={setCamera} onTravel={travel} onSelect={select} population={population} regionSelected={regionSelected} onRegionSelect={region=>{stopWheel();setPlaying(false);setRegionSelected(region.area);setSelected(null);setPopulationSelected(null);setCamera(focusRegionalCamera({type:'Polygon',coordinates:[region.ring]},window.innerWidth,window.innerHeight));}} populationSelected={populationSelected?.properties.id} onPopulationSelect={feature=>{stopWheel();setPlaying(false);setRegionSelected(null);setPopulationSelected(feature);setSelected(null);setCamera(focusRegionalCamera(feature.geometry,window.innerWidth,window.innerHeight));}} leftInset={0} rightInset={(selected||populationSelected||regionalSetting)&&window.innerWidth>700?370:0}/>
  <header className="floating-brand"><button className="brand" aria-label="Prelog, reset world map" onClick={()=>{closeDetail();fit();setFamily('');}}><span>prelog<span className="brand-period">.</span></span></button><i/><DatasetTabs active="thought" onChange={onDataset}/></header>
  <div className="top-actions"><Button ref={searchTrigger} icon="search" label="Search the atlas" onClick={()=>setSearchOpen(true)}/><Button icon="info" label="How to read the map" onClick={()=>setGuideOpen(true)}/></div>
  {family&&<div className="map-filter-status"><span>{familyById[family].name}</span><button aria-label="Clear map filters" onClick={()=>{setFamily('');}}>×</button></div>}
  <div className="map-controls"><Button icon="plus" label="Zoom in" onClick={()=>setCamera(old=>clampCamera({...old,zoom:old.zoom*1.3}))}/><Button icon="minus" label="Zoom out" onClick={()=>setCamera(old=>clampCamera({...old,zoom:old.zoom/1.3}))}/><i/><Button icon="globe" label="Show the whole world" onClick={()=>fit()}/><Button icon="fit" label={fullscreen?'Exit browser fullscreen':'Enter browser fullscreen'} onClick={toggleFullscreen}/></div>
  <PoliticalTimeControls year={date} stops={thoughtStops} snapshots={[]} playing={playing} onMove={step} onPlay={togglePlay} onJump={jump} closeKey={`${selected||''}|${searchOpen}|${guideOpen}`} travelLabel="Travel through traditions" showRecords={false} minYear={-3450}/>
  <div className="map-credit"><button onClick={()=>setGuideOpen(true)}>{hasPopulation?`Regional history & population estimates · ${snapshotYear(year)||Math.floor(year/5)*5}`:'Regional reconstruction'}</button><span>·</span><span className="unrecorded-key"><i/>Not documented</span></div>
  {populationError&&<div className="notice" role="alert">Population data could not load. Regional histories remain available.<button onClick={()=>setPopulationRetry(v=>v+1)}>Retry</button></div>}
  {regionalSetting&&<RegionalInspector region={regionalSetting} yearLabel={yearLabel} onClose={closeDetail} onSelect={explore}/>}
  {populationSelected&&hasPopulation&&population&&<PopulationInspector feature={populationSelected} data={population.data} year={year} onClose={closeDetail} onFamily={chooseFamily}/>}
  {selected&&<Inspector id={selected} year={year} yearLabel={yearLabel} overlaps={overlaps} onClose={closeDetail} onSelect={explore} onYear={value=>{jump(value);if(selectedLayer)fit(selectedLayer,value);}} onFit={fit}/>}
  {searchOpen&&<Search onClose={()=>{setSearchOpen(false);searchTrigger.current?.focus();}} onSelect={explore}/>}
  {guideOpen&&<Method onClose={()=>setGuideOpen(false)}/>}
  {notice&&<div className="notice" role="status">{notice}<button aria-label="Dismiss notice" onClick={()=>setNotice('')}>×</button></div>}
 </div>;
}
