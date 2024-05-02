import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/login', { username, password });
      
      // Store the session ID and username in local storage
      localStorage.setItem('sessionID', response.data.sessionID);
      localStorage.setItem('username', username);
  
      // Redirect to home page after successful login
      navigate('/');
    } catch (error) {
      // Handle error
      setErrorMessage('User does not exist or password is incorrect');
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-4">
          <h2 className="text-center">
            Log in to your <i className="fas fa-calendar"></i> SELFIE acccount
          </h2>
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input type="text" id="username" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input type="password" id="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary">Login</button>
            <button type="button" onClick={handleRegister} className="btn btn-link">Register</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;