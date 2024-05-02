import React from 'react';
import { useNavigate } from 'react-router-dom';
import TestButton from './testbutton';

const Header = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('sessionID');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">
          <i className="fas fa-calendar"></i> SELFIE
        </a>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link active" href="/">Home</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/compose">Add New Event</a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="/todos">Todos</a>
            </li>
          </ul>
        </div>


        {username && 
          <div className="ml-auto d-flex align-items-center">
            <span className="navbar-text mr-3">
              <i className="fas fa-user"></i> {username}
            </span>
            <button className="btn btn-link" onClick={handleLogout}>Logout</button>
            <TestButton /> {/* Add the TestButton component here */}
          </div>
        }
      </div>
    </nav>
  );
};

export default Header;