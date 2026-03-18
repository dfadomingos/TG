import { CarrosselDestaques } from "./components/CarrosselDestaques";
import { FiltroCategorias } from "./components/FiltroCategorias";
import { GradeEventos } from "./components/GradeEventos";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomeHero } from "./components/HomeHero";
import { HomeCTA } from "./components/HomeCTA";
import { BackToTop } from "./components/BackToTop";

export default function Home() {
  return (    
    <main className="min-h-screen bg-white text-black font-inter selection:bg-blue-100 relative">
      
      <Header />

      {/* Hero Section with Search */}
      <HomeHero />

      {/* Categorias - Filtro horizontal (sem fixação/stickiness) */}
      <section className="py-2 border-b border-gray-100 bg-white">
        <FiltroCategorias />
      </section>

      {/* Destaques do Carrossel */}
      <section className="px-4 sm:px-8 pt-4 pb-0 md:pt-8 md:pb-0 bg-gray-50/50">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-xl md:text-2xl font-extrabold mb-4 md:mb-6 px-4 tracking-tight">Em destaque</h2>
          <CarrosselDestaques />
        </div>
      </section>

      {/* Grade de Eventos */}
      <section className="px-4 sm:px-8 pt-4 pb-12 md:pt-6 md:pb-20">                
        <div className="max-w-[1400px] mx-auto">
          <GradeEventos />
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