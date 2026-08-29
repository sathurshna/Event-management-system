import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg)] p-6 text-center">
      <AlertCircle size={64} className="text-[var(--color-primary)] mb-4" />
      <h1 className="text-4xl font-bold text-[var(--color-text-main)] mb-2">404 - Page Not Found</h1>
      <p className="text-[var(--color-text-muted)] mb-8 max-w-md">
        Oops! We can't seem to find the page you are looking for. It might have been removed or the link might be broken.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
