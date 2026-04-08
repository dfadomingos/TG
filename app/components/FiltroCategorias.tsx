"use client"; 

import { useState } from "react";
import { CategoriaEvento, CATEGORIA_LABELS } from "../types";

// Gera a lista de categorias com valor do enum (para filtrar) e label (para exibir)
const categorias = [
  { value: "Todos", label: "Todos" },
  ...Object.values(CategoriaEvento).map((c) => ({
    value: c,
    label: CATEGORIA_LABELS[c],
  })),
];

export function FiltroCategorias({ 
  categoriaAtiva: propCategoria, 
  onCategoriaChange 
}: { 
  categoriaAtiva?: string, 
  onCategoriaChange?: (c: string) => void 
} = {}) {

  // estado interno fallback
  const [internalState, setInternalState] = useState("Todos");
  
  const categoriaAtiva = propCategoria !== undefined ? propCategoria : internalState;

  const handleCategoriaClick = (value: string) => {
    if (onCategoriaChange) onCategoriaChange(value);
    setInternalState(value);
  };

  return (
    <div className="flex flex-wrap gap-2 my-2">
      {categorias.map((categoria) => {
        // lógica de cor: verificamos se esta categoria é a que está ativa
        const isActive = categoriaAtiva === categoria.value;

        return (
          <button
            key={categoria.value}
            onClick={() => handleCategoriaClick(categoria.value)}
            className={`
              px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 border
              ${
                isActive
                  ? "bg-background-button text-text-button border-background-button shadow-md" 
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300" 
              }
            `}
          >
            {categoria.label}
          </button>
        );
      })}
    </div>
  );
}