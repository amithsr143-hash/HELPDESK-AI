import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-slate-500 dark:text-slate-400">
      <Loader2 className={`${sizeMap[size]} animate-spin text-brand-600 dark:text-brand-400`} />
      {text && <p className="mt-2 text-sm">{text}</p>}
    </div>
  );
};

