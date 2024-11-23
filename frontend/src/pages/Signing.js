import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Use useNavigate instead of useHistory
import authService from '../services/authService';
import './Signing.css'; // Import the CSS file

const Signing = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Use useNavigate for navigation

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { token } = await authService.signing(username, password);
      localStorage.setItem('token', token); // Store token in local storage or state
      alert('Login successful!');
      navigate('/'); // Redirect to profile page after successful login
    } catch (error) {
      alert('Error during login: ' + error.message);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="heading">Sign In</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />
          <button type="submit" className="submitButton">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default Signing;
