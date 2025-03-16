import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './Auth';
import CircularProgress from "@mui/material/CircularProgress"; // Import CircularProgress


export const AdminRoute = ({ children }) => {
  const { user, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <CircularProgress />;
  }

  if (!user || userRole !== "admin") {
    // Redirect them to the login page, but save the current location they were
    // trying to go to when they were redirected
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};