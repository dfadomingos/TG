"use client";

import IconHeader from "./IconHeader";
import IconUser from "./IconUser";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

export function Header() {
  const { user, isLoggedIn, logout } = useAuth();

  // Pega o primeiro nome do usuário
  const primeiroNome = user?.nome?.split(" ")[0] || "";
  const painelUrl = user?.tipo === "ORGANIZADOR" ? "/painel-organizador" : "/painel-usuario";

  return (
    <header className="bg-background-1 p-3 flex items-center justify-between px-4 sm:px-6 md:px-8">
      <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
        <span className="text-text-1 mr-2.5 leading-none">
          <IconHeader />
        </span>
        <p className="text-text-1 font-bold text-lg md:text-xl">FrancaEventos</p>
      </Link>

      {isLoggedIn ? (
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={painelUrl}
            className="bg-background-button text-text-button font-bold text-xs sm:text-sm py-1.5 sm:py-2 px-4 sm:px-6 rounded-full flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            <IconUser className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" />
            <span>Olá, {primeiroNome}</span>
          </Link>
          <button
            onClick={logout}
            className="text-text-1 text-xs sm:text-sm font-medium hover:underline transition-all cursor-pointer bg-transparent border-none"
          >
            Sair
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="bg-background-button text-text-button font-bold text-xs sm:text-sm py-1.5 sm:py-2 px-4 sm:px-6 rounded-full flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md"
        >
          <IconUser className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" />
          <span>Entrar</span>
        </Link>
      )}
    </header>
  );
}
