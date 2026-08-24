import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container" style={{ paddingTop: '4rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Dashboard</h2>
          <button onClick={logout} className="btn-primary" style={{ width: 'auto', backgroundColor: '#ef4444' }}>
            <LogOut size={18} style={{ marginRight: '8px' }} />
            Sign Out
          </button>
        </div>
        
        <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ color: 'var(--primary-color)' }}>Welcome, {user?.name}!</h3>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>Email: {user?.email}</p>
          <p className="text-muted" style={{ marginTop: '1rem' }}>
            You have successfully logged in using JWT authentication and raw MySQL!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
