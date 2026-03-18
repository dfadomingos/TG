import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "accent";
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-[#0D47A1] text-[#F8FAFC]",
    secondary: "bg-[#D2D1D1] text-[#000000]",
    accent: "bg-[#F59E0B] text-[#1E293B]",
  };

  return (
    <button
      className={`
        flex items-center justify-center gap-2 rounded-full font-bold 
        transition-all hover:opacity-90 active:scale-95
        px-6 h-[44px] text-sm
        ${variants[variant]} 
        ${fullWidth ? "w-full" : ""} 
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
