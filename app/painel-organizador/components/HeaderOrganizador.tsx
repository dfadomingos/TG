"use client";

import Link from "next/link";
import { useAuth } from "@/app/contexts/AuthContext";
import IconHeader from "@/app/components/IconHeader";
import { IconLogout } from "@/app/components/IconLogout";

export function HeaderOrganizador({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const primeiroNome = user?.nome?.split(" ")[0] || "Organizador";

  return (
    <header className="bg-background-1 p-3 flex items-center justify-between px-4 sm:px-6 md:px-8 shadow-sm col-span-full relative z-50">
      <div className="flex items-center">
        {onMenuClick && (
          <button 
            onClick={onMenuClick} 
            className="md:hidden text-white mr-3 p-1 hover:bg-blue-800/50 rounded-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        )}
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <span className="text-text-1 mr-2.5 leading-none shrink-0">
            <IconHeader />
          </span>
          <p className="text-text-1 font-bold text-lg md:text-xl">FrancaEventos</p>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <span className="bg-background-button text-text-button font-bold text-xs sm:text-sm py-1.5 sm:py-2 px-4 sm:px-6 rounded-full flex items-center gap-2 shadow-md">
          <span>Olá, {primeiroNome}</span>
        </span>
        <button
          onClick={logout}
          className="text-text-1 text-xs sm:text-sm font-medium hover:underline transition-all cursor-pointer bg-transparent border-none flex items-center gap-1"
        >
          <IconLogout className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
