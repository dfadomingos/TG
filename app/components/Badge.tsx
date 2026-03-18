import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className = "" }: BadgeProps) {
  return (
    <div
      className={`inline-block px-5 py-2 rounded-full text-sm font-bold text-white bg-[#0D47A1] ${className}`}
    >
      {children}
    </div>
  );
}
