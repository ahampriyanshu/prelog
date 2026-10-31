import {useLayoutEffect,useRef,useState} from 'react';
export default function useBoundaryTransition(shapes,snapshot) {
 const key=snapshot.file;
 const [layers,setLayers]=useState(()=>[{key,shapes,snapshot,opacity:1}]);
 const last=useRef(key);
 useLayoutEffect(()=>{
  if(last.current===key)return;
  last.current=key;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setLayers([{key,shapes,snapshot,opacity:1}]);return;}
  setLayers(previous=>[...previous.filter(l=>l.key!==key).slice(-1).map(l=>({...l,opacity:0})),{key,shapes,snapshot,opacity:0}]);
  let nextFrame;
  const frame=requestAnimationFrame(()=>{nextFrame=requestAnimationFrame(()=>setLayers(current=>current.map(l=>({...l,opacity:l.key===key?1:0}))));});
  const cleanup=setTimeout(()=>setLayers(current=>current.filter(l=>l.key===key)),780);
  return()=>{cancelAnimationFrame(frame);cancelAnimationFrame(nextFrame);clearTimeout(cleanup);};
 },[key,shapes,snapshot]);
 // The initial source arrives asynchronously; initialize its geometry without
 // making the permanent land layer disappear or retaining an empty first layer.
 useLayoutEffect(()=>{setLayers(current=>current.map(l=>l.key===key&&l.shapes!==shapes?{...l,shapes}:l));},[shapes,key]);
 return layers;
}
