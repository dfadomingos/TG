import { todosEventos } from "../../data/eventosTeste";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { EventHero } from "@/app/components/EventHero";
import { EventSidebar } from "@/app/components/EventSidebar";
import { formatarData, formatarHora, formatarPreco } from "@/app/utils/formatters";

export async function generateMetadata({ params }: any) {
  const resolvedParams = await params;
  const evento = todosEventos.find((e) => String(e.id) === resolvedParams.id);
  
  return {
    title: evento ? `${evento.titulo} | FrancaEventos` : "Evento não encontrado",
    description: evento ? `${evento.endereco}, ${evento.bairro}` : "Detalhes do evento em Franca - SP.",
  };
}

export default async function EventoPage({ params }: any) {
  const resolvedParams = await params;
  const evento = todosEventos.find((e) => String(e.id) === resolvedParams.id);

  if (!evento) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] px-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Ops! 😕</h1>
        <p className="text-gray-500 text-lg mb-6">
          Não conseguimos encontrar o evento selecionado.
        </p>
        <Link 
          href="/" 
          id="btn-voltar-home"
          className="bg-[#0D47A1] text-white px-6 py-2 rounded-full font-bold hover:bg-theme-blue-dark transition-all"
        >
          ← Voltar para a Home
        </Link>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col bg-[#F9FAFB]" 
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <Header />

      <main className="grow">
        {/* Banner Hero Section */}
        <EventHero 
          titulo={evento.titulo}
          imagem={evento.imagem}
          categoria={evento.categoria}
          endereco={evento.endereco}
          bairro={evento.bairro}
          data={formatarData(evento.data_horario)}
        />

        {/* Dynamic Content Grid */}
        <div className="max-w-[1500px] mx-auto flex flex-col lg:flex-row">
          
          {/* Main Content Area */}
          <section className="flex-1 px-4 sm:px-8 md:px-14 py-8 lg:py-12">
            <h2 className="font-bold text-2xl lg:text-[25px] text-black mb-6 leading-[1.3]">
              Sobre o evento
            </h2>
            <div className="relative">
              <p className="text-black text-base lg:text-lg font-medium leading-[1.6] tracking-wide text-justify">
                {evento.descricao}
              </p>
              <p className="mt-4 text-black text-base lg:text-lg font-medium leading-[1.6] tracking-wide text-justify">
                Garanta seu lugar e venha viver esta experiência única que só acontece aqui em Franca.
                Acompanhe o {evento.titulo} e sinta a energia vibrante da nossa cidade.
              </p>
            </div>
          </section>

          {/* Sidebar Area */}
          <EventSidebar 
            hora={formatarHora(evento.data_horario)}
            preco={formatarPreco(evento.preco)}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}