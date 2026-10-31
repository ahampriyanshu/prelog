import {assetUrl} from './asset-url.js';
import {useState} from 'react';
import datedNational from '../data/empires/dated-national-symbols.json';
import modern from '../data/empires/modern-symbols.json';
import historical from '../data/empires/historical-symbols.json';
import earlyWestern from '../data/empires/early-western-symbols.json';
import earlyAsian from '../data/empires/early-asian-symbols.json';
import earlyAmerican from '../data/empires/early-american-symbols.json';
import identities from '../data/empires/historical-symbol-identities.json';
import {selectSymbol} from './polity-symbols.js';
import {polityColor,polityYear} from './polity-engine.js';
const symbols={};
for(const manifest of [modern,historical,earlyWestern,earlyAsian,earlyAmerican,identities,datedNational])for(const [id,entries] of Object.entries(manifest))symbols[id]=[...(symbols[id]||[]),...entries].sort((a,b)=>(a.start??Infinity)-(b.start??Infinity));
export const symbolFor=(id,snapshot,representative=false)=>selectSymbol(symbols[id],snapshot,representative);
export const symbolPeriod=s=>s.modernOnly?'Today reference':`${polityYear(s.start)}–${polityYear(s.end)}`;
export default function EntitySymbol({record,snapshot,representative=false,className=''}) {
 const symbol=symbolFor(record.id,snapshot,representative),[failed,setFailed]=useState(null);
 if(!symbol||failed===symbol.src)return <i className={`entity-symbol symbol-fallback ${className}`} style={{background:polityColor(record.id)}} aria-hidden="true"/>;
 return <img className={`entity-symbol ${className}`} src={assetUrl(symbol.src)} alt="" title={`${symbol.label} · ${symbolPeriod(symbol)}`} width="24" height="18" onError={()=>setFailed(symbol.src)}/>;
}
