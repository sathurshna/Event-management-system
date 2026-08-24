import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="glass-panel"
        style={{ 
          background: 'transparent', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
          padding: '8px', color: 'var(--text-main)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          opacity: currentPage === 1 ? 0.5 : 1
        }}
      >
        <ChevronLeft size={20} />
      </button>

      <span style={{ margin: '0 16px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Page <strong style={{ color: 'var(--text-main)' }}>{currentPage}</strong> of {totalPages}
      </span>

      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="glass-panel"
        style={{ 
          background: 'transparent', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
          padding: '8px', color: 'var(--text-main)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          opacity: currentPage === totalPages ? 0.5 : 1
        }}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;
