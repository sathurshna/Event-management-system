import React from 'react';
// Link removed
import { ServerCrash } from 'lucide-react';

const ServerError: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg)] p-6 text-center">
      <ServerCrash size={64} className="text-[var(--color-error)] mb-4" />
      <h1 className="text-4xl font-bold text-[var(--color-text-main)] mb-2">500 - Server Error</h1>
      <p className="text-[var(--color-text-muted)] mb-8 max-w-md">
        Something went wrong on our end. Please try again later or contact support if the issue persists.
      </p>
      <a 
        href="/" 
        className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
      >
        Return to Dashboard
      </a>
    </div>
  );
};

export default ServerError;
