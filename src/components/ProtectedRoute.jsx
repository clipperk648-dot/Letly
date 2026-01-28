import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required but user doesn't have it, redirect to their dashboard
  if (allowedRole && (!userRole || allowedRole !== userRole)) {
    if (userRole === 'landlord') return <Navigate to="/landlord-dashboard" replace />;
    if (userRole === 'tenant') return <Navigate to="/tenant-dashboard" replace />;
    // If no role at all, redirect to login
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
