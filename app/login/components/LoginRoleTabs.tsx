"use client";

import React from "react";
import IconUser from "../../components/IconUser";
import IconOrganizer from "../../components/IconOrganizer";

type Role = "usuario" | "organizador";

interface LoginRoleTabsProps {
  activeRole: Role;
  onRoleChange: (role: Role) => void;
}

export function LoginRoleTabs({ activeRole, onRoleChange }: LoginRoleTabsProps) {
  return (
    <div className="flex w-full h-[54px] sm:h-[64px] md:h-[72px]">
      {/* Para Usuários */}
      <button
        onClick={() => onRoleChange("usuario")}
        className={`
          flex-1 flex items-center justify-center gap-1.5 sm:gap-2
          font-bold text-xs sm:text-sm md:text-base lg:text-lg text-text-button
          transition-all duration-200 cursor-pointer
          ${activeRole === "usuario"
            ? "bg-white"
            : "bg-[#D9D9D9]"
          }
        `}
      >
        <IconUser className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="#1E293B" />
        <span>Para Usuários</span>
      </button>

      {/* Vertical separator */}
      <div className="w-px bg-black self-stretch" />

      {/* Para Organizadores */}
      <button
        onClick={() => onRoleChange("organizador")}
        className={`
          flex-1 flex items-center justify-center gap-1.5 sm:gap-2
          font-bold text-xs sm:text-sm md:text-base lg:text-lg text-text-button
          transition-all duration-200 cursor-pointer
          ${activeRole === "organizador"
            ? "bg-white"
            : "bg-[#D9D9D9]"
          }
        `}
      >
        <IconOrganizer className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="#1E293B" />
        <span>Para Organizadores</span>
      </button>
    </div>
  );
}
