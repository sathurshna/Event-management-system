import React, { useState, useEffect } from 'react';
import { Bell, MapPin, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();

  const [pushEnabled, setPushEnabled] = useState(user?.push_enabled !== false);
  const [emailEnabled, setEmailEnabled] = useState(user?.email_enabled !== false);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const isLight = document.documentElement.classList.contains('light-mode');
    setDarkMode(!isLight);
  }, []);

  const handleTogglePush = async () => {
    const newVal = !pushEnabled;
    setPushEnabled(newVal);
    try {
      await updateUser({ push_enabled: newVal });
    } catch (e) {
      setPushEnabled(!newVal);
      toast.error('Failed to update push settings');
    }
  };

  const handleToggleEmail = async () => {
    const newVal = !emailEnabled;
    setEmailEnabled(newVal);
    try {
      await updateUser({ email_enabled: newVal });
    } catch (e) {
      setEmailEnabled(!newVal);
      toast.error('Failed to update email settings');
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  const renderSettingRow = (icon: React.ReactNode, title: string, value: boolean, onToggle: () => void) => (
    <div className="glass-panel" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      marginBottom: '16px',
      cursor: 'pointer'
    }} onClick={onToggle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ color: 'var(--text-main)' }}>{icon}</span>
        <span style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 600 }}>{title}</span>
      </div>

      <div style={{
        width: '48px',
        height: '24px',
        borderRadius: '12px',
        background: value ? 'var(--primary-color)' : 'var(--border-color)',
        position: 'relative',
        transition: 'background 0.3s'
      }}>
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: 'var(--text-main)',
          position: 'absolute',
          top: '2px',
          left: value ? '26px' : '2px',
          transition: 'left 0.3s',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '32px' }}>Settings</h1>

      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 700 }}>
          Notifications
        </h3>
        {renderSettingRow(<Bell size={24} />, 'Push Notifications', pushEnabled, handleTogglePush)}
        {renderSettingRow(<Bell size={24} opacity={0.6} />, 'Email Alerts', emailEnabled, handleToggleEmail)}
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 700 }}>
          Preferences
        </h3>
        {renderSettingRow(<MapPin size={24} />, 'Location Services', locationEnabled, () => setLocationEnabled(!locationEnabled))}
        {renderSettingRow(<Moon size={24} />, 'Dark Mode', darkMode, toggleDarkMode)}
      </div>
    </div>
  );
}
