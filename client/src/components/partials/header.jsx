import React from 'react';

const Header = () => {
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
          </ul>
        </div>

      </div>
    </nav>
  );
};

export default Header;