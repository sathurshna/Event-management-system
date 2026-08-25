import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, User, Users, Share2, Edit, Trash2, ArrowLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/ui/Modal';
import EventSkeleton from '../components/events/EventSkeleton';
import RsvpSection from '../components/events/RsvpSection';
import InviteModal from '../components/events/InviteModal';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        setEvent(response.data.data);
      } catch (error) {
        console.error('Failed to fetch event', error);
        toast.error('Event not found or access denied');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  if (loading) return <div style={{ maxWidth: '1200px', margin: '0 auto' }}><EventSkeleton /></div>;
  if (!event) return null;

  const isOwner = user?.id === event.host_id;
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '64px' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '24px' }}>
        <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Back to Dashboard
      </Link>

      <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
        {/* Cover Image */}
        <div style={{ width: '100%', height: '300px', backgroundColor: 'var(--border-color)', position: 'relative' }}>
          {event.cover_image ? (
            <img src={event.cover_image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div className="flex-center" style={{ width: '100%', height: '100%', color: 'var(--text-muted)' }}>No Cover Image</div>
          )}
          
          <div style={{
            position: 'absolute', top: '16px', right: '16px',
            backgroundColor: event.is_public ? 'var(--secondary-color)' : 'var(--primary-color)',
            color: 'white', padding: '6px 16px', borderRadius: '100px', fontSize: '0.875rem', fontWeight: 600
          }}>
            {event.is_public ? 'Public Event' : 'Private Event'}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <h1 style={{ margin: 0, fontSize: '2.5rem', flex: 1, minWidth: '300px' }}>{event.title}</h1>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleCopyLink} className="btn-primary" style={{ width: 'auto', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                <Share2 size={18} style={{ marginRight: '8px' }} /> Share
              </button>
              
              {isOwner && (
                <>
                  <button onClick={() => setInviteModalOpen(true)} className="btn-primary" style={{ width: 'auto', backgroundColor: 'var(--secondary-color)' }}>
                    <Mail size={18} style={{ marginRight: '8px' }} /> Invite
                  </button>
                  <button onClick={() => navigate(`/events/${id}/edit`)} className="btn-primary" style={{ width: 'auto', backgroundColor: 'var(--primary-color)' }}>
                    <Edit size={18} style={{ marginRight: '8px' }} /> Edit
                  </button>
                  <button onClick={() => setDeleteModalOpen(true)} className="btn-primary" style={{ width: 'auto', backgroundColor: '#ef4444' }}>
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px', padding: '24px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '12px', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', marginRight: '16px' }}>
                <Calendar size={24} color="var(--primary-color)" />
              </div>
              <div>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>Date & Time</p>
                <p style={{ margin: 0, fontWeight: 500 }}>{formattedDate}</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '12px', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', marginRight: '16px' }}>
                <MapPin size={24} color="var(--primary-color)" />
              </div>
              <div>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>Location</p>
                <p style={{ margin: 0, fontWeight: 500 }}>{event.location}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '12px', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', marginRight: '16px' }}>
                <User size={24} color="var(--primary-color)" />
              </div>
              <div>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>Hosted By</p>
                <p style={{ margin: 0, fontWeight: 500 }}>{event.host_name || 'You'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>About this event</h3>
            <p className="text-muted" style={{ lineHeight: 1.7, fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
              {event.description}
            </p>
          </div>

          <RsvpSection eventId={event.id} isOwner={isOwner} hostId={event.host_id} />
        </div>
      </div>

      <Modal 
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Event"
        message={`Are you sure you want to delete "${event.title}"? This action cannot be undone.`}
        confirmText="Delete Event"
        isDestructive={true}
      />

      <InviteModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setInviteModalOpen(false)} 
        eventId={event.id} 
      />
    </div>
  );
};

export default EventDetail;
