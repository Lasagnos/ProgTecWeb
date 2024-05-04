import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
//import TestButton from './testbutton';  // DEBUG

const Header = () => {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const [cookies, , removeCookie] = useCookies(['user']);
  const username = cookies.user.username; // show username in the navbar

  const handleLogout = () => {
    axios.post('http://localhost:5000/api/logout')
      .then(() => {
        removeCookie('user'); // Remove the user cookie
        navigate('/login');   // And redirect to the login page
      })
      .catch(error => console.error('Error logging out:', error));
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
            <li className="nav-item"> {/* Maybe remove in the future and leave brand? */}
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


        {username &&  // Conditional rendering
          <div className="ml-auto d-flex align-items-center">
            <span className="navbar-text mr-3">
              <i className="fas fa-user"></i> {username}
            </span>
            <button className="btn btn-link" onClick={handleLogout}>Logout</button>
            {/*<TestButton />*/}  {/* DEBUG */}
          </div>
        }
      </div>
    </nav>
  );
};

export default Header;