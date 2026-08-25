import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Compass, Settings, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'My Events', path: '/events', icon: <CalendarDays size={20} /> },
    { name: 'Discover', path: '/discover', icon: <Compass size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside 
      className={`sidebar ${isOpen ? 'open' : ''}`}
      style={{
        width: '260px',
        backgroundColor: 'var(--surface-color)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 50,
        transition: 'transform 0.3s ease',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      }}
    >
      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.5rem' }}>NexusEvents</h2>
        <button 
          className="mobile-only" 
          onClick={closeSidebar}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>
      </div>

      <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={closeSidebar}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
              backgroundColor: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.2s ease',
            })}
          >
            <span style={{ marginRight: '12px', color: 'inherit' }}>{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
