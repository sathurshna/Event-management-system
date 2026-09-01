import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import SettingsPage from './pages/SettingsPage';
import Profile from './pages/Profile';
import EventsList from './pages/EventsList';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import EventDetail from './pages/EventDetail';
import InviteAccept from './pages/InviteAccept';
import NotificationsPage from './pages/NotificationsPage';
import CalendarView from './pages/CalendarView';

import './index.css';

import Layout from './components/layout/Layout';

import ErrorBoundary from './components/ui/ErrorBoundary';
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  const from = location.state?.from || "/";
  return user ? <Navigate to={from} replace /> : <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/invites/:token" element={<InviteAccept />} />
      <Route path="/500" element={<ServerError />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<EventsList />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/events/:id/edit" element={<EditEvent />} />
        </Route>
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
