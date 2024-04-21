import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from './components/home';
import ComposeEvent from './components/compose';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/compose" element={<ComposeEvent />} />
      </Routes>
    </Router>
  );
}

export default App;