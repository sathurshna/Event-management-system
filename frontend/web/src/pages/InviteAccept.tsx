import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const InviteAccept: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const response = await api.get(`/invites/${token}`);
        setInvite(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Invalid or expired invitation');
      } finally {
        setLoading(false);
      }
    };
    fetchInvite();
  }, [token]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await api.post(`/invites/${token}/accept`, { note });
      toast.success('Invitation accepted! You can now log in to view the event.');
      navigate('/login'); // Redirect to login so they can view the event properly
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    setDeclining(true);
    try {
      await api.post(`/invites/${token}/decline`, { note });
      toast.success('Invitation declined. The host has been notified.');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to decline invitation');
    } finally {
      setDeclining(false);
    }
  };

  if (loading) {
    return <div className="flex-center" style={{ height: '100vh' }}>Loading invitation...</div>;
  }

  if (error) {
    return (
      <div className="flex-center" style={{ height: '100vh', flexDirection: 'column' }}>
        <h2 style={{ color: '#ef4444' }}>Oops!</h2>
        <p className="text-muted">{error}</p>
        <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '24px' }}>Go Home</button>
      </div>
    );
  }

  if (invite?.accepted || invite?.declined) {
    return (
      <div className="flex-center" style={{ height: '100vh', flexDirection: 'column' }}>
        <h2>You've already responded!</h2>
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
          <button onClick={() => navigate('/')} style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600 }}>Go Home</button>
          <button onClick={() => navigate(`/events/${invite.event_id}`)} className="btn-primary">View Event Details</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-center" style={{ height: '100vh', padding: '24px' }}>
      <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '40px 32px' }}>
        <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '32px' }}>🎉</span>
        </div>
        
        <h2 style={{ marginTop: 0, marginBottom: '8px' }}>You're Invited!</h2>
        <p className="text-muted" style={{ marginBottom: '24px', lineHeight: 1.6 }}>
          <strong>{invite.inviter_name}</strong> has invited you to attend <strong>{invite.title}</strong>.
        </p>

        <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', marginBottom: '32px', textAlign: 'left' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem' }}><span className="text-muted">Date:</span> {new Date(invite.date).toLocaleDateString()}</p>
          <p style={{ margin: 0, fontSize: '0.875rem' }}><span className="text-muted">Location:</span> {invite.location}</p>
        </div>

        <div style={{ marginBottom: '24px', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Add a note to the host (Optional)
          </label>
          <textarea 
            className="input-field" 
            rows={3} 
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="E.g. Thanks for the invite! I'll be there."
            style={{ width: '100%', resize: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            onClick={handleDecline} 
            disabled={accepting || declining} 
            style={{ 
              flex: 1, 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              color: '#ef4444', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              padding: '12px', 
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            {declining ? 'Declining...' : 'Decline'}
          </button>
          
          <button 
            onClick={handleAccept} 
            disabled={accepting || declining} 
            className="btn-primary" 
            style={{ flex: 1 }}
          >
            {accepting ? 'Accepting...' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteAccept;
