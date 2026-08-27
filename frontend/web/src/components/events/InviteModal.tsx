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
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  if (!isOpen) return null;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await api.post(`/events/${eventId}/invites`, { email, force: requiresConfirmation });
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      setRequiresConfirmation(false);
      setConfirmationMessage('');
      onClose();
    } catch (error: any) {
      if (error.response?.data?.requiresConfirmation) {
        setRequiresConfirmation(true);
        setConfirmationMessage(error.response.data.message);
      } else {
        toast.error(error.response?.data?.message || 'Failed to send invitation');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setRequiresConfirmation(false);
    setConfirmationMessage('');
  };

  return (
    <div 
      onClick={onClose}
      style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: '24px'
    }}>
      <div 
        className="glass-panel" 
        onClick={(e) => e.stopPropagation()} 
        style={{ width: '100%', maxWidth: '400px', position: 'relative' }}
      >
        <button 
          type="button"
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 10 }}
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
                onChange={handleEmailChange}
                placeholder="friend@example.com"
                className="input-field"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>
          
          {requiresConfirmation && (
            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', fontSize: '0.875rem' }}>
              {confirmationMessage}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', backgroundColor: requiresConfirmation ? '#ef4444' : undefined }}>
            {loading ? 'Sending...' : (requiresConfirmation ? 'Yes, send again' : 'Send Invitation')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InviteModal;
