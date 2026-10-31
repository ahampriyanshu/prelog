import {assetUrl} from './asset-url.js';
import {useEffect,useRef} from 'react';
import {rankedGroups,formatShare,populationRecordFor,buildPopulationFeatures,geometryPath} from './religion-population.js';
import {Icon,Button} from './Icons.jsx';

let populationPromise;
export function loadReligionPopulation(){
 if(!populationPromise)populationPromise=Promise.all(['/atlas/maps/modern.json','/atlas/religion/composition.json','/atlas/religion/history.json'].map(url=>fetch(assetUrl(url)).then(response=>{if(!response.ok)throw new Error(`Could not load ${url}`);return response.json();}))).then(([map,data,historical])=>({data:{...data,historical},features:buildPopulationFeatures(map,data).map(feature=>({...feature,path:geometryPath(feature.geometry)}))})).catch(error=>{populationPromise=null;throw error;});
 return populationPromise;
}

export function PopulationTooltip({feature,data,year}){
 const record=populationRecordFor(data,feature.properties.demographicCountry||feature.properties.name,year);
 const shares=rankedGroups(record?.shares);
 return <><div>{record?`${record.source} · ${record.year}`:''}</div><h2>{feature.properties.name}</h2>{shares.length?<><div className="population-tooltip-shares">{shares.filter(g=>g.share>=.1).slice(0,4).map(group=><span key={group.id}><i style={{background:group.color}}/>{group.name}<b>{formatShare(group.share)}</b></span>)}</div><small>Countrywide estimates; communities coexist.</small></>:<p>No population estimate is recorded for this area and date.</p>}</>;
}

export function PopulationInspector({feature,data,year,onClose,onFamily}){
 const ref=useRef(null),country=feature.properties.demographicCountry||feature.properties.name;
 const record=populationRecordFor(data,country,year),at=record?.year;
 const groups=rankedGroups(record?.shares);
 useEffect(()=>{ref.current?.focus({preventScroll:true});},[feature.properties.id]);
 return <aside className="detail-panel population-panel" aria-label="Religious population details">
  <div className="panel-top"><Button icon="close" label="Close population details" onClick={onClose}/></div>
  <div className="detail-scroll"><span className="detail-eyebrow">{record?.source} · {at}</span><h1 ref={ref} tabIndex={-1}>{feature.properties.name}</h1>
   {groups.length?<><p className="summary">Share of the population, all ages. These are countrywide estimates, not local religious boundaries.</p>
    {country!==feature.properties.name&&<p className="population-source-area">Source reporting area: {country}. No separate estimate is assigned to this map unit.</p>}
    {!record?.overlap&&<div className="population-stack" aria-hidden="true">{groups.map(group=><span key={group.id} style={{width:`${group.share}%`,background:group.color}}/>)}</div>}
    <div className="population-breakdown">{groups.map(group=><div key={group.id}><div><span><i style={{background:group.color}}/>{group.name}</span><strong>{formatShare(group.share)}</strong></div><div className="population-bar"><i style={{width:`${group.share}%`,background:group.color}}/></div></div>)}</div>
    <p className="population-note">Rounded estimates may not sum to 100%. Values below 0.1% include zero. Reference areas do not represent historical political borders. “Unaffiliated” describes religious identity, not an absence of beliefs.</p>
    {record?.source==='Pew Research Center'&&<p className="population-note">Pew groups Sikhism, Jainism, the Bahá’í Faith, Daoism, Shintō and several other religions together because comparable separate estimates are unavailable. Explore their individual histories below.</p>}
    {!!record?.branches.length&&<section className="related-section"><h3>Named affiliations · {at}</h3>{[...record.branches].sort((a,b)=>b.share-a.share).map(branch=><div className="population-affiliation" key={branch.id}><span>{branch.name}</span><strong>{formatShare(branch.share)}</strong></div>)}</section>}
    {record?.overlap&&<p className="population-note">This source permits overlapping religious identities. Reported shares are retained without forcing them to total 100%.</p>}
    <section className="related-section"><h3>Explore named branches</h3><p className="population-note">Open a family’s global history. These links do not assign every branch to this country.</p>{groups.filter(group=>group.family&&group.share>0).map(group=><button key={group.id} onClick={()=>onFamily(group.family)}><span>{group.name}<small>Denominations, schools & lineages</small></span><Icon name="arrow" size={13}/></button>)}<button onClick={()=>onFamily('')}><span>Explore all traditions</span><Icon name="arrow" size={13}/></button></section>
   </>:<section className="now-card"><h2>Not measured in this dataset</h2><p>No population estimate is recorded for this area and date. An unmeasured area is not an area without religion.</p><button className="text-action" onClick={()=>onFamily('')}>Explore named communities<Icon name="arrow" size={15}/></button></section>}
  </div>
 </aside>;
}
