import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner size="lg" text="Authenticating user session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export const RoleRoute = ({ allowedRoles = [] }) => {
  const { role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner size="lg" text="Checking permissions..." />;
  }

  if (!allowedRoles.includes(role)) {
    return (
      <Navigate
        to="/403"
        state={{
          from: location.pathname,
          allowedRoles
        }}
        replace
      />
    );
  }

  return <Outlet />;
};


