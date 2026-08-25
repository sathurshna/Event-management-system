import React from 'react';
import { Menu, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  toggleSidebar: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header 
      style={{
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        backgroundColor: 'var(--surface-color-glass)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color-glass)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button 
          className="mobile-only"
          onClick={toggleSidebar}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', marginRight: '16px' }}
        >
          <Menu size={24} />
        </button>
        <h3 className="desktop-only" style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)' }}>
          Welcome back, {user?.name?.split(' ')[0]}
        </h3>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <Bell size={20} />
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <button 
            onClick={logout}
            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
