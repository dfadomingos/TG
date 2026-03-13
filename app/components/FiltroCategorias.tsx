"use client"; 

import { useState } from "react";

export function FiltroCategorias() {
    //lista exemplo  
  const categorias = [
    "Todos",
    "Shows",
    "Festas",
    "Bar/Pub",
    "Teatro",
    "Workshop",
    "Esportes",
  ];

  // estado: guarda qual categoria está selecionada
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");

  return (
    <div className="flex flex-wrap gap-1 my-3 px-8">
      {categorias.map((categoria) => {
        // lógica de cor: verificamos se esta categoria é a que está ativa
        const isActive = categoriaAtiva === categoria;

        return (
          <button
            key={categoria}
            onClick={() => setCategoriaAtiva(categoria)}
            className={`
              px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 border
              ${
                isActive
                  ? "bg-background-button text-text-button border-background-button shadow-md" 
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300" 
              }
            `}
          >
            {categoria}
          </button>
        );
      })}
    </div>
  );
}