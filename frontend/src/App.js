import logo from './logo.svg';
import './App.css';


import React, { useState } from 'react';

function App() {
  const [pingResult, setPingResult] = useState('');
  const [echoResult, setEchoResult] = useState('');

  const handlePing = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/ping');
      const data = await res.json();
      setPingResult(data.message);
    } catch (err) {
      setPingResult('Error');
    }
  };

  const handleEcho = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/echo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'Hello from frontend!' })
      });
      const data = await res.json();
      setEchoResult(data.status);
    } catch (err) {
      setEchoResult('Error');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <button onClick={handlePing} style={{margin: '10px'}}>Ping backend</button>
        <div>Ping result: {pingResult}</div>
        <button onClick={handleEcho} style={{margin: '10px'}}>Send echo to backend</button>
        <div>Echo result: {echoResult}</div>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
