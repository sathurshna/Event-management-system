import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EventsList from './pages/EventsList';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import EventDetail from './pages/EventDetail';
import InviteAccept from './pages/InviteAccept';
import NotificationsPage from './pages/NotificationsPage';

import './index.css';

import Layout from './components/layout/Layout';

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/invites/:token" element={<InviteAccept />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/discover" element={<div>Discover Page (Coming Soon)</div>} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<div>Settings Page (Coming Soon)</div>} />
          <Route path="/events" element={<EventsList />} />
          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/events/:id/edit" element={<EditEvent />} />
        </Route>
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster 
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#334155',
              color: '#f8fafc',
              border: '1px solid #475569',
            }
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
