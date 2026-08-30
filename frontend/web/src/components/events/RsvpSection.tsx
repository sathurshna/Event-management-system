import React, { useEffect, useState } from 'react';
import { UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

interface Attendee {
  rsvp_id: string;
  status: 'ATTENDING' | 'MAYBE' | 'DECLINED';
  note: string | null;
  user_id: string;
  name: string;
  avatar: string | null;
}

interface RsvpSectionProps {
  eventId: string;
  isOwner?: boolean;
  hostId?: string;
}

const statusConfig = {
  ATTENDING: { label: "You're going! 🎉", color: 'var(--primary-color)', bg: 'rgba(99,102,241,0.1)' },
  MAYBE:     { label: "You might go 🤔", color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  DECLINED:  { label: "You can't make it 😔", color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

const RsvpSection: React.FC<RsvpSectionProps> = ({ eventId, isOwner, hostId }) => {
  const { user } = useAuth();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRsvp, setMyRsvp] = useState<Attendee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'ATTENDING' | 'MAYBE' | 'DECLINED'>('ATTENDING');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAttendees = async () => {
    try {
      const [attendeesRes, myRsvpRes] = await Promise.all([
        api.get(`/events/${eventId}/rsvps`),
        user ? api.get(`/events/${eventId}/my-rsvp`) : Promise.resolve({ data: { data: null } })
      ]);
      
      setAttendees(attendeesRes.data.data);
      
      if (user && myRsvpRes.data.data) {
        const meData = myRsvpRes.data.data;
        setMyRsvp({
          rsvp_id: 'me',
          status: meData.status,
          note: meData.note,
          user_id: user.id,
          name: user.name || '',
          avatar: null
        });
        setPendingStatus(meData.status);
        setNote(meData.note || '');
      } else {
        setMyRsvp(null);
        setPendingStatus('ATTENDING');
        setNote('');
      }
    } catch (error) {
      console.error('Failed to fetch RSVPs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, [eventId]);

  const handleSaveRsvp = async () => {
    setSaving(true);
    try {
      await api.post(`/events/${eventId}/rsvp`, { status: pendingStatus, note: note || null });
      toast.success('RSVP updated!');
      setIsEditing(false);
      fetchAttendees();
    } catch (error) {
      toast.error('Failed to update RSVP');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-muted">Loading attendees...</div>;

  const attending = attendees.filter(a => a.status === 'ATTENDING');
  const myConfig = myRsvp ? statusConfig[myRsvp.status] : null;

  return (
    <div style={{ marginTop: '32px' }}>
      {/* ── RSVP Section (hidden for host) ── */}
      {!isOwner && (
        <div style={{ marginBottom: '32px' }}>
          {!myRsvp && !isEditing ? (
            /* No RSVP yet — show 3 quick buttons */
            <>
              <h3 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Are you going?</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                {(['ATTENDING', 'MAYBE', 'DECLINED'] as const).map(s => (
                  <button key={s} onClick={() => { setPendingStatus(s); setIsEditing(true); }}
                    className="btn-primary" style={{ flex: 1, backgroundColor: 'var(--surface-color)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                    {s === 'ATTENDING' ? 'Yes 🎉' : s === 'MAYBE' ? 'Maybe 🤔' : "Can't go 😔"}
                  </button>
                ))}
              </div>
            </>
          ) : !isEditing ? (
            /* Already RSVP'd — show status + Edit button */
            <>
              <h3 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Your Response</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: myConfig?.bg, border: `1px solid ${myConfig?.color}30` }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: myConfig?.color, fontSize: '1rem' }}>{myConfig?.label}</p>
                  {myRsvp?.note && <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>"{myRsvp.note}"</p>}
                </div>
                <button onClick={() => setIsEditing(true)} className="btn-primary"
                  style={{ width: 'auto', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Change Response
                </button>
              </div>
            </>
          ) : (
            /* Edit mode — pick status + add note */
            <>
              <h3 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Update Your Response</h3>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                {(['ATTENDING', 'MAYBE', 'DECLINED'] as const).map(s => (
                  <button key={s} onClick={() => setPendingStatus(s)} className="btn-primary" style={{
                    flex: 1,
                    backgroundColor: pendingStatus === s ? (s === 'ATTENDING' ? 'var(--primary-color)' : s === 'MAYBE' ? '#f59e0b' : '#ef4444') : 'var(--surface-color)',
                    color: pendingStatus === s ? 'white' : 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                  }}>
                    {s === 'ATTENDING' ? 'Yes 🎉' : s === 'MAYBE' ? 'Maybe 🤔' : "Can't go 😔"}
                  </button>
                ))}
              </div>

              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder={pendingStatus !== 'ATTENDING' ? 'Add a note (optional) — e.g. "Out of town that weekend"' : 'Add a note (optional)'}
                className="input-field"
                rows={3}
                style={{ resize: 'vertical', marginBottom: '12px', backgroundColor: 'rgba(0,0,0,0.2)' }}
              />

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleSaveRsvp} disabled={saving} className="btn-primary" style={{ flex: 1 }}>
                  {saving ? 'Saving...' : 'Save Response'}
                </button>
                <button onClick={() => setIsEditing(false)} className="btn-primary"
                  style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Attendee List ── */}
      <h3 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Attendees ({attending.length})</h3>
      {attending.length === 0 ? (
        <p className="text-muted">No one has RSVP'd yet. Be the first!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
          {attending.map(a => (
            <div key={a.rsvp_id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              {a.avatar ? (
                <img src={a.avatar} alt={a.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <UserCircle size={36} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              )}
              <div style={{ overflow: 'hidden' }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</p>
                {a.user_id === hostId && <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 700 }}>Host ⭐</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RsvpSection;
