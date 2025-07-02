import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import apiClient from '@/lib/apiClient';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const location = useLocation();
  const isAuthenticated = apiClient.isAuthenticated();
  const userType = localStorage.getItem('userType');

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If admin-only route and user is not admin, redirect to home
  if (adminOnly && userType !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 