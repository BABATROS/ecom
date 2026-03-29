import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.length || allowedRoles.includes(role)) {
    return <Outlet />;
  }

  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
