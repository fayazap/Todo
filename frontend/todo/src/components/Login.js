import React, { useState } from 'react';
import TodoList from './TodoList';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotPassword2, setForgotPassword2] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetPasswordMessage, setResetPasswordMessage] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Set the access token in state and local storage
        localStorage.setItem('accessToken', data.access_token);
        window.location.href = '/todos';
        return <TodoList />;
      } else if (response.status === 401) {
        setError('Invalid email or password');
      } else if (response.status === 400) {
        setError('Email and password are required');
      } else {
        setError('An error occurred. Please try again later.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again later.');
    }
  };

  const handleForgotPassword = async () => {
    try {
      const response = await fetch('http://localhost:5000/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setForgotPasswordMessage(data.message);
        setForgotPassword2(true);
      } else {
        setForgotPasswordMessage(data.error);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setForgotPasswordMessage('An error occurred. Please try again later.');
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await fetch('http://localhost:5000/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token: resetToken, new_password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetPasswordMessage(data.message);
      } else {
        setResetPasswordMessage(data.error);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setResetPasswordMessage('An error occurred. Please try again later.');
    }
  };

  return (
    <div className='login-wrapper'>
      <div className="login-container">
        <div className="login-logo">
          <img src="/Images/logo.png" alt="Logo" className="login_logo_image" />
        </div>
        <h2>Login</h2>
        <div className="login-input-section">
          <input
            className='login-input'
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />
          <input
            className='login-input'
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          {error && <p className="error-message">{error}</p>}
          <button className='login-button' onClick={handleLogin}>Login</button>
          <p><b>New User?</b> <button className='forgot-password-button'><a className='signup-link' href="/signup">Signup</a></button></p>
        </div>
        <p><b>Forgot Password?</b>
        <button className='forgot-password-button' onClick={() => setForgotPassword(!forgotPassword)}>Click Here</button></p>

        {forgotPassword && (
          <>
        <div className="forgot-password-section">
          <input
            className='login-input'
            type="email"
            placeholder="Enter email for password reset"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
          />
          <button className='login-button' onClick={handleForgotPassword}>Forgot Password</button>
          {forgotPasswordMessage && <p className="forgot-password-message">{forgotPasswordMessage}</p>}
        </div>
        {forgotPassword2 && (
          <>
        <div className="reset-password-section">
        <input
            className='login-input'
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <input
            className='login-input'
            type="text"
            placeholder="Enter token"
            value={resetToken}
            onChange={(e) => setResetToken(e.target.value)}
          />
          <input
            className='login-input'
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button className='login-button' onClick={handleResetPassword}>Reset Password</button>
          {resetPasswordMessage && <p className="reset-password-message">{resetPasswordMessage}</p>}
        </div>
        </>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default Login;
