import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useCookies } from 'react-cookie'; // Import useCookies

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Home from './components/home';
import Login from './components/login';
import Register from './components/register';
import Calendar from './components/calendar';
import EventWrite from './components/eventWrite';
import Todos from './components/todos';
import Pomodoro from './components/pomodoro';
import Notes from './components/notes';
import NoteWrite from './components/noteWrite';

import { TimeMachineProvider } from './components/contexts/timeMachineContext';

const PrivateRoute = ({ children }) => {
  const [cookies] = useCookies(['user']);
  //console.log(cookies.user);  //DEBUG

  // If the user cookie is set, render the child component
  // Otherwise, redirect to the login page
  return cookies.user ? children : <Navigate to="/login" />;
};

const privateRoutes = [ //Routes accessible only after login
  { path: "/", element: <Home /> }, // Home
  { path: "/calendar", element: <Calendar /> }, // Calendar page
  { path: "/event/write", element: <EventWrite /> }, // Add a new event
  { path: "/event/write/:id", element: <EventWrite /> }, // Edit an event
  { path: "/todos", element: <Todos /> }, // Todos page
  { path: "/pomodoro", element: <Pomodoro /> }, // PomodoroTimer page
  { path: "/notes", element: <Notes /> }, // Notes page
  { path: "/notes/write", element: <NoteWrite /> }, // Note writing page
  { path: "/notes/write/:id", element: <NoteWrite /> }, // Note editing page
];

function App() {
  return (
    <TimeMachineProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {privateRoutes.map((route, index) => (  // Map through the privateRoutes array.
            <Route key={index} path={route.path} element={<PrivateRoute>{route.element}</PrivateRoute>} />
          ))}
        </Routes>
      </Router>
    </TimeMachineProvider>
  );
}

export default App;