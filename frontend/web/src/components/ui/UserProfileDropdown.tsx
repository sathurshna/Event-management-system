import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function UserProfileDropdown() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center' 
        }}
      >
        {user.avatar ? (
          <img src={user.avatar} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {isOpen && (
        <div 
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '50px',
            right: '0',
            width: '280px',
            padding: '16px',
            borderRadius: '20px',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-color-glass)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>{user.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={() => { setIsOpen(false); navigate('/profile'); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', color: 'var(--text-main)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><User size={18} /> <span style={{ fontWeight: 600 }}>Profile</span></div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </button>

            <button 
              onClick={() => { setIsOpen(false); navigate('/settings'); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', color: 'var(--text-main)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Settings size={18} /> <span style={{ fontWeight: 600 }}>Settings</span></div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </button>

            <button 
              onClick={() => { setIsOpen(false); logout(); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', cursor: 'pointer', color: '#ef4444', marginTop: '4px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><LogOut size={18} /> <span style={{ fontWeight: 600 }}>Logout</span></div>
              <ChevronRight size={16} color="#ef4444" opacity={0.7} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
