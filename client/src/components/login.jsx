import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

function Login() {
  axios.defaults.withCredentials = true;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [, setCookie] = useCookies(['user']);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Avoid page refresh
  
    try {
      const response = await axios.post('http://localhost:5000/api/login', { username, password }); // Pass the username and password to the server
      
      // Save the user data in a cookie
      setCookie('user', response.data, { path: '/', sameSite: 'None', secure: false }); // problematic!
      
      navigate('/');  // Redirect to home page after successful login
    } catch (error) {
      //console.log(error.response.data); // DEBUG
      setErrorMessage('User does not exist or password is incorrect');
    }
  };

  const handleRegister = () => {
    navigate('/register');  // Redirect to the register page
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-4">
          <h2 className="text-center">
            Log in to your <i className="fas fa-calendar"></i> SELFIE acccount
          </h2>

          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}  {/* Show error message if login fails */}
          
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