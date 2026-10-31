import { nodes, nodeById, edges, scopes, regions } from './data.js';

export const WORLD = [-3450, 2075];
export const MIN_SPAN = 180;
export const formatYear = year => {
  const y = Math.round(year);
  return `${Math.abs(y || 1).toLocaleString('en-US')} ${y < 0 ? 'BCE' : 'CE'}`;
};
export const shortYear = year => Math.round(year) === 0 ? '1 CE' : formatYear(year);
export const rangeLabel = range => `${formatYear(range[0])} — ${formatYear(range[1])}`;
export const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function searchNodes(query) {
  const terms = normalize(query).split(' ').filter(Boolean);
  return nodes.filter(n => terms.every(term => normalize(`${n.name} ${n.aliases||''} ${n.ideas.join(' ')} ${n.kind} ${regions.find(r=>r.id===n.region).name}`).includes(term)));
}
export function clampRange(range, bounds = WORLD) {
  const span = Math.min(Math.max(range[1]-range[0], MIN_SPAN), bounds[1]-bounds[0]);
  const start = Math.max(bounds[0], Math.min(bounds[1]-span, range[0]));
  return [start, start+span];
}
export function zoomRange(range, factor, anchor = .5) {
  const span = range[1]-range[0];
  const nextSpan = Math.max(MIN_SPAN, Math.min(WORLD[1]-WORLD[0],span*factor));
  const focus = range[0]+span*anchor;
  return clampRange([focus-nextSpan*anchor,focus+nextSpan*(1-anchor)]);
}
export const panRange = (range,delta) => clampRange([range[0]+delta,range[1]+delta]);
export function scopeRange(id) {
  if(id==='world') return [...WORLD];
  const years = scopes[id].ids.map(id=>nodeById[id].year);
  const min = Math.min(...years), max=Math.max(...years), pad=Math.max(100,(max-min)*.12);
  return clampRange([min-pad,max+pad]);
}
export function breadcrumbs(id) {
  const result=[]; const seen=new Set();
  while(id && !seen.has(id)) { seen.add(id); result.unshift(id); id=scopes[id]?.parent; }
  return result;
}
export function ticks(range, width) {
  const target = (range[1]-range[0])/Math.max(2,width/125);
  const step = [25,50,100,200,250,500,1000,2000].find(s=>s>=target)||2000;
  const result=[];
  for(let y=Math.ceil(range[0]/step)*step;y<=range[1];y+=step) result.push(y);
  return result;
}
export function scopeNodes(id, kinds) {
  return scopes[id].ids.map(id=>nodeById[id]).filter(n=>!kinds || kinds.includes(n.kind));
}
export function scopeEdges(items) {
  const ids=new Set(items.map(n=>n.id));
  return edges.filter(e=>ids.has(e.from)&&ids.has(e.to));
}
export function timeLayout(items, scopeId, range, width, height, selected) {
  const rows=scopes[scopeId].rows;
  const rowHeight=(height-58)/rows.length;
  const scale = year=>24+(year-range[0])/(range[1]-range[0])*(width-48);
  const labelEnds=rows.map(()=>[-Infinity,-Infinity,-Infinity]);
  const result={};
  [...items].sort((a,b)=>a.year-b.year).forEach(n=>{
    const rowIndex=Math.max(0,rows.findIndex(r=>r.region?n.region===r.region:r.ids.includes(n.id)));
    const x=scale(n.year);
    const rowY=48+(rowIndex+.5)*rowHeight;
    const wantLabel = scopeId!=='world'||range[1]-range[0]<1800||n.overview||n.id===selected;
    const labelWidth=Math.min(155,n.name.length*6.7+26);
    const offset = x>width-labelWidth-12 ? -labelWidth+12 : 10;
    let track=labelEnds[rowIndex].findIndex(end=>end<x+offset-10);
    const showLabel=wantLabel && (track>=0||n.id===selected);
    if(track<0) track=(n.name.length%3);
    if(showLabel) labelEnds[rowIndex][track]=x+offset+labelWidth;
    const spread=Math.min(24,rowHeight*.26);
    result[n.id]={x,y:rowY+(track-1)*spread,label:showLabel,flip:offset<0,row:rowIndex};
  });
  return result;
}
export function networkLayout(items, scopeId, width, height) {
  const rows=scopes[scopeId].rows;
  const links=scopeEdges(items);
  const count=rows.length;
  const center={x:width/2,y:height/2};
  const points=items.map((n,i)=>{
    const row=Math.max(0,rows.findIndex(r=>r.region?n.region===r.region:r.ids.includes(n.id)));
    const angle=(row/count)*Math.PI*2-Math.PI/2;
    const clusterX=center.x+Math.cos(angle)*width*.26;
    const clusterY=center.y+Math.sin(angle)*height*.25;
    return {id:n.id,x:clusterX+Math.cos(i*2.4)*30,y:clusterY+Math.sin(i*2.4)*30,cx:clusterX,cy:clusterY,row};
  });
  const index=Object.fromEntries(points.map((p,i)=>[p.id,i]));
  for(let iteration=0;iteration<160;iteration++) {
    const forces=points.map(p=>({x:(p.cx-p.x)*.025,y:(p.cy-p.y)*.025}));
    points.forEach((p,i)=>points.slice(i+1).forEach((q,k)=>{
      const j=i+k+1,dx=p.x-q.x,dy=(p.y-q.y)*1.55,d2=Math.max(100,dx*dx+dy*dy),strength=Math.min(8500,2*width*height/items.length)/(d2*Math.sqrt(d2));
      forces[i].x+=dx*strength;forces[i].y+=dy*strength;
      forces[j].x-=dx*strength;forces[j].y-=dy*strength;
    }));
    links.forEach(e=>{const a=index[e.from],b=index[e.to],p=points[a],q=points[b];const dx=q.x-p.x,dy=q.y-p.y;const length=Math.hypot(dx,dy);const strength=(length-105)*.012/Math.max(1,length);forces[a].x+=dx*strength;forces[a].y+=dy*strength;forces[b].x-=dx*strength;forces[b].y-=dy*strength;});
    const cooling=1-iteration/200;
    points.forEach((p,i)=>{p.x=Math.max(35,Math.min(width-35,p.x+Math.max(-10,Math.min(10,forces[i].x))*cooling));p.y=Math.max(45,Math.min(height-28,p.y+Math.max(-10,Math.min(10,forces[i].y))*cooling));});
  }
  const occupied=[];
  const result={};
  for(const p of [...points].sort((a,b)=>Number(nodeById[b.id].overview)-Number(nodeById[a.id].overview))) {
    const labelWidth=Math.min(220,nodeById[p.id].name.length*6.4+28);
    let label=false,flip=p.x>width-labelWidth-12;
    if(items.length<30||nodeById[p.id].overview) {
      for(const candidate of [flip,!flip]) {
        const rect={left:candidate?p.x-12-labelWidth:p.x+12,right:candidate?p.x-12:p.x+12+labelWidth,top:p.y-10,bottom:p.y+27};
        if(rect.left<0||rect.right>width)continue;
        if(occupied.some(r=>rect.left<r.right+5&&rect.right>r.left-5&&rect.top<r.bottom+4&&rect.bottom>r.top-4))continue;
        occupied.push(rect);label=true;flip=candidate;break;
      }
    }
    result[p.id]={...p,label,flip};
  }
  return result;
}
export function edgePath(a,b,mode='timeline') {
  if(mode==='network') {const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;return `M ${a.x} ${a.y} Q ${mx+18} ${my-18} ${b.x} ${b.y}`;}
  const bend=Math.max(35,Math.abs(b.x-a.x)*.45);
  return `M ${a.x} ${a.y} C ${a.x+bend} ${a.y}, ${b.x-bend} ${b.y}, ${b.x} ${b.y}`;
}
