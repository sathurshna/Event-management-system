import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, Star, TrendingUp } from 'lucide-react';

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, trend: string }> = ({ title, value, icon, trend }) => (
  <div className="glass-panel" style={{ padding: '24px', flex: '1 1 200px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
      <div>
        <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>{title}</p>
        <h3 style={{ margin: '8px 0 0 0', fontSize: '2rem', color: 'var(--text-main)' }}>{value}</h3>
      </div>
      <div style={{ padding: '12px', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', color: 'var(--primary-color)' }}>
        {icon}
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
      <TrendingUp size={16} color="var(--secondary-color)" style={{ marginRight: '4px' }} />
      <span style={{ color: 'var(--secondary-color)', fontWeight: 500 }}>{trend}</span>
      <span className="text-muted" style={{ marginLeft: '6px' }}>vs last month</span>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Dashboard Overview</h1>
        <p className="text-muted">Here is what's happening with your events today.</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '40px' }}>
        <StatCard title="Total Events" value="12" icon={<Calendar size={24} />} trend="+2.5%" />
        <StatCard title="RSVPs Received" value="348" icon={<Users size={24} />} trend="+14.2%" />
        <StatCard title="Avg Rating" value="4.8" icon={<Star size={24} />} trend="+0.1%" />
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Recent Activity</h3>
        <div style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <p className="text-muted">No recent activity found. Try creating a new event!</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
