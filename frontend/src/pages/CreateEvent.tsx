import React from 'react';
import EventForm from '../components/events/EventForm';

const CreateEvent: React.FC = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Create New Event</h1>
        <p className="text-muted">Fill out the details below to publish your event.</p>
      </div>
      
      <EventForm />
    </div>
  );
};

export default CreateEvent;
