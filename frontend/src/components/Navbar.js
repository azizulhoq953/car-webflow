
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaUserPlus, FaSignInAlt } from 'react-icons/fa';

const Navbar = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isAdmin: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';  // Ensure this is correctly checked
    // console.log('Auth State:', { token, isAdmin });
    setAuthState({ isAuthenticated: !!token, isAdmin });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    setAuthState({ isAuthenticated: false, isAdmin: false });
    navigate('/signing');
  };

  return (
    <nav style={styles.navbar}>
      <ul style={styles.navList}>
        <li style={styles.navItem}>
          <Link to="/" style={styles.navLink}>Home</Link>
        </li>
        {!authState.isAuthenticated ? (
          <>
            <li style={styles.navItem}>
              <Link to="/signup" style={styles.navLink}><FaUserPlus /> Sign Up</Link>
            </li>
            <li style={styles.navItem}>
              <Link to="/signing" style={styles.navLink}><FaSignInAlt /> Sign In</Link>
            </li>
          </>
        ) : (
          <>
           
         {authState.isAdmin && ( // Only show if user is admin
  <>
    <li style={styles.navItem}>
      <Link to="/admin" style={styles.navLink}>Admin Dashboard</Link>
    </li>
    <li style={styles.navItem}>
      <Link to="/create-forum" style={styles.navLink}>Create Forum</Link>
    </li>
  </>
)}
            <li style={styles.navItem}>
              <button onClick={handleLogout} style={styles.navButton}><FaUser /> Logout</button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
  },
  navList: {
    display: 'flex',
    listStyle: 'none',
    gap: '15px',
  },
  navItem: {
    display: 'inline',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  navButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
};

export default Navbar;
