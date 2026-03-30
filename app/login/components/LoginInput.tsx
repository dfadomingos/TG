"use client";

import React from "react";

interface LoginInputProps {
  label: string;
  placeholder: string;
  type?: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  name?: string;
}

export function LoginInput({
  label,
  placeholder,
  type = "text",
  icon,
  value,
  onChange,
  name,
}: LoginInputProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="font-bold text-black text-sm sm:text-base md:text-lg lg:text-xl">
        {label}
      </label>
      <div className="flex items-center gap-2 sm:gap-2.5 border border-black rounded-[8px] px-2.5 py-1.5 sm:py-2 bg-white transition-all focus-within:border-[#0D47A1] focus-within:ring-1 focus-within:ring-[#0D47A1]/20">
        <span className="flex-shrink-0 opacity-60 scale-90">{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          name={name}
          className="w-full bg-transparent outline-none text-black placeholder-[#D7D1D1] font-bold text-sm sm:text-base md:text-lg lg:text-xl"
        />
      </div>
    </div>
  );
}
