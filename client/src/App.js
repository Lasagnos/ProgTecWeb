import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate  } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from './components/home';
import Login from './components/login';
import Register from './components/register';
import Compose from './components/compose';
import Todos from './components/todos';

const PrivateRoute = ({ children }) => {
  const sessionID = localStorage.getItem('sessionID');

  return sessionID ? children : <Navigate to="/login" />;
};

const privateRoutes = [ //Routes accessible only after login
  { path: "/", element: <Home /> },
  { path: "/compose", element: <Compose /> },
  { path: "/compose/:id", element: <Compose /> },
  { path: "/todos", element: <Todos /> },
];

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {privateRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={<PrivateRoute>{route.element}</PrivateRoute>} />
        ))}
      </Routes>
    </Router>
  );
}

export default App;