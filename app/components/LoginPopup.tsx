"use client";

import Link from "next/link";

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginPopup({ isOpen, onClose }: LoginPopupProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-[90%] mx-4 flex flex-col items-center gap-4 animate-in fade-in zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ícone */}
        <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-[#1E293B] text-center">
          Faça login para favoritar
        </h3>
        <p className="text-sm text-gray-500 text-center">
          Você precisa estar logado no site para poder favoritar eventos.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
          <Link 
            href="/login"
            className="flex-1 text-center bg-[#F59E0B] text-[#1E293B] font-bold py-2.5 rounded-full hover:brightness-110 transition-all text-sm"
          >
            Fazer Login
          </Link>
          <button 
            onClick={onClose}
            className="flex-1 text-center bg-gray-100 text-gray-600 font-bold py-2.5 rounded-full hover:bg-gray-200 transition-all text-sm cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
