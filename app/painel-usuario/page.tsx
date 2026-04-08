"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { FiltroCategorias } from "@/app/components/FiltroCategorias";
import { CardEvento } from "@/app/components/CardEvento";
import IconHeart from "@/app/components/IconHeart";
import { formatarData, formatarHora, formatarPreco } from "@/app/utils/formatters";

interface EventoFavorito {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  data_horario: string;
  endereco: string;
  bairro: string;
  imagem: string;
  preco: number;
}

interface FavoritoComEvento {
  id: string;
  eventoId: string;
  evento: EventoFavorito;
}

export default function PainelUsuarioPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [favoritos, setFavoritos] = useState<FavoritoComEvento[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar dados do painel
  const fetchDashboard = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/usuarios/dashboard/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setFavoritos(data.favoritos || []);
      }
    } catch (error) {
      console.error("Erro ao carregar painel:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    fetchDashboard();
  }, [isLoggedIn, router, fetchDashboard]);

  // Filtrar por categoria
  const eventosFiltrados = favoritos.filter(fav => {
    if (categoriaAtiva === "Todos") return true;
    return fav.evento.categoria === categoriaAtiva;
  });

  // Desfavoritar
  const handleDesfavoritar = async (eventoId: string) => {
    if (!user) return;

    // Atualização otimista: remove da lista
    setFavoritos(prev => prev.filter(f => f.eventoId !== eventoId));

    try {
      const res = await fetch("/api/favoritos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: user.id, eventoId }),
      });

      if (!res.ok) {
        fetchDashboard();
      }
    } catch {
      fetchDashboard();
    }
  };

  const primeiroNome = user?.nome?.split(" ")[0] || "Usuário";

  return (
    <div className="flex flex-col h-full w-full">
      {/* Welcome Message */}
      <div className="mb-8 pl-4 sm:pl-8">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-1">
          Olá, {primeiroNome}
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

      <div className="px-4 sm:px-8">
        <FiltroCategorias 
          categoriaAtiva={categoriaAtiva} 
          onCategoriaChange={setCategoriaAtiva} 
        />
      </div>

      {/* Grid de Eventos */}
      <div className="mt-8 px-4 sm:px-8">
        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-gray-500">Carregando seus favoritos...</p>
          </div>
        ) : eventosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventosFiltrados.map(fav => (
              <CardEvento
                key={fav.id}
                id={fav.evento.id}
                titulo={fav.evento.titulo}
                data={formatarData(new Date(fav.evento.data_horario))}
                endereco={fav.evento.endereco}
                bairro={fav.evento.bairro}
                imagem={fav.evento.imagem}
                hora={formatarHora(new Date(fav.evento.data_horario))}
                preco={formatarPreco(fav.evento.preco)}
                isFavorite={true}
                onToggleFavorite={handleDesfavoritar}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">Você não possui eventos favoritados{categoriaAtiva !== "Todos" ? " nesta categoria" : ""}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
