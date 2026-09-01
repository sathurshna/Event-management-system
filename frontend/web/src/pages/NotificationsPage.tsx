import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import api from '../utils/api';

interface Notification {
  id: string;
  type: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.is_read) {
      try {
        await api.put(`/notifications/${notif.id}/read`);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      } catch (error) {
        console.error('Failed to mark read', error);
      }
    }

    if (notif.link) {
      try {
        const url = new URL(notif.link);
        navigate(url.pathname + url.search);
      } catch {
        navigate(notif.link);
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all read', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'Unread') return !n.is_read;
    return true; // 'All'
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="header-actions-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="mt-mobile" style={{ fontSize: '2rem', margin: '0 0 16px 0', lineHeight: 1 }}>Notifications</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['All', 'Unread'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: `1px solid ${activeFilter === filter ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  backgroundColor: activeFilter === filter ? 'var(--primary-color)' : 'transparent',
                  color: activeFilter === filter ? 'var(--text-main)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: activeFilter === filter ? 600 : 400,
                  transition: 'all 0.2s'
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        
        {unreadCount > 0 && (
          <button 
            className="w-full-mobile"
            onClick={markAllAsRead}
            style={{ 
              backgroundColor: 'transparent', 
              color: 'var(--primary-color)', 
              border: '1px solid var(--primary-color)',
              borderRadius: '6px',
              padding: '6px 16px',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Check size={16} /> Mark as read
          </button>
        )}
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="flex-center" style={{ padding: '64px', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: 'var(--text-muted)' }}>Loading notifications...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex-center" style={{ padding: '64px', color: 'var(--text-muted)' }}>
            You have no notifications in this view.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredNotifications.map(notif => (
              <div 
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                style={{
                  padding: '24px',
                  borderBottom: '1px solid var(--border-color-glass)',
                  backgroundColor: notif.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-color-glass)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.05)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {!notif.is_read && (
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', flexShrink: 0 }} />
                  )}
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: notif.is_read ? 'var(--text-main)' : 'var(--text-main)' }}>
                      {notif.message}
                    </h4>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
