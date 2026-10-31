import {assetUrl} from './asset-url.js';
import {useEffect,useRef} from 'react';
import {populationGroups,rankedGroups,compositionFor,formatShare,snapshotYear,buildPopulationFeatures,geometryPath} from './religion-population.js';
import {Icon,Button} from './Icons.jsx';

let populationPromise;
export function loadReligionPopulation(){
 if(!populationPromise)populationPromise=Promise.all(['/atlas/maps/modern.json','/atlas/religion/composition.json'].map(url=>fetch(assetUrl(url)).then(response=>{if(!response.ok)throw new Error(`Could not load ${url}`);return response.json();}))).then(([map,data])=>({data,features:buildPopulationFeatures(map,data).map(feature=>({...feature,path:geometryPath(feature.geometry)}))})).catch(error=>{populationPromise=null;throw error;});
 return populationPromise;
}

export function PopulationLegend({year,mode,onMode,loading,error,onRetry}){
 return <section className="population-legend" aria-label="Map display">
  <div className="population-switch"><button aria-pressed={mode==='population'} onClick={()=>onMode('population')}>Population</button><button aria-pressed={mode==='schools'} onClick={()=>onMode('schools')}>Schools & ideas</button></div>
  {mode==='population'&&<><div className="population-caption">Largest affiliation <span>ESTIMATES · {snapshotYear(year)}</span></div><div className="population-key">{populationGroups.map(group=><span key={group.id}><i style={{background:group.color}}/>{group.name}</span>)}<span><i className="unmeasured-swatch"/>Not measured</span></div><small>Click a country for every group’s share.</small>{loading&&<small role="status">Loading country data…</small>}{error&&<small role="alert">Country data could not load. <button onClick={onRetry}>Retry</button></small>}</>}
 </section>;
}

export function PopulationTooltip({feature,data,year}){
 const shares=rankedGroups(compositionFor(data,feature.properties.demographicCountry,year));
 return <><div>POPULATION ESTIMATES · {snapshotYear(year)}</div><h2>{feature.properties.name}</h2>{shares.length?<><div className="population-tooltip-shares">{shares.filter(g=>g.share>=.1).slice(0,4).map(group=><span key={group.id}><i style={{background:group.color}}/>{group.name}<b>{formatShare(group.share)}</b></span>)}</div><small>Countrywide estimates; communities coexist.</small></>:<p>No estimate for this area in this dataset. This does not mean there are no religions here.</p>}<footer>Click for details <span>↗</span></footer></>;
}

export function PopulationInspector({feature,data,year,onClose,onFamily}){
 const ref=useRef(null),at=snapshotYear(year),country=feature.properties.demographicCountry;
 const groups=rankedGroups(compositionFor(data,country,year));
 useEffect(()=>{ref.current?.focus({preventScroll:true});},[feature.properties.id]);
 return <aside className="detail-panel population-panel" aria-label="Religious population details">
  <div className="panel-top"><span>RELIGIOUS COMPOSITION</span><Button icon="close" label="Close population details" onClick={onClose}/></div>
  <div className="detail-scroll"><span className="detail-eyebrow">PEW RESEARCH CENTER · {at}</span><h1 ref={ref} tabIndex={-1}>{feature.properties.name}</h1>
   {groups.length?<><p className="summary">Share of the population, all ages. These are countrywide estimates, not local religious boundaries.</p>
    {country!==feature.properties.name&&<p className="population-source-area">Source reporting area: {country}. No separate estimate is assigned to this map unit.</p>}
    <div className="population-stack" aria-hidden="true">{groups.map(group=><span key={group.id} style={{width:`${group.share}%`,background:group.color}}/>)}</div>
    <div className="population-breakdown">{groups.map(group=><div key={group.id}><div><span><i style={{background:group.color}}/>{group.name}</span><strong>{formatShare(group.share)}</strong></div><div className="population-bar"><i style={{width:`${group.share}%`,background:group.color}}/></div></div>)}</div>
    <p className="population-note">Rounded estimates may not sum to 100%. Values below 0.1% include zero. “Unaffiliated” describes religious identity, not an absence of beliefs.</p>
    <p className="population-note">¹ Pew groups Sikhism, Jainism, the Bahá’í Faith, Daoism, Shintō and several other religions together because comparable separate estimates are unavailable. Their individual histories remain in the catalogue.</p>
    <section className="related-section"><h3>Explore named branches</h3><p className="population-note">Open a family’s global history. These links do not assign every branch to this country.</p>{groups.filter(group=>group.family&&group.share>0).map(group=><button key={group.id} onClick={()=>onFamily(group.family)}><span>{group.name}<small>Denominations, schools & lineages</small></span><Icon name="arrow" size={13}/></button>)}<button onClick={()=>onFamily('')}><span>Explore all religions & philosophies</span><Icon name="arrow" size={13}/></button></section>
   </>:<section className="now-card"><h2>Not measured in this dataset</h2><p>Pew’s estimates cover places with at least 100,000 people in 2010 or 2020. An unmeasured area is not an area without religion.</p><button className="text-action" onClick={()=>onFamily('')}>Explore named communities<Icon name="arrow" size={15}/></button></section>}
   <section className="source-section"><h3>Source & date</h3><p>{at} observations, published in 2025. The map retains that observation year when you travel later; it does not invent newer estimates. Historical schools use a separate layer.</p><a href={data.url} target="_blank" rel="noreferrer">Pew · Religious composition, 2010–2020<Icon name="external" size={13}/></a><a href="https://surveyofindia.gov.in/pages/outline-maps-of-india" target="_blank" rel="noreferrer">India boundary · Survey of India<Icon name="external" size={13}/></a></section>
  </div>
 </aside>;
}
