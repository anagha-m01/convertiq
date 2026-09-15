import React,{useState} from 'react';
import Dashboard from './pages/Dashboard';
import Predictor from './pages/Predictor';
export default function App(){
 const [tab,setTab]=useState('dashboard');
 return <><header><div><h1>ConvertIQ</h1><p>Marketing Conversion Analytics & Prediction</p></div><nav><button className={tab==='dashboard'?'active':''} onClick={()=>setTab('dashboard')}>Analytics</button><button className={tab==='predict'?'active':''} onClick={()=>setTab('predict')}>Predict</button></nav></header><main>{tab==='dashboard'?<Dashboard/>:<Predictor/>}</main></>
}
