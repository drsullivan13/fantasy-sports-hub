import './App.css'
import React from 'react'
import { Leaderboard } from './components';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/:leagueType/:leagueId" element={<Leaderboard/>} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App;
