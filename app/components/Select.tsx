import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string;
  options: SelectOption[];
  icon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, icon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        <label className="text-gray-900 font-semibold text-sm">{label}:</label>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-400 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
          {icon && <span className="text-gray-600 flex-shrink-0 flex items-center justify-center w-4 h-4">{icon}</span>}
          <select
            ref={ref}
            className={`w-full bg-transparent outline-none text-sm text-gray-800 ${className}`}
            {...props}
          >
            <option value="" disabled>
              Selecione...
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';
