import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout, selectIsAuthenticated } from '../features/auth/authSlice';
import { jwtDecode } from 'jwt-decode'; // <-- Import jwt-decode here too
import './Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  // --- Check for Admin Role ---
  const token = localStorage.getItem('accessToken');
  let isAdmin = false;
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const userGroups = decodedToken['cognito:groups'] || [];
      isAdmin = userGroups.includes('Admins');
    } catch (e) {
      // Invalid token, treat as not admin
      isAdmin = false;
    }
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to={isAuthenticated ? "/products" : "/login"}>
          InventoryApp
        </NavLink>
      </div>
      <div className="navbar-links">
        {isAuthenticated ? (
          <>
            <NavLink to="/products">Products</NavLink>
            
            {/* --- Conditionally render Admin links --- */}
            {isAdmin && (
              <>
                <NavLink to="/admin">Admin</NavLink>
                <NavLink to="/admin-dashboard">Dashboard</NavLink>
              </>
            )}

            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/signup">Sign Up</NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;