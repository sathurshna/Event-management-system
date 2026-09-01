import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, User, Mail, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const payload: any = { name };
      if (avatar !== user?.avatar) payload.avatar = avatar;
      await updateUser(payload);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', marginRight: '16px', display: 'flex', alignItems: 'center' }}
        >
          <ChevronLeft size={28} />
        </button>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Edit Profile</h1>
      </div>

      {/* Avatar Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '48px' }}>
        <div style={{ 
          width: '120px', 
          height: '120px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--surface-color)', 
          border: '2px solid var(--primary-color)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          color: 'var(--text-main)',
          marginBottom: '16px',
          boxShadow: 'var(--shadow-glow)',
          overflow: 'hidden'
        }}>
          {avatar ? (
            <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : user?.avatar ? (
            <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            user?.name?.charAt(0).toUpperCase() || 'U'
          )}
        </div>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
        >
          Change Photo
        </button>
      </div>

      {/* Form Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
        
        {/* Display Name */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.5px' }}>
            DISPLAY NAME
          </label>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'var(--surface-color)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '12px', 
            padding: '0 16px',
            height: '56px'
          }}>
            <User size={20} color="var(--text-muted)" style={{ marginRight: '12px' }} />
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ 
                flex: 1, 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--text-main)', 
                fontSize: '1rem',
                outline: 'none'
              }} 
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.5px' }}>
            EMAIL ADDRESS
          </label>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'var(--overlay-subtle)', 
            border: '1px solid var(--border-color-glass)', 
            borderRadius: '12px', 
            padding: '0 16px',
            height: '56px',
            opacity: 0.7
          }}>
            <Mail size={20} color="var(--text-muted)" style={{ marginRight: '12px' }} />
            <input 
              type="email" 
              value={user?.email || ''}
              disabled
              style={{ 
                flex: 1, 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--text-muted)', 
                fontSize: '1rem',
                outline: 'none'
              }} 
            />
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '12px', marginLeft: '4px' }}>
            Email cannot be changed directly at this time.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ paddingBottom: '32px', paddingTop: '24px' }}>
        <button 
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="glass-panel"
          style={{ 
            width: '100%', 
            height: '56px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '12px',
            background: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            color: 'var(--text-main)',
            fontSize: '1.1rem',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            transition: 'all 0.2s'
          }}
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

    </div>
  );
}
