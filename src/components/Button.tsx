// src/components/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function Button({ 
  isLoading, 
  children, 
  className = '', 
  disabled,
  ...props 
}: ButtonProps) {
  return (
    <button
      disabled={isLoading || disabled}
      className={`
        relative flex items-center justify-center gap-2 
        py-4 px-6 bg-[#045D5D] hover:bg-[#034A4A] text-white 
        rounded-2xl font-semibold tracking-wide 
        transition-all duration-150 ease-in-out
        shadow-[0_8px_20px_-6px_rgba(4,93,93,0.5)] 
        hover:shadow-[0_12px_24px_-6px_rgba(4,93,93,0.6)] hover:-translate-y-0.5 
        active:scale-[0.97] active:translate-y-0 active:shadow-sm
        disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100
        group overflow-hidden
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}