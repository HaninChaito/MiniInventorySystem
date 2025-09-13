import React from 'react';
// Import the necessary components from the two packages:
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

// Import your selector from the auth slice
import { selectIsAuthenticated } from '../features/auth/authSlice';

const PrivateRoute = () => {
  // 1. Use 'useSelector' from 'react-redux' to check the Redux state
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // If the user is authenticated, render the child route content using '<Outlet />'
  // If not, redirect them to the login page using '<Navigate />'
  
  // 2. Use '<Outlet>' and '<Navigate>' from 'react-router-dom'
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;