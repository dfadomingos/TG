import Link from "next/link";
import IconHeader from "@/app/components/IconHeader";
import { IconLogout } from "@/app/components/IconLogout";

export function HeaderUsuario({ onMenuClick }: { onMenuClick?: () => void }) {
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

      <button
        className="bg-background-button text-text-button font-bold text-xs sm:text-sm py-1.5 sm:py-2 px-4 sm:px-6 rounded-full flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md"
      >
        <span>Olá, usuário</span>
        <IconLogout className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 rotate-180" />
      </button>
    </header>
  );
}
