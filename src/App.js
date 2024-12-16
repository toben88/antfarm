import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AntFarm from './components/AntFarm';
import HamburgerMenu from './components/HamburgerMenu';
import Mint from './pages/Mint';
import War from './pages/War';
import Race from './pages/Race';

function App() {
  return (
    <Router>
      <div className="App">
        <HamburgerMenu />
        <Routes>
          <Route path="/" element={<AntFarm />} />
          <Route path="/war" element={<War />} />
          <Route path="/mint" element={<Mint />} />
          <Route path="/race" element={<Race />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
