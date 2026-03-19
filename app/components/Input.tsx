import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        <label className="text-gray-900 font-bold text-base md:text-lg">{label}:</label>
        <div className="flex items-center gap-3 px-4 py-3 md:py-4 rounded-[10px] border border-black bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all">
          {icon && <span className="text-black flex-shrink-0 flex items-center justify-center w-6 h-6 md:w-8 md:h-8">{icon}</span>}
          <input
            ref={ref}
            className={`w-full bg-transparent outline-none text-base text-gray-800 placeholder:text-gray-400 font-medium ${className}`}
            {...props}
          />
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';
