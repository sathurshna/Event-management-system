import React from 'react';
import { Calendar, MapPin } from 'lucide-react';

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  cover_image: string;
  is_public?: boolean;
  onClick?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ title, description, date, location, cover_image, is_public, onClick }) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const isPast = new Date(date) < new Date();
  let badgeColor = 'var(--primary-color)';
  let badgeText = '';
  let badgeTextColor = 'white';

  if (isPast) {
    badgeColor = '#4B5563'; // Gray
    badgeText = 'Past';
  } else if (is_public) {
    badgeColor = '#EAB308'; // Yellow
    badgeText = 'Public';
    badgeTextColor = '#000000'; // Dark text for yellow
  } else {
    badgeColor = '#D946EF'; // Magenta
    badgeText = 'Private';
  }

  return (
    <div 
      className="glass-panel event-card-wrapper" 
      style={{ 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        const img = e.currentTarget.querySelector('.event-card-img') as HTMLElement;
        if (img) img.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        const img = e.currentTarget.querySelector('.event-card-img') as HTMLElement;
        if (img) img.style.transform = 'scale(1)';
      }}
    >
      <div style={{ position: 'relative', height: '220px', backgroundColor: 'var(--border-color)', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to top, rgba(15,23,42,0.9) 0%, transparent 100%)',
          zIndex: 1,
          transition: 'opacity 0.3s ease',
        }} />
        {cover_image ? (
          <img 
            src={cover_image} 
            alt={title} 
            className="event-card-img"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
          />
        ) : (
          <div className="event-card-img" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: 'linear-gradient(45deg, var(--surface-color), #2a3441)', transition: 'transform 0.5s ease' }}>
            No Image
          </div>
        )}
        {(is_public !== undefined || isPast) && (
          <div style={{
            position: 'absolute', top: '12px', right: '12px',
            backgroundColor: badgeColor,
            color: badgeTextColor, padding: '4px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600
          }}>
            {badgeText}
          </div>
        )}
      </div>

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
          {title}
        </h3>
        <p className="text-muted" style={{ margin: '0 0 20px 0', fontSize: '0.875rem', lineHeight: 1.5, flex: 1 }}>
          {(description || '').length > 100 ? (description || '').substring(0, 100) + '...' : (description || '')}
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
