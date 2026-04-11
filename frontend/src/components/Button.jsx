import React from 'react';

const Button = ({ children, size = 'md', className = '', onClick, ...props }) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center justify-center
        bg-indigo-500 text-white
        rounded-md
        hover:bg-indigo-600
        transition-colors
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
