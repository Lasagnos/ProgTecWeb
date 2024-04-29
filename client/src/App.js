import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from './components/home';
import Compose from './components/compose';
import Todos from './components/todos';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/compose" element={<Compose />} />
        <Route path="/compose/:id" element={<Compose />} />

        <Route path="/todos" element={<Todos />} />
      </Routes>
    </Router>
  );
}

export default App;