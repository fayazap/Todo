import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Signup.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, username, email, password }),
      });

      const data = await response.json();

      console.log(data);

      if (response.ok) {
        setAccessToken(data.access_token);
        localStorage.setItem('accessToken', data.access_token);

        const token = localStorage.getItem('accessToken');
        console.log('Token:', token);

        window.location.href = '/todos';
      } else if (response.status === 400) {
        setError(data.error);
      } else {
        setError('An error occurred. Please try again later.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className='signup-wrapper'>
      <div className="signup-container">
        <div className="signup-logo">
          <img src="/Images/logo.png" alt="Logo" className="signup_logo_image" />
        </div>
        <h2>Signup</h2>
        <input
          className='signup-input'
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br />
        <input
          className='signup-input'
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <input
          className='signup-input'
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <input
          className='signup-input'
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        {error && <p className="error-message">{error}</p>}
        <button className='signup-button' onClick={handleSignup}>Signup</button>
        <p><b>Already have an account?</b> <button className='forgot-password-button'><Link className='signup-link' to="/">Login</Link></button></p>
      </div>
    </div>
  );
};

export default Signup;
