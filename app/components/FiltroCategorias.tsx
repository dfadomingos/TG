"use client"; 

import { useState } from "react";

export function FiltroCategorias({ 
  categoriaAtiva: propCategoria, 
  onCategoriaChange 
}: { 
  categoriaAtiva?: string, 
  onCategoriaChange?: (c: string) => void 
} = {}) {
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

  // estado interno fallback
  const [internalState, setInternalState] = useState("Todos");
  
  const categoriaAtiva = propCategoria !== undefined ? propCategoria : internalState;

  const handleCategoriaClick = (categoria: string) => {
    if (onCategoriaChange) onCategoriaChange(categoria);
    setInternalState(categoria);
  };

  return (
    <div className="flex flex-wrap gap-2 my-2 px-4 sm:px-8">
      {categorias.map((categoria) => {
        // lógica de cor: verificamos se esta categoria é a que está ativa
        const isActive = categoriaAtiva === categoria;

        return (
          <button
            key={categoria}
            onClick={() => handleCategoriaClick(categoria)}
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