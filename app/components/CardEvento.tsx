"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import IconLocal from "./IconLocal";
import IconHora from "./IconHora";
import IconHeart from "./IconHeart";
import IconHeartFilled from "./IconHeartFilled";
import { LoginPopup } from "./LoginPopup";

//o componente vai receber essas propriedades (props) para ser reutilizável
interface PropsCardEvento {
  id: string;
  titulo: string;
  data: string;
  endereco: string;
  bairro: string;
  imagem: string;
  hora: string;
  preco: string;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export function CardEvento({ id, titulo, data, endereco, bairro, imagem, hora, preco, isFavorite, onToggleFavorite }: PropsCardEvento) {
  const { isLoggedIn } = useAuth();
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const localExibicao = bairro ? `${endereco}, ${bairro}` : endereco;

  const handleFavoriteClick = () => {
    if (!isLoggedIn) {
      setShowLoginPopup(true);
      return;
    }
    if (onToggleFavorite) onToggleFavorite(id);
  };

  return (
    <>
      <div className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col group cursor-pointer relative">

        {/* área da imagem */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={imagem || "https://placehold.co/600x400/f3f4f6/94a3b8?text=Imagem+Indispon%C3%ADvel"}
            alt={titulo}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* badge de data flutuando em cima da imagem */}
          <div className="absolute top-1 left-1 bg-white/80 backdrop-blur-sm text-gray-900 text-xs font-bold px-3 py-3 rounded-lg shadow-sm">
            {data}
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFavoriteClick();
            }}
            className={`absolute top-1 right-1 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-sm hover:scale-110 transition-transform z-10`}
          >
            {isFavorite ? (
              <IconHeartFilled className="text-red-500 fill-red-500 w-[22px] h-[19px]" />
            ) : (
              <IconHeart className="text-gray-500" />
            )}
          </button>

        </div>

        {/* área de informações */}
        <div className="p-3 flex flex-col flex-1">
          <h3 className="text-[1.45rem] font-extrabold text-gray-900 mb-2 line-clamp-2">{titulo}</h3>
          <div className="text-sm text-gray-600 mb-4 flex-1 space-y-1">
            <p className="flex items-center gap-1.5"><IconLocal /> {localExibicao}</p>
            <p className="flex items-center gap-1.5"><IconHora /> {hora}</p>
          </div>
          <Link
            href={`/evento/${id}`}
            className="w-full block text-center bg-background-button text-text-button font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Visualizar Detalhes
          </Link>
        </div>

      </div>

      {/* Popup de login */}
      <LoginPopup isOpen={showLoginPopup} onClose={() => setShowLoginPopup(false)} />
    </>
  );
}