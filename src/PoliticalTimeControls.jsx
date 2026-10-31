import {useEffect,useState} from 'react';
import {Button,Icon} from './Icons.jsx';
import {polityYear,snapshotLabel,snapshotKey} from './polity-engine.js';
import {TIME_BANDS,timePosition,timeResolution} from './political-time.js';

export default function PoliticalTimeControls({year,stops,snapshots,playing,onMove,onPlay,onJump,closeKey}) {
  const [open,setOpen]=useState(false),[input,setInput]=useState('1800'),[era,setEra]=useState('CE');
  useEffect(()=>setOpen(false),[closeKey]);
  useEffect(()=>{const close=e=>{if(e.key==='Escape')setOpen(false);};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[]);
  const position=timePosition(stops,year),label=year==='modern'?'Modern':polityYear(year);
  const choose=y=>{onJump(y);setOpen(false);};
  return <div className="time-navigation adaptive-time">
    <div className="snapshot-dock-note"><span>Scroll to travel through time</span><span className="time-resolution">up to {timeResolution(year)} years / step</span></div>
    <div className="time-dock">
      <Button icon="prev" label="Step backward in time" disabled={position===0} className="step-button" onClick={()=>onMove(-1)}/>
      <Button icon={playing?'pause':'play'} label={playing?'Pause time':'Play through time'} className="play-button" onClick={onPlay}/>
      <Button icon="next" label="Step forward in time" disabled={year==='modern'} className="step-button" onClick={()=>onMove(1)}/>
      <button className="year-display" aria-label="Choose a date" aria-expanded={open} onClick={()=>{setOpen(v=>!v);if(year!=='modern'){setInput(String(Math.abs(year)));setEra(year<0?'BCE':'CE');}if(playing)onPlay();}}><span key={year}>{label}</span><Icon name="chevron" size={11}/></button>
      <div className="time-rail adaptive-rail">
        <div className="time-track" aria-hidden="true"><span style={{width:`${position/(stops.length-1)*100}%`}}/>{stops.map((y,i)=><i className={snapshots.some(s=>snapshotKey(s)===y)?'evidence-tick':''} key={y} style={{left:`${i/(stops.length-1)*100}%`}}/>)}</div>
        <input type="range" aria-label="Travel through political history" aria-valuetext={`${label}, ${timeResolution(year)} years per step`} min="0" max={stops.length-1} step="1" value={position} onChange={e=>onJump(stops[Math.round(Number(e.target.value))])}/>
        <div className="time-scale-labels" aria-hidden="true">{[-500,1,1700,1800].map(y=><span key={y} style={{left:`${timePosition(stops,y)/(stops.length-1)*100}%`}}>{y===-500?'500 BCE':y===1?'1 CE':y}</span>)}</div>
      </div>
    </div>
    {open&&<section className="date-popover polity-dates" aria-label="Choose a political date">
      <div className="panel-top"><span>TRAVEL TO A YEAR</span><Button icon="close" label="Close date picker" onClick={()=>setOpen(false)}/></div>
      <form onSubmit={e=>{e.preventDefault();choose(Number(input)*(era==='BCE'?-1:1));}}><input type="number" min="1" max={era==='BCE'?4000:2025} required aria-label="Year" value={input} onChange={e=>setInput(e.target.value)}/><select aria-label="Era" value={era} onChange={e=>setEra(e.target.value)}><option>CE</option><option>BCE</option></select><button aria-label="Travel to year" type="submit"><Icon name="arrow"/></button></form>
      <div className="time-band-list">{TIME_BANDS.map(b=><button key={b.start} onClick={()=>choose(b.start)}><span>{b.start<0?polityYear(b.start):b.start===1?'1 CE':b.start}</span><span>{b.step}-year steps</span></button>)}</div>
      <button className="modern-shortcut" onClick={()=>choose('modern')}>Modern world <Icon name="arrow" size={13}/></button>
      <details className="snapshot-shortcuts"><summary>Jump to a boundary record</summary><div className="snapshot-options">{snapshots.map(s=><button key={snapshotKey(s)} aria-pressed={year===snapshotKey(s)} onClick={()=>choose(snapshotKey(s))}>{snapshotLabel(s)}</button>)}</div></details>
      <p>Finer time steps do not imply finer border evidence. The map’s source date stays visible.</p>
    </section>}
  </div>;
}
