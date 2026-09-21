import React from "react";
import IconHora from "./IconHora";
import IconLocal from "./IconLocal";
import IconPriceTag from "./IconPriceTag";
import IconHeart from "./IconHeart";
import IconShare from "./IconShare";
import { Button } from "./Button";

interface EventSidebarProps {
  hora: string;
  preco: string;
  link_compra?: string | null;
  endereco?: string | null;
  numero?: string | null;
  bairro?: string | null;
  complemento?: string | null;
  cidade?: string | null;
  estado?: string | null;
}

export function EventSidebar({ 
  hora, 
  preco, 
  link_compra,
  endereco,
  numero,
  bairro,
  complemento,
  cidade,
  estado,
}: EventSidebarProps) {
  const nomeLocal = complemento ? complemento.replace(/^\((.*)\)$/, '$1').trim() : '';

  return (
    <aside className="w-full lg:w-[480px] lg:shrink-0 px-4 md:px-14 lg:px-8 py-8 lg:py-12 bg-transparent">
      <div className="w-full rounded-2xl px-6 md:px-8 py-6 bg-[#D2D1D1]">
        {/* Cabeçalho "Detalhes" */}
        <h3 className="font-bold mb-4 text-2xl lg:text-[25px] text-black">
          Detalhes
        </h3>
        <hr className="border-black mb-6" />

        {/* Local */}
        {endereco && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <IconLocal fill="#000000" />
              <span className="font-bold text-base text-black">Local</span>
            </div>
            <div className="text-base text-black pl-8 space-y-1">
              {nomeLocal && (
                <p className="font-bold text-gray-900">{nomeLocal}</p>
              )}
              <p className="font-normal text-gray-800">
                {[endereco, numero].filter(Boolean).join(', ')}
                {bairro ? ` - ${bairro}` : ''}
              </p>
              <p className="text-gray-600 text-sm">
                {[cidade || 'Franca', estado || 'SP'].filter(Boolean).join(', ')}
              </p>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  [nomeLocal, endereco, numero, bairro, cidade || 'Franca', estado || 'SP']
                    .filter(Boolean)
                    .join(', ')
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-bold transition-colors bg-white/50"
              >
                <IconLocal className="w-3.5 h-3.5" fill="currentColor" />
                <span>VER NO MAPA</span>
              </a>
            </div>
          </div>
        )}

        {/* Horário */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <IconHora />
            <span className="font-bold text-base text-black">Horário</span>
          </div>
          <p className="text-base font-light text-black pl-8">{hora}</p>
        </div>

        {/* Preço */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <IconPriceTag fill="#000000" />
            <span className="font-bold text-base text-black">Preço</span>
          </div>
          <p className="text-base font-light text-black pl-8">{preco}</p>
        </div>

        {/* Botão: Comprar Ingresso */}
        {link_compra ? (
          <a href={link_compra} target="_blank" rel="noopener noreferrer" className="block w-full mb-6">
            <Button variant="accent" fullWidth className="h-[52px] text-lg shadow-md">
              🎟 Comprar Ingresso
            </Button>
          </a>
        ) : (
          <Button variant="accent" fullWidth className="h-[52px] text-lg mb-6 shadow-md opacity-50 cursor-not-allowed">
            🎟 Ingressos Indisponíveis
          </Button>
        )}

        {/* Botões: Favoritar + Compartilhar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
          <Button variant="primary" fullWidth className="h-[44px]">
            <IconHeart />
            <span>Favoritar</span>
          </Button>

          <Button variant="primary" fullWidth className="h-[44px]">
            <IconShare fill="#F8FAFC" />
            <span>Compartilhar</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
