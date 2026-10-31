import {assetUrl} from './asset-url.js';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {Button,Icon} from './Icons.jsx';
import DatasetTabs from './DatasetTabs.jsx';
import PolityMap,{boundCamera} from './PolityMap.jsx';
import PoliticalTimeControls from './PoliticalTimeControls.jsx';
import {boundaryForYear,buildTimeStops,clampPoliticalYear,stepTime,wheelBudget} from './political-time.js';
import EntitySymbol,{symbolFor,symbolPeriod} from './EntitySymbol.jsx';
import {availableYear,contemporarySnapshot,snapshotKey,fitPolity,polityYear,searchPolities,snapshotLabel,validateSnapshot} from './polity-engine.js';
const DEFAULT={lon:12,lat:18,zoom:1.08};
const boundaryCache=new Map(),boundaryRequests=new Map(),profileCache=new Map();
const niceType=r=>r.typeLabel||({state:'State',territory:'Territory',historical:'Historical polity',disputed:'Disputed polity / area','non-state':'Non-state actor','geographic-context':'Cultural area'}[r.type]||r.type);
const period=r=>r.start!=null?`${polityYear(r.start)} — ${r.end!=null?polityYear(r.end):'ongoing at source date'}`:r.years?.includes('modern')?'Today reference; see dated sources':r.years?.length?`Boundary records: ${polityYear(r.years[0])}${r.years.length>1?' — '+polityYear(r.years.at(-1)):''}`:'Period not verified';
function loadJSON(url,signal){return fetch(assetUrl(url),{signal}).then(r=>{if(!r.ok)throw new Error('The local data file could not be loaded.');return r.json();});}
function loadBoundary(snapshot){
 const key=snapshot.file;
 if(boundaryCache.has(key))return Promise.resolve(boundaryCache.get(key));
 if(!boundaryRequests.has(key))boundaryRequests.set(key,loadJSON('/atlas/maps/'+key).then(validateSnapshot).then(d=>{boundaryCache.set(key,d);return d;}).finally(()=>boundaryRequests.delete(key)));
 return boundaryRequests.get(key);
}
function Dossier({record,snapshot,symbolTime,mapped,onClose,onSelect,onDate,onContemporaries}){
 const [profile,setProfile]=useState(null),[error,setError]=useState(''),[reload,setReload]=useState(0);const heading=useRef(null);
 useEffect(()=>{heading.current?.focus({preventScroll:true});setProfile(null);setError('');if(!record.profile){setProfile({});return;}if(profileCache.has(record.id)){setProfile(profileCache.get(record.id));return;}const abort=new AbortController();loadJSON('/atlas/profiles/'+record.profile,abort.signal).then(p=>{profileCache.set(record.id,p);setProfile(p);}).catch(e=>{if(e.name!=='AbortError')setError(e.message);});return()=>abort.abort();},[record.id,record.profile,reload]);
 const p=profile||{},readDate=typeof p.asOf==='string'?p.asOf:null,symbol=symbolFor(record.id,mapped?symbolTime:null,true);
 const fields=[['Capital',p.capital||record.capital],['Currency',p.currency],['Rulers / leadership',p.rulers||p.leadership],['Period',p.start!=null?period({...record,start:p.start,end:p.end}):p.periodLabel||period(record)],['Economic state',p.economy],['Military state',p.military],['Contributions to the world',p.contributions],['Reason for emergence',p.origin],['Reason for decline',p.decline]];
 return <aside className="detail-panel polity-dossier" aria-label="Entity details"><div className="panel-top"><Button icon="close" label="Close entity details" onClick={onClose}/></div><div className="detail-scroll"><span className="detail-eyebrow">{record.region} · {mapped?'MAPPED '+snapshotLabel(snapshot).toUpperCase():'PROFILE RECORD'}</span><div className="dossier-identity">{symbol&&<EntitySymbol record={record} snapshot={mapped?symbolTime:null} representative className="dossier-symbol"/>}<h1 ref={heading} tabIndex={-1}>{record.name}</h1></div>{symbol&&<p className="symbol-caption">{symbol.label} · {symbolPeriod(symbol)}</p>}{(p.summary||record.summary)&&<p className="polity-summary">{p.summary||record.summary}</p>}
  {record.type==='non-state'&&<p className="evidence-note">No verified territorial-control polygon is loaded for this actor.</p>}
  {!mapped&&record.type!=='non-state'&&<p className="evidence-note">Not mapped in this snapshot.{record.years?.length>0&&<button onClick={()=>onDate(record.years[0])}>View a boundary record <Icon name="arrow" size={12}/></button>}</p>}
  {readDate&&<div className="profile-date"><Icon name="info" size={13}/><span>{/^\d{4}-/.test(readDate)?`Latest cited source: ${readDate}`:readDate}</span></div>}
  {p.recognition&&['disputed','non-state'].includes(record.type)&&<p className="recognition-note">{p.recognition}</p>}
  {error?<div className="data-error">{error}<button onClick={()=>setReload(n=>n+1)}>Retry profile</button></div>:!profile?<p className="loading-inline" role="status">Loading the source record…</p>:<dl className="polity-facts">{fields.map(([label,value])=><div key={label}><dt>{label}</dt><dd className={!value?'unrecorded':''}>{value||<span title="Not documented in this edition">—</span>}</dd></div>)}</dl>}
  {profile&&fields.some(([,v])=>!v)&&<p className="missing-key">— Not yet sourced in this edition.</p>}
  {(p.periodNote||p.startBasis)&&<p className="period-note">{p.periodNote||p.startBasis}</p>}
  {record.years?.length>0&&<section className="boundary-years"><h3>Boundary snapshots</h3><div>{record.years.map(y=><button key={y} aria-pressed={snapshotKey(snapshot)===y} onClick={()=>onDate(y)}>{y==='modern'?'Today':polityYear(y)}</button>)}</div></section>}
  <button className="contemporaries-button" onClick={()=>onContemporaries(record)}>View contemporaries <Icon name="arrow" size={16}/></button>
 </div></aside>;
}
function EntitySearch({records,present,symbolTime,contemporary,loading,onClose,onSelect}){
 const [query,setQuery]=useState(''),[limit,setLimit]=useState(80),dialog=useRef(null),input=useRef(null);
 useEffect(()=>{dialog.current.showModal();input.current.focus();},[]);
 useEffect(()=>setLimit(80),[query]);
 const results=useMemo(()=>!query.trim()&&!contemporary?[]:searchPolities(records,query,{present:contemporary?present:null}).filter(r=>!contemporary||(r.id!==contemporary.id&&r.type!=='geographic-context')),[records,query,present,contemporary]);
 return <dialog ref={dialog} className="search-dialog" aria-label={contemporary?'Contemporary entities':'Search empires, states and actors'} onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
  <div className="search-input"><Icon name="search"/><input ref={input} aria-label="Find an empire, state or actor" placeholder="Find an empire, state or actor…" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!loading&&results[0])onSelect(results[0].id);}}/><Button icon="close" label="Close search" onClick={onClose}/></div>
  <div className="search-meta">{contemporary?`Contemporaries of ${contemporary.name}`:query.trim()?`${results.length.toLocaleString()} results`:'Search across history'}<span>ESC to close</span></div>
  <div className="search-results">{loading?<p className="empty" role="status">Loading contemporaries…</p>:<>{results.slice(0,limit).map(r=><button key={r.id} onClick={()=>onSelect(r.id)} aria-label={`Explore ${r.name}`}><EntitySymbol record={r} snapshot={present.has(r.id)?symbolTime:null} representative/><span><strong>{r.name}</strong><small>{niceType(r)}{r.start!=null?' · '+polityYear(r.start)+(r.end!=null?'–'+polityYear(r.end):''):''}{r.years.length===0?' · profile only':''}</small></span><Icon name="arrow" size={14}/></button>)}{results.length>limit&&<button onClick={()=>setLimit(n=>n+80)}>Show more results</button>}{!results.length&&<p className="empty">{query.trim()||contemporary?'No matching records. Try another name.':'Type a name to find its history.'}</p>}</>}</div>
 </dialog>;
}
function DataGuide({data,onClose}){const ref=useRef(null);useEffect(()=>{ref.current.showModal();},[]);return <dialog ref={ref} className="method-dialog empire-guide" aria-labelledby="empire-guide-title" onCancel={onClose}><div className="panel-top"><span>Last updated at {data.edition}</span><Button icon="close" label="Close data guide" onClick={onClose}/></div><div className="guide-controls"><span>Scroll down / up</span><b>Forward / backward in time</b><span>Drag · + / −</span><b>Pan · zoom</b><span>Hover · click</span><b>Preview · entity dossier</b><span>← / → · Space</span><b>Step · play / pause</b></div><h3 id="empire-guide-title" className="guide-sources-title">Sources &amp; citations</h3><div className="guide-source"><a href="https://github.com/lipis/flag-icons/tree/v7.3.2" target="_blank" rel="noreferrer">Modern flag icons</a><small>flag-icons 7.3.2 · MIT · Panayiotis Lipiridis and contributors</small><p>237 local SVGs matched to reviewed modern map-unit identities.</p></div><div className="guide-source"><a href={assetUrl('/atlas/symbols/historical/asset-provenance.json')} target="_blank" rel="noreferrer">Historical symbol provenance</a><small>Wikimedia Commons · public domain / CC BY-SA 3.0, per asset</small><p>14 original historical flag designs, with dated identity matches. Exact source, period and attribution accompany each image.</p></div>{['western','asian','american'].map(area=><div className="guide-source" key={area}><a href={assetUrl(`/atlas/symbols/early-${area}/${area==='asian'?'download':'asset'}-provenance.json`)} target="_blank" rel="noreferrer">Early {area==='western'?'European & Mediterranean':area==='asian'?'Asian & African':'American'} symbols</a><small>Licensed originals · source and date recorded per image</small><p>{area==='western'?'Nine early artifacts and heraldic designs.':area==='asian'?'Seven royal, court and coin motifs.':'Five museum artifact motifs.'} Artifacts are not presented as national flags.</p></div>)}{data.sources.map(s=><div className="guide-source" key={s.title}><a href={assetUrl(s.url)} target="_blank" rel="noreferrer">{s.title}</a><small>{s.license}</small><p>{s.role}</p></div>)}</dialog>;}
export default function EmpiresAtlas({onDataset}){
 const [data,setData]=useState(null),[year,setYear]=useState('modern'),[loadError,setLoadError]=useState(''),[boundary,setBoundary]=useState(null),[boundaryError,setBoundaryError]=useState(''),[retry,setRetry]=useState(0);
 const [camera,setCamera]=useState(DEFAULT),[selected,setSelected]=useState(null),[searchOpen,setSearchOpen]=useState(false),[playing,setPlaying]=useState(false),[guideOpen,setGuideOpen]=useState(false),[notice,setNotice]=useState(''),[contemporary,setContemporary]=useState(null);
 const wheel=useRef(0),wheelTimer=useRef(null),pendingFit=useRef(null),snapshots=useMemo(()=>data?.snapshots||[],[data]);
 const stops=useMemo(()=>buildTimeStops(snapshots),[snapshots]);
 useEffect(()=>{const abort=new AbortController();setLoadError('');loadJSON('/atlas/catalogue.json',abort.signal).then(setData).catch(e=>{if(e.name!=='AbortError')setLoadError(e.message);});return()=>abort.abort();},[retry]);
 const requestedSnapshot=boundaryForYear(snapshots,year),snapshot=boundary?.snapshot||requestedSnapshot;
 const loadingBoundary=!!requestedSnapshot&&boundary?.file!==requestedSnapshot.file;
 useEffect(()=>{
  if(!requestedSnapshot)return;
  let current=true;setBoundaryError('');
  loadBoundary(requestedSnapshot).then(d=>{if(current)setBoundary({file:requestedSnapshot.file,snapshot:requestedSnapshot,data:d});}).catch(e=>{if(current)setBoundaryError(e.message);});
  return()=>{current=false;};
 },[requestedSnapshot,retry]);
 useEffect(()=>{
  if(!boundary)return;
  const at=snapshots.findIndex(s=>s.file===boundary.file);
  const timer=setTimeout(()=>[snapshots[at-1],snapshots[at+1]].filter(Boolean).forEach(s=>loadBoundary(s).catch(()=>{})),250);
  return()=>clearTimeout(timer);
 },[boundary,snapshots]);
 const records=useMemo(()=>Object.fromEntries((data?.records||[]).map(r=>[r.id,r])),[data]);
 const features=useMemo(()=>boundary?.data.features||[],[boundary]);
 const present=useMemo(()=>new Set([...features.map(f=>f.properties.id),...(snapshot?.modern?(data?.records||[]).filter(r=>r.type==='non-state'||r.type==='disputed'&&r.years.length===0&&!r.mapSuppressedBy).map(r=>r.id):[])]),[features,data,snapshot?.modern]);
 useEffect(()=>setContemporary(c=>c&&c.key!==snapshotKey(snapshot)?null:c),[snapshot]);
 const stopWheel=useCallback(()=>{clearTimeout(wheelTimer.current);wheelTimer.current=null;wheel.current=0;},[]);
 useEffect(()=>()=>stopWheel(),[stopWheel]);
 useEffect(()=>{if(searchOpen){stopWheel();setPlaying(false);}},[searchOpen,stopWheel]);
 const move=useCallback(delta=>{stopWheel();setPlaying(false);setYear(y=>stepTime(stops,y,delta));},[stops,stopWheel]);
 const travel=useCallback(pixels=>{
  if(!pixels)return;
  setPlaying(false);wheel.current=wheelBudget(wheel.current,pixels);
  const consume=()=>{
   wheelTimer.current=null;
   if(Math.abs(wheel.current)<100)return;
   const direction=Math.sign(wheel.current);wheel.current-=direction*100;
   setYear(y=>stepTime(stops,y,direction));
   wheelTimer.current=setTimeout(consume,140);
  };
  if(!wheelTimer.current)consume();
 },[stops]);
 const jump=y=>{stopWheel();setPlaying(false);setYear(y==='modern'?y:clampPoliticalYear(y));};
 const fit=feature=>setCamera(feature?boundCamera(fitPolity(feature,window.innerWidth,window.innerHeight,window.innerWidth>700?390:0,window.innerWidth<=700?window.innerHeight*.52+100:0)):DEFAULT);
 const select=id=>{stopWheel();setSelected(id);setSearchOpen(false);setPlaying(false);};
 const explore=id=>{const r=records[id],s=availableYear(r,snapshots,snapshot);select(id);if(s&&s.file!==snapshot.file){pendingFit.current=id;setYear(snapshotKey(s));}else{const f=features.find(f=>f.properties.id===id);if(f)fit(f);}};
 useEffect(()=>{if(!pendingFit.current||!features.length)return;const f=features.find(f=>f.properties.id===pendingFit.current);if(f){fit(f);pendingFit.current=null;}},[boundary]);
 useEffect(()=>{if(!playing||!boundary||loadingBoundary)return;const timer=setTimeout(()=>setYear(y=>{const next=stepTime(stops,y,1);if(next===y||next==='modern')setPlaying(false);return next;}),1100);return()=>clearTimeout(timer);},[playing,boundary,loadingBoundary,stops,year]);
 const play=()=>{stopWheel();if(!playing&&year==='modern')setYear(stops[0]);setPlaying(v=>!v);};
 useEffect(()=>{const key=e=>{if(/INPUT|SELECT|TEXTAREA|BUTTON|A|PATH|SUMMARY/.test(e.target.tagName)||guideOpen||searchOpen)return;if(e.key==='ArrowRight'){e.preventDefault();move(1);}if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}if(e.key===' '){e.preventDefault();play();}if(e.key==='Escape'){setSelected(null);setSearchOpen(false);}if(e.key==='/'){e.preventDefault();setContemporary(null);setSearchOpen(true);setSelected(null);}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[move,playing,year,guideOpen,searchOpen,stops]);
 useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),7000);return()=>clearTimeout(t);},[notice]);
 async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else setNotice('The map fills this window. Browser fullscreen is unavailable here.');}catch{setNotice('The map fills this window. Browser fullscreen is unavailable here.');}}
 function showContemporaries(r){stopWheel();setPlaying(false);const s=contemporarySnapshot(r,snapshots,snapshot);if(!s){setNotice('No boundary snapshot falls within this entity’s recorded period.');return;}setYear(snapshotKey(s));setSelected(null);setSearchOpen(true);setContemporary({id:r.id,name:r.name,key:snapshotKey(s)});}
 if(loadError)return <div className="atlas-loading"><p>{loadError}</p><button onClick={()=>setRetry(n=>n+1)}>Retry atlas</button></div>;
 if(!data||!snapshot)return <div className="atlas-loading" role="status">Opening the atlas…</div>;
 const symbolTime={modern:year==='modern',year:year==='modern'?null:year};
 const current=selected&&records[selected],mapped=current&&features.some(f=>f.properties.id===current.id);
 return <div className={`atlas-app empires-atlas ${selected?'has-detail':''}`}>
  <PolityMap symbolTime={symbolTime} features={features} records={records} snapshot={snapshot} selected={selected} camera={camera} setCamera={setCamera} onSelect={select} onTravel={travel} leftInset={0} rightInset={selected?390:0}/>
  <header className="floating-brand"><button className="brand" aria-label="Prelog, reset Empires map" onClick={()=>{setSelected(null);fit();}}><span>prelog<span className="brand-period">.</span></span></button><i/><DatasetTabs active="empires" onChange={onDataset}/></header>
  <div className="top-actions"><Button icon="search" label="Search empires, states and actors" onClick={()=>{setContemporary(null);setSearchOpen(true);setSelected(null);}}/><Button icon="info" label="Sources and coverage" onClick={()=>{setGuideOpen(true);setPlaying(false);}}/></div>
  <div className="snapshot-caption"><span>{year==='modern'?'TODAY · REFERENCE LAYER':`VIEWING ${polityYear(year).toUpperCase()}`}</span><strong>{snapshot.modern?'States, territories & claims':snapshot.regionalUpdate?`India · ${polityYear(snapshot.year)}`:`Map record · ${snapshotLabel(snapshot)}`}</strong><small>{snapshot.worldSourceYear?`World base · ${polityYear(snapshot.worldSourceYear)}`:`${snapshot.source} · ${snapshot.modern?snapshot.edition:'reconstructed boundaries'}`}</small>{snapshot.boundaryPolicy&&<a className="boundary-attribution" href={snapshot.boundaryPolicy.sourceUrl} target="_blank" rel="noreferrer">{snapshot.boundaryPolicy.attribution}</a>}</div>
  {boundaryError?<div className="map-load-status data-error" role="alert">{boundaryError}<button onClick={()=>setRetry(n=>n+1)}>Retry boundaries</button></div>:loadingBoundary&&<div className="map-load-status" role="status">Loading {snapshotLabel(requestedSnapshot)} boundaries…</div>}
  <div className="political-legend"><span><i/>Source boundary</span>{snapshot.modern&&<span><i className="hatched"/>Disputed / claim area</span>}<button onClick={()=>setGuideOpen(true)}>{snapshot.modern?'Reference map · not live control':'Reconstructed · not survey precision'} <Icon name="info" size={11}/></button></div>
  <div className="map-controls"><Button icon="plus" label="Zoom in" onClick={()=>setCamera(c=>boundCamera({...c,zoom:c.zoom*1.35}))}/><Button icon="minus" label="Zoom out" onClick={()=>setCamera(c=>boundCamera({...c,zoom:c.zoom/1.35}))}/><i/><Button icon="globe" label="Show the whole world" onClick={()=>fit()}/><Button icon="fit" label="Enter or exit fullscreen" onClick={fullscreen}/></div>
  <PoliticalTimeControls closeKey={`${selected||''}|${searchOpen}|${guideOpen}`} year={year} stops={stops} snapshots={snapshots} playing={playing} onMove={move} onPlay={play} onJump={jump}/>
  <div className="map-credit"><a href={snapshot.sourceUrl} target="_blank" rel="noreferrer">{snapshot.source}</a><span>·</span><button onClick={()=>setGuideOpen(true)}>Data & attribution</button></div>
  {current&&<Dossier key={current.id} record={current} snapshot={snapshot} symbolTime={symbolTime} mapped={mapped} onClose={()=>setSelected(null)} onSelect={explore} onDate={jump} onContemporaries={showContemporaries}/>}
  {searchOpen&&<EntitySearch records={data.records} present={present} symbolTime={symbolTime} contemporary={contemporary} loading={!!contemporary&&(loadingBoundary||contemporary.key!==snapshotKey(snapshot))} onClose={()=>setSearchOpen(false)} onSelect={explore}/>}
  {guideOpen&&<DataGuide data={data} onClose={()=>setGuideOpen(false)}/>}
  {notice&&<div className="notice" role="status">{notice}<button aria-label="Dismiss notice" onClick={()=>setNotice('')}>×</button></div>}
 </div>;
}
