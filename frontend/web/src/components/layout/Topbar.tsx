import React from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationsDropdown from '../ui/NotificationsDropdown';
import UserProfileDropdown from '../ui/UserProfileDropdown';

interface TopbarProps {
  toggleSidebar: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header 
      style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        margin: '24px 24px 0 24px',
        borderRadius: '32px',
        backgroundColor: 'var(--surface-color-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: '24px',
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
        <NotificationsDropdown />
        
        <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
          <UserProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
