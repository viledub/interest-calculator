import React from 'react';
import logo from './logo.svg';
import { Chart } from './features/chart/Chart'
import { Counter } from './features/counter/Counter'
import { ChartControls } from './features/chart/ChartControls'
import './App.css';

function App() {
  return (
    <div className="App">
      <Chart id={0}/>
      <ChartControls id={0}/>
      <Chart id={1}/>
      <ChartControls id={1}></ChartControls>
        <Counter hello={'world'}></Counter>
    </div>
  );
}

export default App;
