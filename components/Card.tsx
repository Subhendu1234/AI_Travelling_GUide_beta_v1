
import React from 'react';

interface CardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, icon, children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden ${className}`}>
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 flex items-center">
        {icon && <div className="mr-3 text-blue-500">{icon}</div>}
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      </div>
      <div className="p-4 sm:p-5">
        {children}
      </div>
    </div>
  );
};
