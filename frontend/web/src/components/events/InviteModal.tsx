import React, { useState } from 'react';
import { Mail, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, eventId }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await api.post(`/events/${eventId}/invites`, { email });
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: '24px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>
        
        <h2 style={{ marginTop: 0, marginBottom: '8px' }}>Invite Guest</h2>
        <p className="text-muted" style={{ marginBottom: '24px', fontSize: '0.875rem' }}>Send an email invitation for this event.</p>
        
        <form onSubmit={handleInvite}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Guest Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="friend@example.com"
                className="input-field"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%' }}>
            {loading ? 'Sending...' : 'Send Invitation'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InviteModal;
