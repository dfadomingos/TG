import React from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'label'> {
  label: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <label className={`flex items-start gap-3 cursor-pointer group ${className}`}>
        <div className="relative flex items-center justify-center flex-shrink-0 mt-0.5 md:mt-1">
          <input
            type="checkbox"
            ref={ref}
            className="peer appearance-none w-6 h-6 md:w-8 md:h-8 border border-black rounded bg-white checked:bg-[#0A2342] checked:border-[#0A2342] transition-colors cursor-pointer"
            {...props}
          />
          <svg
            className="absolute w-4 h-4 md:w-5 md:h-5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <span className="text-gray-900 font-bold text-sm md:text-base leading-snug select-none flex-1">
          {label}
        </span>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
