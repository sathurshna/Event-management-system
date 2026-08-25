import React from 'react';

const EventSkeleton: React.FC = () => {
  return (
    <div className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div 
        className="skeleton-shimmer" 
        style={{ 
          height: '200px', 
          backgroundColor: 'var(--border-color)',
        }} 
      />
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="skeleton-shimmer" style={{ height: '24px', width: '80%', backgroundColor: 'var(--border-color)', borderRadius: '4px' }} />
        <div className="skeleton-shimmer" style={{ height: '16px', width: '60%', backgroundColor: 'var(--border-color)', borderRadius: '4px' }} />
        <div className="skeleton-shimmer" style={{ height: '16px', width: '40%', backgroundColor: 'var(--border-color)', borderRadius: '4px', marginTop: 'auto' }} />
      </div>
    </div>
  );
};

export default EventSkeleton;
