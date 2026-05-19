import { CategoriaEvento, CATEGORIA_LABELS } from "../types";
import type { Evento } from "../types";

/**
 * Formata a data de um evento para exibição amigável.
 * Ex: "20 de maio de 2026"
 */
export function formatarData(data: Date): string {
  return data.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Formata o horário de um evento.
 * Ex: "19:00"
 */
export function formatarHora(data: Date): string {
  return data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formata o preço para exibição.
 * Ex: "R$ 50,00" ou "Gratuito"
 */
export function formatarPreco(preco: number): string {
  if (preco < 0) return "Ver ingressos";
  if (preco === 0) return "Gratuito";
  return preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Retorna o label amigável da categoria.
 */
export function labelCategoria(categoria: CategoriaEvento): string {
  return CATEGORIA_LABELS[categoria];
}
