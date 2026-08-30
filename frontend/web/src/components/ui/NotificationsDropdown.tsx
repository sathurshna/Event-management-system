import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const prevUnreadCountRef = useRef(0);
  const isInitialLoad = useRef(true);

  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // Slide up to A6
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.log('Audio chime not supported or blocked by browser', e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      const notifs: Notification[] = response.data.data;
      setNotifications(notifs);
      
      const unreadCount = notifs.filter(n => !n.is_read).length;
      
      if (!isInitialLoad.current && unreadCount > prevUnreadCountRef.current) {
        playChime();
      }
      
      prevUnreadCountRef.current = unreadCount;
      isInitialLoad.current = false;
      
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Polling could be added here, or websockets, but for now we fetch on mount
    const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationClick = async (notif: Notification) => {
    setIsOpen(false);
    
    if (!notif.is_read) {
      try {
        await api.put(`/notifications/${notif.id}/read`);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      } catch (error) {
        console.error('Failed to mark read', error);
      }
    }

    if (notif.link) {
      // If it's a full URL, strip the origin
      try {
        const url = new URL(notif.link);
        navigate(url.pathname + url.search);
      } catch {
        // If it's already a relative path
        navigate(notif.link);
      }
    }
  };

  const markAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all read', error);
    }
  };

  return (
    <div className="notifications-dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          color: 'var(--text-muted)', 
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: '#ef4444',
            color: 'var(--text-main)',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '10px',
          width: '350px',
          backgroundColor: 'var(--surface-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 50,
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <div style={{
            padding: '16px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            backgroundColor: 'var(--surface-color)',
            zIndex: 1
          }}>
            <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '16px' }}>Notifications</h4>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No notifications yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {notifications.map(notif => (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  style={{
                    padding: '16px',
                    borderBottom: '1px solid var(--border-color-glass)',
                    backgroundColor: notif.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-color-glass)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.05)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ 
                      color: notif.is_read ? 'var(--text-main)' : 'var(--text-main)', 
                      fontSize: '14px',
                      fontWeight: notif.is_read ? 'normal' : '500'
                    }}>
                      {notif.message}
                    </span>
                    {!notif.is_read && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', marginTop: '6px', flexShrink: 0 }} />
                    )}
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                    {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
