import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isDestructive?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', isDestructive = false }) => {
  if (!isOpen) return null;

  return (
    <div className="flex-center" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100 }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '24px', backgroundColor: 'var(--surface-color)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>{title}</h3>
        <p className="text-muted" style={{ marginBottom: '24px', lineHeight: 1.5 }}>{message}</p>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button 
            onClick={onClose}
            className="btn-primary" 
            style={{ width: 'auto', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="btn-primary" 
            style={{ width: 'auto', backgroundColor: isDestructive ? '#ef4444' : 'var(--primary-color)' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
