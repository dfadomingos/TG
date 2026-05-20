"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { CardEvento } from "./CardEvento";
import { FiltroCategorias } from "./FiltroCategorias";
import { formatarData, formatarHora, formatarPreco } from "../utils/formatters";

interface GradeEventosProps {
  termoBusca?: string;
}

interface EventoAPI {
  id: string;
  titulo: string;
  categoria: string;
  data_horario: string;
  endereco: string;
  bairro: string;
  imagem: string;
  preco: number;
}

export function GradeEventos({ termoBusca = '' }: GradeEventosProps) {
  const { user, isLoggedIn } = useAuth();
  const [eventos, setEventos] = useState<EventoAPI[]>([]);
  const [favoritosIds, setFavoritosIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");

  // Buscar eventos reais do banco
  useEffect(() => {
    async function fetchEventos() {
      try {
        const res = await fetch("/api/eventos");
        if (res.ok) {
          const data = await res.json();
          setEventos(data);
        }
      } catch (error) {
        console.error("Erro ao buscar eventos:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEventos();
  }, []);

  // Buscar favoritos do usuário logado
  const fetchFavoritos = useCallback(async () => {
    if (!isLoggedIn || !user) return;
    try {
      const res = await fetch(`/api/favoritos?usuarioId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setFavoritosIds(new Set(data.eventoIds));
      }
    } catch (error) {
      console.error("Erro ao buscar favoritos:", error);
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    fetchFavoritos();
  }, [fetchFavoritos]);

  const toggleFavorite = async (eventoId: string) => {
    if (!user) return;

    // Atualização otimista
    setFavoritosIds(prev => {
      const next = new Set(prev);
      if (next.has(eventoId)) {
        next.delete(eventoId);
      } else {
        next.add(eventoId);
      }
      return next;
    });

    try {
      const res = await fetch("/api/favoritos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: user.id, eventoId }),
      });

      if (!res.ok) {
        // Se falhou, reverter
        fetchFavoritos();
      }
    } catch {
      // Reverter em caso de erro de rede
      fetchFavoritos();
    }
  };

  // Filtrar por categoria e termo de busca
  const eventosFiltrados = eventos.filter(evento => {
    // Filtro de categoria
    const passaCategoria = categoriaAtiva === "Todos" || evento.categoria === categoriaAtiva;
    
    // Filtro de busca (nome, endereço ou bairro)
    const termo = termoBusca.toLowerCase().trim();
    const passaBusca = !termo || 
      evento.titulo.toLowerCase().includes(termo) ||
      evento.endereco.toLowerCase().includes(termo) ||
      (evento.bairro?.toLowerCase() || "").includes(termo);
    
    return passaCategoria && passaBusca;
  });

  if (isLoading) {
    return (
      <section className="w-full">
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando eventos...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      {/* Filtro de Categorias */}
      <div className="mb-6">
        <FiltroCategorias 
          categoriaAtiva={categoriaAtiva} 
          onCategoriaChange={setCategoriaAtiva} 
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-6 sm:mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-black">
          Próximos Eventos
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm font-medium">
          Encontramos <span className="text-black font-bold">{eventosFiltrados.length}</span> eventos{categoriaAtiva !== "Todos" ? ` em ${categoriaAtiva}` : " na cidade"}
        </p>    
      </div>     
      {eventosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {eventosFiltrados.map((evento) => (
            <CardEvento 
              key={evento.id}
              id={evento.id}
              titulo={evento.titulo}
              data={formatarData(new Date(evento.data_horario))}
              endereco={evento.endereco}
              bairro={evento.bairro}
              imagem={evento.imagem}
              hora={formatarHora(new Date(evento.data_horario))}
              preco={formatarPreco(evento.preco)}
              isFavorite={favoritosIds.has(evento.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">Nenhum evento encontrado{categoriaAtiva !== "Todos" ? " nesta categoria" : ""}.</p>
        </div>
      )}
    </section>
  );
}