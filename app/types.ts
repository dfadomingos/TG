// ── Enums espelhados do Prisma Schema ──

export enum CategoriaEvento {
  Show = "Show",
  Gastronomia = "Gastronomia",
  Esporte = "Esporte",
  Teatro = "Teatro",
  Palestra = "Palestra",
  Workshop = "Workshop",
  Exposicao = "Exposicao",
  Outros = "Outros",
}

export enum EventStatus {
  Cancelado = "Cancelado",
  Rascunho = "Rascunho",
  Publicado = "Publicado",
  Finalizado = "Finalizado",
}

// ── Interfaces ──

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  celular: string;
  senha: string;
  aceitou_termos: boolean;
  receber_novidades: boolean;
  createdAt: Date;
  updatedAt: Date;
  favoritos: Favorito[];
}

export interface Organizador {
  id: string;
  nome: string;
  email: string;
  celular: string;
  senha: string;
  nome_produtora: string;
  cnpj: string;
  link_social?: string;
  aceitou_termos: boolean;
  createdAt: Date;
  updatedAt: Date;
  eventos_criados: Evento[];
}

export interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaEvento;
  data_horario: Date;
  status: EventStatus;
  destaque: boolean;
  views: number;
  // endereço
  endereco: string;
  numero?: string;
  bairro: string;
  complemento?: string;
  cidade: string;
  estado: string;
  cep?: string;
  // ingressos
  preco: number;
  link_compra?: string;
  imagem: string;
  // relacionamentos
  organizerId: string;
  organizer?: Organizador;
  favoritedBy: Favorito[];
  // timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface Favorito {
  id: string;
  usuarioId: string;
  eventoId: string;
  createdAt: Date;
  usuario?: Usuario;
  evento?: Evento;
}

// ── Labels amigáveis para exibição de categorias ──

export const CATEGORIA_LABELS: Record<CategoriaEvento, string> = {
  [CategoriaEvento.Show]: "Show",
  [CategoriaEvento.Gastronomia]: "Gastronomia",
  [CategoriaEvento.Esporte]: "Esporte",
  [CategoriaEvento.Teatro]: "Teatro",
  [CategoriaEvento.Palestra]: "Palestra",
  [CategoriaEvento.Workshop]: "Workshop",
  [CategoriaEvento.Exposicao]: "Exposição",
  [CategoriaEvento.Outros]: "Outros",
};
