
import React from 'react';

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  counter?: string;
}

const Card: React.FC<CardProps> = ({ title, icon, children, counter }) => {
  return (
    <div className="bg-base-light rounded-2xl shadow-xl border border-white/10 h-full flex flex-col">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
                <div className="mr-3 text-brand-secondary">{icon}</div>
                <h3 className="text-xl font-bold text-base-heading">{title}</h3>
            </div>
            {counter && (
                <span className="text-sm font-mono text-base-text bg-base-dark px-2 py-1 rounded-md">{counter}</span>
            )}
        </div>
      </div>
      <div className="px-6 pb-6 text-base-text flex-grow">
          {children}
      </div>
    </div>
  );
};

export default Card;