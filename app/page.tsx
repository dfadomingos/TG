"use client";

import { useState, useRef } from "react";
import { CarrosselDestaques } from "./components/CarrosselDestaques";
import { GradeEventos } from "./components/GradeEventos";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomeHero } from "./components/HomeHero";
import { HomeCTA } from "./components/HomeCTA";
import { BackToTop } from "./components/BackToTop";

export default function Home() {
  const [termoBusca, setTermoBusca] = useState("");
  const eventosRef = useRef<HTMLDivElement>(null);

  const handleSearch = (termo: string) => {
    setTermoBusca(termo);
    // Só rola para a seção quando o usuário digitar algo
    if (termo.trim() && eventosRef.current) {
      eventosRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (    
    <main className="min-h-screen bg-white text-black font-inter selection:bg-blue-100 relative">
      
      <Header />

      {/* Hero Section with Search */}
      <HomeHero onSearch={handleSearch} />

      {/* Destaques do Carrossel */}
      <section className="px-4 sm:px-8 pt-4 pb-0 md:pt-8 md:pb-0 bg-gray-50/50">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-xl md:text-2xl font-extrabold mb-4 md:mb-6 px-4 tracking-tight">Em destaque</h2>
          <CarrosselDestaques />
        </div>
      </section>

      {/* Filtro de Categorias + Grade de Eventos */}
      <section ref={eventosRef} className="px-4 sm:px-8 pt-4 pb-12 md:pt-6 md:pb-20 scroll-mt-4">                
        <div className="max-w-[1400px] mx-auto">
          <GradeEventos termoBusca={termoBusca} />
        </div>
      </section>

      {/* Call to Action - Divulgação */}
      <HomeCTA />

      <Footer />

      {/* Botão Voltar ao Topo */}
      <BackToTop />

    </main>
  );
}