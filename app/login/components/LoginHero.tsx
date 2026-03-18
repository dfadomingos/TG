import React from "react";
import { LoginCard } from "./LoginCard";
import Link from "next/link";
import IconBack from "../../components/IconBack";

export function LoginHero() {
  return (
    <section className="relative bg-[#0D47A1] flex-1 flex flex-col px-4 sm:px-6 md:px-10 lg:px-16 pt-1 sm:pt-2 md:pt-4 pb-6 sm:pb-8 md:pb-10 lg:pb-12 overflow-hidden">
      {/* Botão Voltar */}
      <Link
        href="/"
        className="absolute top-1 sm:top-1.5 md:top-2 left-3 sm:left-4 md:left-6 flex items-center gap-1.5 sm:gap-2 bg-background-1/50 text-text-1 font-bold text-xs sm:text-sm md:text-base rounded-full px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-background-1/70 transition-all z-10"
      >
        <IconBack className="w-4 h-4 sm:w-5 sm:h-5" fill="#FFFFFF" />
        <span>Voltar</span>
      </Link>

      {/* Conteúdo movido para o topo */}
      <div className="flex flex-col items-center justify-start w-full max-w-[1200px] mx-auto gap-4 sm:gap-6 md:gap-8 mt-2 sm:mt-4 md:mt-6 lg:mt-8">
        {/* Textos de boas-vindas */}
        <div className="flex flex-col items-center text-center gap-0.5 sm:gap-1">
          <h1 className="text-text-1 font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl leading-tight tracking-tight">
            Seja bem-vindo a{" "}
            <span className="bg-linear-to-r from-background-button via-[#FFB347] to-background-button bg-clip-text text-transparent drop-shadow-sm filter brightness-110">
              FrancaEventos
            </span>
          </h1>
          <p className="text-text-1/80 font-extralight text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl leading-relaxed">
            Encontre os melhores eventos da cidade
          </p>
        </div>

        {/* Login Card */}
        <LoginCard />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-[#1E3A8A]/30 rounded-full -translate-y-1/2 -translate-x-1/2 blur-[80px] sm:blur-[100px] md:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[200px] sm:w-[300px] md:w-[400px] h-[200px] sm:h-[300px] md:h-[400px] bg-background-button/5 rounded-full translate-y-1/2 translate-x-1/2 blur-[60px] sm:blur-[80px] md:blur-[100px] pointer-events-none" />
    </section>
  );
}
