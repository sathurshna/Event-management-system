import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
};

export default ProtectedRoute;
