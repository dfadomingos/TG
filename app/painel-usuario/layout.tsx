"use client";

import { useState } from "react";
import { HeaderUsuario } from "./components/HeaderUsuario";
import { SidebarUsuario } from "./components/SidebarUsuario";

export default function PainelUsuarioLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* O Header fica no topo ocupando a largura total */}
      <HeaderUsuario onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Container flex para a Sidebar e o Conteúdo */}
      <div className="flex flex-1 relative overflow-hidden">
        <SidebarUsuario isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Área principal de conteúdo */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full md:w-[calc(100%-16rem)] overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Footer simples do painel */}
      <footer className="bg-background-1 p-4 text-center text-sm font-medium text-white/50 border-t border-blue-900/50">
        <p>© 2025 FrancaEventos. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
