import React from "react";
import IconMegafone from "../../components/IconMegafone";

export function LoginCTA() {
  return (
    <section className="bg-linear-to-b from-[#1E3A8A] to-[#0D47A1] py-3 sm:py-4 md:py-5 px-4 sm:px-6 lg:px-12 overflow-hidden relative border-t border-white/10">
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 md:gap-10 relative z-10">
        <p className="text-white font-bold text-xs sm:text-sm md:text-base lg:text-xl leading-snug text-center sm:text-left">
          Organize eventos em Franca? Simplifique sua divulgação, pare de
          espalhar informações em dezenas de grupos.{" "}
          <span className="hidden md:inline">
            Publique uma vez na Franca Eventos e seja encontrado por quem procura
            cultura e lazer na cidade.
          </span>
        </p>

        <button className="bg-background-button text-text-button font-bold py-2 sm:py-2.5 md:py-3 px-6 sm:px-8 md:px-10 rounded-full flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg whitespace-nowrap shrink-0 text-xs sm:text-sm md:text-base cursor-pointer">
          <IconMegafone />
          <span>Quero Divulgar</span>
        </button>
      </div>
    </section>
  );
}
