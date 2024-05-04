import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useCookies } from 'react-cookie'; // Import useCookies
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from './components/home';
import Login from './components/login';
import Register from './components/register';
import Compose from './components/compose';
import Todos from './components/todos';

const PrivateRoute = ({ children }) => {
  const [cookies] = useCookies(['user']);
  //log the user cookie
  //console.log(cookies.user);

  // If the user cookie is set, render the child component
  // Otherwise, redirect to the login page
  return cookies.user ? children : <Navigate to="/login" />;
};

const privateRoutes = [ //Routes accessible only after login
  { path: "/", element: <Home /> }, // Home / Future calendar
  { path: "/compose", element: <Compose /> }, // Add a new event
  { path: "/compose/:id", element: <Compose /> }, // Edit an event
  { path: "/todos", element: <Todos /> }, // Todos page
];

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {privateRoutes.map((route, index) => (  // Map through the privateRoutes array.
          <Route key={index} path={route.path} element={<PrivateRoute>{route.element}</PrivateRoute>} />
        ))}
      </Routes>
    </Router>
  );
}

export default App;