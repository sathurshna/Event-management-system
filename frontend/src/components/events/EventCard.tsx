import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  cover_image: string;
  is_public?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ title, description, date, location, cover_image, is_public }) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div 
      className="glass-panel" 
      style={{ 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
    >
      <div style={{ position: 'relative', height: '200px', backgroundColor: 'var(--border-color)' }}>
        {cover_image ? (
          <img src={cover_image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            No Image
          </div>
        )}
        {is_public !== undefined && (
          <div style={{
            position: 'absolute', top: '12px', right: '12px',
            backgroundColor: is_public ? 'var(--secondary-color)' : 'var(--primary-color)',
            color: 'white', padding: '4px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600
          }}>
            {is_public ? 'Public' : 'Private'}
          </div>
        )}
      </div>

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
          {title}
        </h3>
        <p className="text-muted" style={{ margin: '0 0 20px 0', fontSize: '0.875rem', lineHeight: 1.5, flex: 1 }}>
          {description.length > 100 ? description.substring(0, 100) + '...' : description}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <Calendar size={16} style={{ marginRight: '8px', color: 'var(--primary-color)' }} />
            {formattedDate}
          </div>
          {location && (
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <MapPin size={16} style={{ marginRight: '8px', color: 'var(--primary-color)' }} />
              {location}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
