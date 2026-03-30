"use client";

import { useState } from "react";
import { FiltroCategorias } from "@/app/components/FiltroCategorias";
import { CardEvento } from "@/app/components/CardEvento";
import { todosEventos } from "@/app/data/eventosTeste";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/components/Button";
import { formatarData, formatarHora, formatarPreco } from "@/app/utils/formatters";

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

export default function PainelOrganizadorPage() {
  const router = useRouter();
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  // Simular eventos do organizador: vamos pegar os 4 primeiros
  const eventosDoOrganizador = todosEventos.slice(0, 4);

  // Filtrar eventos baseados na categoria
  const eventosExibidos = eventosDoOrganizador.filter(e => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const matchCategoria = categoriaAtiva === "Todos" || true; // Para o mock, todas categorias servem
    return matchCategoria;
  });

  return (
    <div className="flex flex-col h-full w-full">
      {/* Welcome Message */}
      <div className="mb-8 pl-4 sm:pl-8 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-1">
            Olá, Organizador
          </h1>
          <p className="text-gray-500 text-sm md:text-base">
            Bem-vindo ao seu painel de controle
          </p>
        </div>
      </div>

      {/* Meus Eventos Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pl-4 sm:pl-8 pr-4 sm:pr-8">
        <div className="flex items-center gap-3">
          <IconCalendar className="text-background-button w-6 h-6" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Meus Eventos
          </h2>
        </div>
        
        <Button 
          className="w-full sm:w-auto"
          variant="primary"
          onClick={() => router.push('/cadastro-evento')}
        >
          Adicionar Evento
        </Button>
      </div>

      <FiltroCategorias 
        categoriaAtiva={categoriaAtiva} 
        onCategoriaChange={setCategoriaAtiva} 
      />

      {/* Grid de Eventos */}
      <div className="mt-8 px-4 sm:px-8">
        {eventosExibidos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
            {eventosExibidos.map(evento => (
              <div key={evento.id} className="flex flex-col h-full group">
                {/* O card principal */}
                <div className="flex-1 relative">
                  <CardEvento
                    id={evento.id}
                    titulo={evento.titulo}
                    data={formatarData(evento.data_horario)}
                    endereco={evento.endereco}
                    bairro={evento.bairro}
                    imagem={evento.imagem}
                    hora={formatarHora(evento.data_horario)}
                    preco={formatarPreco(evento.preco)}
                  />
                </div>
                
                {/* Botões de Ação do Organizador */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                  <Link 
                    href={`/evento/${evento.id}/editar`}
                    className="flex-1 text-center py-2 px-4 rounded-lg text-sm font-bold border-2 border-background-button text-background-button hover:bg-background-button hover:text-white transition-colors"
                  >
                    Editar
                  </Link>
                  <button 
                    className="flex-1 text-center py-2 px-4 rounded-lg text-sm font-bold border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    onClick={() => alert('Tem certeza que deseja remover este evento?')}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">Você não possui eventos castrados nesta categoria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
