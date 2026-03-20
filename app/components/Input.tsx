import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        <label className="text-gray-900 font-semibold text-sm">{label}:</label>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-400 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
          {icon && <span className="text-gray-600 flex-shrink-0 flex items-center justify-center w-4 h-4">{icon}</span>}
          <input
            ref={ref}
            className={`w-full bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400 ${className}`}
            {...props}
          />
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';
