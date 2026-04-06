"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { IconHome } from "@/app/components/IconHome";
import IconHeart from "@/app/components/IconHeart";
import { IconProfileBadge } from "@/app/components/IconProfileBadge";
import { IconLogout } from "@/app/components/IconLogout";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function SidebarUsuario({ isOpen = false, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const primeiroNome = user?.nome?.split(" ")[0] || "Meu Perfil";
  const userEmail = user?.email || "";

  const isActive = (path: string) =>
    pathname === path
      ? "bg-blue-800/40 text-white font-bold border-l-4 border-background-button"
      : "text-gray-300 hover:bg-blue-800/50 hover:text-white";

  return (
    <>
      <div 
        className={`md:hidden fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      
      <aside className={`
        w-64 bg-background-1 text-white flex-col justify-between border-r border-blue-900/50
        fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out flex
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="flex flex-col relative w-full h-full overflow-y-auto">
          {onClose && (
            <button 
              onClick={onClose} 
              className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        {/* Profile Info */}
        <div className="p-6 border-b border-blue-800/50 mb-6 text-center">
          <h2 className="text-xl font-bold mb-1">{primeiroNome}</h2>
          <p className="text-sm text-gray-300 opacity-80">{userEmail}</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-2 px-4">
          <Link 
            href="/" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/")}`}
          >
            <IconHome className="w-5 h-5" />
            <span className="font-semibold">Início</span>
          </Link>
          
          <Link 
            href="/painel-usuario" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/painel-usuario")}`}
          >
            <IconHeart className="w-5 h-5 fill-white text-white" />
            <span className="font-semibold">Meus Favoritos</span>
          </Link>

          <Link 
            href="/painel-usuario/dados" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/painel-usuario/dados")}`}
          >
            <IconProfileBadge className="w-5 h-5" />
            <span className="font-semibold">Meus Dados</span>
          </Link>
        </nav>
      </div>

      {/* Logout */}
      <div className="p-4 px-8 mb-4">
        <button 
          onClick={logout}
          className="flex items-center gap-3 text-gray-300 hover:text-red-400 transition-colors w-full cursor-pointer bg-transparent border-none"
        >
          <IconLogout className="w-5 h-5" />
          <span className="font-semibold">Sair</span>
        </button>
      </div>
    </aside>
    </>
  );
}
