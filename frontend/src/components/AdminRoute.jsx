import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // We need a library to decode the token

// We need our selector to check if the user is logged in
import { selectIsAuthenticated } from '../features/auth/authSlice';

const AdminRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const token = localStorage.getItem('accessToken');

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const userGroups = decodedToken['cognito:groups'] || [];

    // 3. Check if the user's groups include 'Admins'.
    if (userGroups.includes('Admins')) {
      // If they are an admin, render the child component (e.g., AdminDashboard).
      return <Outlet />;
    } else {
      // If they are a regular user, redirect them away from the admin page.
      // Redirecting to the main products page is a good, user-friendly choice.
      return <Navigate to="/products" replace />;
    }
  } catch (error) {
    // If the token is malformed or invalid, something is wrong. Send them to login.
    console.error("Invalid token:", error);
    return <Navigate to="/login" replace />;
  }
};

export default AdminRoute;