import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import EventForm from '../components/events/EventForm';
import api from '../utils/api';

const EditEvent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        setEvent(response.data.data);
      } catch (error) {
        console.error('Failed to fetch event', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return <div className="flex-center" style={{ minHeight: '50vh' }}>Loading...</div>;
  }

  if (!event) {
    return <div className="flex-center" style={{ minHeight: '50vh' }}>Event not found</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Edit Event</h1>
        <p className="text-muted">Update your event details below.</p>
      </div>
      
      <EventForm initialData={event} isEdit={true} />
    </div>
  );
};

export default EditEvent;
