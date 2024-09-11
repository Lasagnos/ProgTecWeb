import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from './utilities/config';
import { useCookies } from 'react-cookie';
import { useTimeMachine } from '../contexts/timeMachineContext';

const Header = () => {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const [cookies, , removeCookie] = useCookies(['user']); // USER COOKIE
  const { resetTimeMachineDate } = useTimeMachine();  // Time machine context to reset the datetime
  const username = cookies.user.username; // show username in the navbar

  // Navbar toggle state, for moving elements on small screens
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);  
  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  const handleLogout = () => {
    axios.post(`${config.apiBaseUrl}/logout`)
      .then(() => {
        removeCookie('user'); // Remove the cookies
        removeCookie('session');
        resetTimeMachineDate();  // Reset the time machine's datetime
        navigate('/login');   // And redirect to the login page
      })
      .catch(error => console.error('Error logging out:', error));
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary text-center">
      <div className="container-fluid">
        <a className="navbar-brand" href="/"> 
          <i className="fas fa-calendar" aria-hidden="true"></i> SELFIE
        </a>

        <button className="navbar-toggler" type="button" 
                data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" 
                aria-controls="navbarNavDropdown" aria-expanded="false"
                aria-label="Toggle navigation" onClick={toggleNavbar}>
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav">
            {/* <li className="nav-item">
              <a className="nav-link active" href="/">Home</a>
            </li> */}

            <li className="nav-item">
              <a className="nav-link" href="/calendar">Calendar</a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="/todos">Todos</a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="/notes">Notes</a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="/pomodoro">Pomodoro</a>
            </li>
          </ul>
        </div>


        {username &&  // Should always be true
          <div className={`ml-auto d-flex align-items-center ${isNavbarOpen ? 'justify-content-center w-100' : 'justify-content-end'}`}>
            <span className="navbar-text mr-3">
              <i className="fas fa-user"></i> {username}
            </span>
            <button className="btn btn-link" onClick={handleLogout}>Logout</button>
          </div>
        }
      </div>
    </nav>
  );
};

export default Header;