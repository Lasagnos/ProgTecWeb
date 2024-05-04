import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import { useCookies } from 'react-cookie';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  // const [, setCookie] = useCookies(['user']);

  const handleSubmit = async (e) => {
    axios.defaults.withCredentials = true;
    e.preventDefault(); // Avoid page refresh

    try {
      await axios.post('http://localhost:5000/api/register', { username, password }); // Pass the username and password to the server

      // ALTERNATIVE for immediate login:
      // // Set the user cookie to the username
      // setCookie('user', username, { path: '/' });
      // navigate('/'); // Redirect to home page after successful registration
      
      navigate('/login'); // Redirect to login page after successful registration
    } catch (error) {
      setErrorMessage(error.response.data.error);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-4">
          <h2 className="text-center">
            Register to <i className="fas fa-calendar"></i> SELFIE !
          </h2>

          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}  {/* Show error message if registration fails */}

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input type="text" id="username" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input type="password" id="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <button type="submit" className="btn btn-primary">Register</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;