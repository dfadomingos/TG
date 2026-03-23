"use client";

import { useState } from "react";
import { FiltroCategorias } from "@/app/components/FiltroCategorias";
import { CardEvento } from "@/app/components/CardEvento";
import { todosEventos } from "@/app/data/eventosTeste";
import IconHeart from "@/app/components/IconHeart";

export default function PainelUsuarioPage() {
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  // Simular eventos favoritados: vamos pegar os 4 primeiros
  const [favoritosIds, setFavoritosIds] = useState<Set<number | string>>(
    new Set(todosEventos.slice(0, 4).map(e => e.id))
  );

  // Filtrar eventos baseados no Set de favoritos e na categoria
  const eventosExibidos = todosEventos.filter(e => {
    const isFav = favoritosIds.has(e.id);
    const mathCategoria = categoriaAtiva === "Todos" || true; // Para o mock, todas categorias servem
    return isFav && mathCategoria;
  });

  const toggleFavorite = (id: number | string) => {
    setFavoritosIds(prev => {
      const newMap = new Set(prev);
      if (newMap.has(id)) {
        newMap.delete(id);
      } else {
        newMap.add(id);
      }
      return newMap;
    });
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Welcome Message */}
      <div className="mb-8 pl-4 sm:pl-8">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-1">
          Olá, Usuário
        </h1>
        <p className="text-gray-500 text-sm md:text-base">
          Bem-vindo ao seu painel de controle
        </p>
      </div>

      {/* Meus Favoritos Section */}
      <div className="flex items-center gap-3 mb-4 pl-4 sm:pl-8">
        <IconHeart className="text-red-500 fill-red-500 w-6 h-6" />
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
          Meus Favoritos
        </h2>
      </div>

      <FiltroCategorias 
        categoriaAtiva={categoriaAtiva} 
        onCategoriaChange={setCategoriaAtiva} 
      />

      {/* Grid de Eventos */}
      <div className="mt-8 px-4 sm:px-8">
        {eventosExibidos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventosExibidos.map(evento => (
              <CardEvento
                key={evento.id}
                id={evento.id}
                titulo={evento.titulo}
                data={evento.data}
                local={evento.local}
                imagem={evento.imagem}
                hora={evento.hora}
                preco={evento.preco}
                isFavorite={favoritosIds.has(evento.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">Você não possui eventos favoritados nesta categoria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
