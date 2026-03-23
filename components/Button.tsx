
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className="inline-flex items-center justify-center px-8 py-3 bg-brand-primary text-base-dark font-bold rounded-full shadow-lg hover:bg-opacity-80 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-brand-primary/50"
    >
      {children}
    </button>
  );
};

export default Button;
