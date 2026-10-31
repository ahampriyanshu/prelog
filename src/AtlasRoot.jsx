import {useState,lazy,Suspense} from 'react';
import ThoughtAtlas from './App.jsx';
const EmpiresAtlas=lazy(()=>import('./EmpiresAtlas.jsx'));
export default function AtlasRoot(){const [dataset,setDataset]=useState('empires');return dataset==='empires'?<Suspense fallback={<div className="atlas-loading" role="status">Opening the atlas…</div>}><EmpiresAtlas onDataset={setDataset}/></Suspense>:<ThoughtAtlas onDataset={setDataset}/>;}
