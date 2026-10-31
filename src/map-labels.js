import {ringContains} from './polity-engine.js';

const bounds=ring=>({left:Math.min(...ring.map(p=>p[0])),right:Math.max(...ring.map(p=>p[0])),top:Math.min(...ring.map(p=>p[1])),bottom:Math.max(...ring.map(p=>p[1]))});
const inBox=(p,b)=>p[0]>=b.left&&p[0]<=b.right&&p[1]>=b.top&&p[1]<=b.bottom;
const inPolygon=(p,polygon)=>ringContains(p,polygon[0])&&!polygon.slice(1).some(r=>ringContains(p,r));
const estimatedWidth=(text,size)=>[...text].reduce((sum,c)=>sum+(/[MW@]/.test(c)?.87:/[ilI.,'’ ]/.test(c)?.29:.56)*size,0);
function linesFor(text,width,size,measure){
 const lines=[];let line='';
 for(const word of text.split(' ')){
  if(measure(word,size)>width)return null;
  const next=line?line+' '+word:word;
  if(line&&measure(next,size)>width){lines.push(line);line=word;}else line=next;
 }
 if(line)lines.push(line);
 return lines.length<=3?lines:null;
}
export function labelSamples(box){
 const xs=[box.left,(box.left+box.right)/2,box.right],ys=[box.top,(box.top+box.bottom)/2,box.bottom];
 return xs.flatMap(x=>ys.map(y=>[x,y]));
}
// Labels use the actual available area, not a displaced callout anchor. A name
// that cannot fit remains discoverable through its interactive region or search.
export function placeAreaLabels(entries,{width,height,selected,insets={},land=[],measure=estimatedWidth,maxPerItem=1}){
 const labels=[],occupied=[];
 const landIndex=land.map(polygon=>({polygon,b:bounds(polygon[0])}));
 const onLand=p=>!landIndex.length||landIndex.some(({polygon,b})=>inBox(p,b)&&inPolygon(p,polygon));
 const viewport={left:(insets.left||0)+12,right:width-(insets.right||0)-12,top:insets.top??100,bottom:height-(insets.bottom??122)};
 const ordered=[...entries].sort((a,b)=>Number(b.item.id===selected)-Number(a.item.id===selected)||(b.item.priority||0)-(a.item.priority||0)||a.item.name.localeCompare(b.item.name));
 for(const {item,regions} of ordered){
  const sorted=regions.map(region=>({...region,b:bounds(region.polygon[0])})).sort((a,b)=>(b.b.right-b.b.left)*(b.b.bottom-b.b.top)-(a.b.right-a.b.left)*(a.b.bottom-a.b.top));
  let count=0;
  for(const region of sorted){
   if(count>=maxPerItem)break;
   let placed=false;
   const b=region.b,w=b.right-b.left,h=b.bottom-b.top;
   if(w<26||h<16||b.right<viewport.left||b.left>viewport.right||b.bottom<viewport.top||b.top>viewport.bottom)continue;
   const coastalCentres=landIndex.filter(part=>part.b.left<b.right&&part.b.right>b.left&&part.b.top<b.bottom&&part.b.bottom>b.top).map(part=>[(Math.max(part.b.left,b.left)+Math.min(part.b.right,b.right))/2,(Math.max(part.b.top,b.top)+Math.min(part.b.bottom,b.bottom))/2]);
   const positions=[...(region.anchor?[region.anchor]:[]),...coastalCentres,...[.5,.35,.65,.2,.8,.1,.9].flatMap(y=>[.5,.35,.65,.2,.8,.1,.9].map(x=>[b.left+w*x,b.top+h*y]))];
   for(const size of item.id===selected?[14,13,12,11]:[12,11]){
    if(placed)break;
    for(const maxWidth of [...new Set([Math.min(190,w*.85),Math.min(140,w*.65),Math.min(100,w*.5)])]){
     if(placed)break;
     const lines=linesFor(item.name,maxWidth,size,measure);if(!lines)continue;
     const textWidth=Math.max(...lines.map(line=>measure(line,size)))+8,lineHeight=size*1.25,textHeight=lines.length*lineHeight+4;
     if(textHeight>h||textWidth>w)continue;
     for(const [x,y] of positions){
      const box={left:x-textWidth/2,right:x+textWidth/2,top:y-textHeight/2,bottom:y+textHeight/2};
      if(box.left<viewport.left||box.right>viewport.right||box.top<viewport.top||box.bottom>viewport.bottom)continue;
      if(occupied.some(o=>box.left<o.right+6&&box.right>o.left-6&&box.top<o.bottom+4&&box.bottom>o.top-4))continue;
      const samples=labelSamples(box);
      if(!samples.every(p=>inPolygon(p,region.polygon)&&onLand(p)))continue;
      labels.push({item,area:region.area,x,y,lines,fontSize:size,lineHeight,box,samples});occupied.push(box);placed=true;count++;break;
     }
    }
   }
  }
 }
 return labels;
}
