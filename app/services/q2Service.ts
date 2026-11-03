/**
 * Q2 Ingressos - Service de Extração de Eventos
 *
 * Abordagem: API pública de cache da Q2 (`cache-control-api.q2ingressos.com.br`)
 * com fallback automático via Puppeteer (headless browser) para a nova interface
 * em Expo / React Native Web (`/search?search=...`).
 *
 * Justificativa:
 * - A Q2 migrou seu portal para Expo / React Native Web (CSR sem tags `<a>`),
 *   consumindo `cache-control-api.q2ingressos.com.br/api/v1/home` na listagem
 *   e `/api/v1/compat/getEventTicketsBySlug` nos detalhes do evento.
 * - Consultar essa API diretamente é muito mais rápido (~2s), estável e retorna
 *   horário exato, lotes/preços estruturados e descrição completa em HTML.
 * - Caso o token público mude ou a API oscile, o Puppeteer intercepta o novo token
 *   ou extrai os cards renderizados via `[data-testid^="card_home_search_result_"]`.
 *
 * Estrutura:
 * ├── Tipos e interfaces
 * ├── Constantes e configuração (incl. VENUES_ADDRESSES)
 * ├── resolveVenueAddress() — resolve endereço completo via lookup
 * ├── parseDataQ2() / parseLocalQ2() / parsePrecoQ2() — parsers
 * ├── normalizeQ2Event() — normaliza dados para formato Prisma
 * ├── inferirCategoria() — inferência de categoria pelo título
 * ├── getQ2EventsByApi() — extração rápida via API de cache da Q2 ★
 * ├── getQ2EventsPuppeteer() — extração principal (API + fallback Puppeteer) ★
 * ├── getQ2EventsPreExtracted() — dados fixos (fallback legado)
 * └── getQ2Events() — alias de extração via API/Cheerio
 */

import * as cheerio from 'cheerio';

// ─── Tipos ──────────────────────────────────────────────────────────

/** Evento bruto extraído da Q2 */
export interface Q2EventRaw {
  titulo: string;
  data: string;
  local_nome: string;   // Nome completo do local (ex: "Ginásio Pedrocão - Franca, SP")
  local_link?: string;  // Link do Google Maps do local
  link: string;
  imagemUrl?: string;
  preco?: string;
  descricao?: string;
}

/** Dados de endereço extraídos do Google Maps */
export interface VenueAddress {
  rua: string;
  numero: string;
  bairro: string | null;
  cidade: string;
  estado: string;
  cep: string;
  endereco_completo: string;
}

/** Evento normalizado para integração com Prisma */
export interface Q2EventNormalized {
  titulo: string;
  descricao: string;
  data_horario: Date | null;
  endereco: string;      // Rua/Avenida do local
  numero: string | null; // Número do endereço
  bairro: string | null;        // Bairro
  complemento: string | null;
  cidade: string;
  estado: string;
  cep: string | null;    // CEP
  local_link?: string;   // Link do Google Maps
  preco: number;
  link_compra: string;
  imagem: string;
  categoria_sugerida: string;
  fonte: 'q2ingressos';
}

interface Q2HomeApiItem {
  Id: number;
  Name: string;
  StartDate: string;
  EndDate?: string | null;
  ImageEvent?: string | null;
  ImageHomeEvent?: string | null;
  Place?: string | null;
  City?: string | null;
  State?: string | null;
  Slug: string;
  Description?: string | null;
  IsMasterEvent?: boolean;
  IsSessionEvent?: boolean;
}

interface Q2TicketItem {
  id?: number;
  name?: string;
  value?: number;
  available?: number | null;
}

interface Q2SectionItem {
  id?: number;
  name?: string;
  tickets?: Q2TicketItem[];
}

interface Q2CompatDetailResponse {
  status?: string;
  id?: number;
  slug?: string;
  name?: string;
  date?: string;
  time?: string | null;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  eventImage?: string | null;
  imageHomeEvent?: string | null;
  websiteInformations?: string | null;
  allowFreeTickets?: boolean;
  isSessionEventChild?: boolean;
  sessionEventMasterSlug?: string | null;
  sections?: Q2SectionItem[];
}

// ─── Constantes ─────────────────────────────────────────────────────

const BASE_URL = 'https://q2ingressos.com.br';
const SEARCH_URL = `${BASE_URL}/search`;
const CDN_URL = 'https://cdn.q2ingressos.com.br';
const CACHE_API_URL = 'https://cache-control-api.q2ingressos.com.br/api/v1';
const DEFAULT_COMPAT_TOKEN = '56f869f6c051130a44cffbbc1c304525';
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/**
 * Endereços dos locais de eventos em Franca, extraídos do Google Maps.
 * Chave: nome normalizado do venue (lowercase, sem acentos).
 */
const VENUES_ADDRESSES: Record<string, VenueAddress> = {
  'ginasio pedrocao': {
    rua: 'Rua dos Pracinhas',
    numero: '510',
    bairro: 'Residencial Paraiso',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14403-160',
    endereco_completo: 'R. dos Pracinhas, 510 - Res. Paraiso, Franca - SP, 14403-160',
  },
  'ginasio poliesportivo pedro morilla fuentes': {
    rua: 'Rua dos Pracinhas',
    numero: '510',
    bairro: 'Residencial Paraiso',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14403-160',
    endereco_completo: 'R. dos Pracinhas, 510 - Res. Paraiso, Franca - SP, 14403-160',
  },
  'pedrocao': {
    rua: 'Rua dos Pracinhas',
    numero: '510',
    bairro: 'Residencial Paraiso',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14403-160',
    endereco_completo: 'R. dos Pracinhas, 510 - Res. Paraiso, Franca - SP, 14403-160',
  },
  'clube aabb': {
    rua: 'Avenida São Vicente',
    numero: '3501',
    bairro: 'Jardim Noemia',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14403-720',
    endereco_completo: 'Av. São Vicente, 3501 - Jardim Noemia, Franca - SP, 14403-720',
  },
  'morada du capiau': {
    rua: 'Avenida Rio Amazonas',
    numero: '578',
    bairro: 'Residencial Oswaldo Maciel',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14406-010',
    endereco_completo: 'Av. Rio Amazonas, 578 - Res. Oswaldo Maciel, Franca - SP, 14406-010',
  },
  'villa eventos': {
    rua: 'Rodovia Engenheiro Ronan Rocha',
    numero: '19304',
    bairro: 'Rural',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14404-080',
    endereco_completo: 'Rod. Eng. Ronan Rocha, 19304 - Rural, Franca - SP, 14404-080',
  },
  'escola pestalozzi': {
    rua: 'Rua José Marquês García',
    numero: '197',
    bairro: 'Cidade Nova',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14401-080',
    endereco_completo: 'R. José Marquês García, 197 - Cidade Nova, Franca - SP, 14401-080',
  },
  'escola pestalozzi (unidade i)': {
    rua: 'Rua José Marquês García',
    numero: '197',
    bairro: 'Cidade Nova',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14401-080',
    endereco_completo: 'R. José Marquês García, 197 - Cidade Nova, Franca - SP, 14401-080',
  },
  'clube dos servidores': {
    rua: 'Avenida São Vicente',
    numero: '4000',
    bairro: 'Jardim Noemia',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14403-720',
    endereco_completo: 'Av. São Vicente, 4000 - Jardim Noemia, Franca - SP, 14403-720',
  },
  'cedro espaco de eventos': {
    rua: 'Avenida Presidente Vargas',
    numero: '3630',
    bairro: 'Recanto do Itambé',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14402-000',
    endereco_completo: 'Av. Presidente Vargas, 3630 - Recanto do Itambé, Franca - SP',
  },
  'castelinho': {
    rua: 'Avenida Miguel Sábio de Mello',
    numero: '351',
    bairro: 'Vila Santa Rita',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14403-068',
    endereco_completo: 'Av. Miguel Sábio de Mello, 351 - Vila Santa Rita, Franca - SP, 14403-068',
  },
  'aec castelinho': {
    rua: 'Avenida Miguel Sábio de Mello',
    numero: '351',
    bairro: 'Vila Santa Rita',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14403-068',
    endereco_completo: 'Av. Miguel Sábio de Mello, 351 - Vila Santa Rita, Franca - SP, 14403-068',
  },
};

function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Converte caminhos de imagem internos da Q2 (`/Content/images/...` ou `admin.quero2ingressos.com.br`)
 * para a URL pública válida da CDN Thumbor (`cdn.q2ingressos.com.br`).
 */
export function buildQ2CdnImageUrl(rawUrl?: string | null): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.includes('/default.jpg') || trimmed.includes('/default.png')) {
    return '';
  }
  if (trimmed.startsWith(`${CDN_URL}/`)) {
    return trimmed;
  }
  const contentIdx = trimmed.indexOf('/Content/');
  if (contentIdx !== -1) {
    const contentPath = trimmed.substring(contentIdx);
    return `${CDN_URL}/fit-in/768x441/filters:format(webp):quality(95)/img${contentPath}`;
  }
  if (!trimmed.startsWith('http')) {
    return `${CDN_URL}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
  }
  return trimmed;
}

/**
 * Resolve o endereço completo de um venue pelo nome.
 * Busca no lookup table VENUES_ADDRESSES.
 */
export function resolveVenueAddress(venueName: string): VenueAddress | null {
  const normalized = normalizeText(venueName);

  // Evita falsos positivos com strings vazias ou "." (ex: key.includes(""))
  if (!normalized || normalized.length < 3) {
    return null;
  }

  // Busca exata
  if (VENUES_ADDRESSES[normalized]) {
    return VENUES_ADDRESSES[normalized];
  }

  // Busca parcial (venue name contém a chave)
  for (const [key, addr] of Object.entries(VENUES_ADDRESSES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return addr;
    }
  }

  return null;
}

/** Meses em PT-BR para parse de data */
const MESES_PT: Record<string, number> = {
  JAN: 0, FEV: 1, MAR: 2, ABR: 3, MAI: 4, JUN: 5,
  JUL: 6, AGO: 7, SET: 8, OUT: 9, NOV: 10, DEZ: 11,
};

// ─── Fetch com retry ────────────────────────────────────────────────

async function fetchWithRetry(url: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.text();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error('fetchWithRetry: todas as tentativas falharam');
}

// ─── Parse de data PT-BR / ISO ──────────────────────────────────────

/**
 * Converte string de data no formato Q2 (ISO da API ou PT-BR do DOM) para Date.
 * Formatos suportados:
 *   - "2026-11-20T20:00:00"
 *   - "SÁB, 25 de ABR."
 *   - "SEX, 08 de MAI. - ABERTURA 19:30"
 *   - "SEX 20 NOVEMBRO Abertura 20:00h"
 */
export function parseDataQ2(dataStr: string): Date | null {
  try {
    if (!dataStr) return null;

    // 1. Formato ISO vindo da API da Q2: "YYYY-MM-DD" ou "YYYY-MM-DDTHH:mm:ss"
    const isoMatch = dataStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{1,2}):(\d{2}))?/);
    if (isoMatch) {
      const ano = parseInt(isoMatch[1], 10);
      const mesIdx = parseInt(isoMatch[2], 10) - 1;
      const dia = parseInt(isoMatch[3], 10);
      const hora = isoMatch[4] ? parseInt(isoMatch[4], 10) : 0;
      const minuto = isoMatch[5] ? parseInt(isoMatch[5], 10) : 0;
      return new Date(ano, mesIdx, dia, hora, minuto);
    }

    // 2. Formato PT-BR ("DIA_SEMANA, DD de MES" ou "DD MES")
    const cleaned = dataStr.replace(/\./g, '').trim().toUpperCase();
    const match = cleaned.match(/(\d{1,2})\s+(?:DE\s+)?([A-ZÇ]{3,})/);
    if (!match) return null;

    const dia = parseInt(match[1], 10);
    const mesAbrev = match[2].substring(0, 3);
    const mesIdx = MESES_PT[mesAbrev];

    if (mesIdx === undefined || isNaN(dia)) return null;

    // Extrair horário se disponível
    let hora = 0;
    let minuto = 0;
    const timeMatch = cleaned.match(/(\d{1,2})[:H](\d{2})/);
    if (timeMatch) {
      hora = parseInt(timeMatch[1], 10);
      minuto = parseInt(timeMatch[2], 10);
    }

    // Assume o ano corrente; se a data já passou (tolerância de 1 semana), assume próximo ano
    const agora = new Date();
    let ano = agora.getFullYear();
    const dataCandidata = new Date(ano, mesIdx, dia, hora, minuto);

    if (dataCandidata.getTime() < agora.getTime() - (7 * 24 * 60 * 60 * 1000)) {
      ano++;
    }

    return new Date(ano, mesIdx, dia, hora, minuto);
  } catch {
    return null;
  }
}

// ─── Parse de local ─────────────────────────────────────────────────

/**
 * Extrai nome do local, cidade e estado do formato da Q2.
 * Formatos suportados:
 *   - "Ginásio Pedrocão - Franca, SP"  → endereco: "Ginásio Pedrocão", cidade: "Franca", estado: "SP"
 *   - "Villa Eventos - Franca, SP"     → endereco: "Villa Eventos", cidade: "Franca", estado: "SP"
 *   - "Franca/SP"                      → endereco: "", cidade: "Franca", estado: "SP"
 */
export function parseLocalQ2(localStr: string): {
  endereco: string;
  cidade: string;
  estado: string;
} {
  // Formato: "NomeLocal - Cidade, UF"
  const matchDash = localStr.match(/^(.+?)\s*-\s*(.+?),\s*(\w{2})$/);
  if (matchDash) {
    return {
      endereco: matchDash[1].trim(),
      cidade: matchDash[2].trim(),
      estado: matchDash[3].trim(),
    };
  }

  // Formato: "Cidade/UF"
  const parts = localStr.split('/');
  if (parts.length === 2) {
    return {
      endereco: '',
      cidade: parts[0].trim(),
      estado: parts[1].trim(),
    };
  }

  return {
    endereco: localStr,
    cidade: 'Franca',
    estado: 'SP',
  };
}

// ─── Parse de preço ─────────────────────────────────────────────────

/**
 * Extrai valor numérico de string de preço.
 * Exemplo: "a partir de R$ 30.00" → 30.0
 */
export function parsePrecoQ2(precoStr?: string): number {
  if (precoStr === undefined || precoStr === null || precoStr.trim() === '') return -1;

  const precoStrLimpo = precoStr.trim().toLowerCase();
  if (precoStrLimpo.includes('gratuito') || precoStrLimpo.includes('grátis') || precoStrLimpo.includes('gratis') || precoStrLimpo.includes('free')) {
    return 0;
  }

  const match = precoStr.match(/R\$\s*([\d.,]+)/);
  if (!match) return -1;
  return parseFloat(match[1].replace(',', '.')) || -1;
}

// ─── Normalização ───────────────────────────────────────────────────

/**
 * Normaliza um evento bruto da Q2 para formato compatível com o schema Prisma.
 * Aplica parse de data, local e preço.
 */
export function normalizeQ2Event(raw: Q2EventRaw): Q2EventNormalized {
  const { endereco: venueName, cidade: parsedCidade, estado: parsedEstado } = parseLocalQ2(raw.local_nome);
  const data_horario = parseDataQ2(raw.data);
  const preco = parsePrecoQ2(raw.preco);

  // Resolve endereço completo via Google Maps lookup
  const cleanVenueName = venueName === '.' ? '' : venueName;
  const venueAddr = resolveVenueAddress(cleanVenueName);

  // Garante que a imagem tem URL válida na CDN da Q2
  const imagem = buildQ2CdnImageUrl(raw.imagemUrl);

  // Garante que o link tem URL completa
  let link = raw.link;
  if (link && !link.startsWith('http')) {
    link = `${BASE_URL}${link.startsWith('/') ? '' : '/'}${link}`;
  }

  return {
    titulo: raw.titulo,
    descricao: raw.descricao || raw.titulo,
    data_horario,
    endereco: venueAddr?.rua || cleanVenueName || parsedCidade,
    numero: venueAddr?.numero || null,
    bairro: venueAddr?.bairro || null,
    complemento: cleanVenueName ? `(${cleanVenueName})` : null,
    cidade: venueAddr?.cidade || parsedCidade,
    estado: venueAddr?.estado || parsedEstado,
    cep: venueAddr?.cep || null,
    local_link: raw.local_link,
    preco,
    link_compra: link,
    imagem,
    categoria_sugerida: inferirCategoria(raw.titulo),
    fonte: 'q2ingressos',
  };
}

// ─── Inferência de categoria ────────────────────────────────────────

/**
 * Tenta inferir a categoria do evento pelo título.
 * Mapeamento para o enum CategoriaEvento do Prisma.
 */
function inferirCategoria(titulo: string): string {
  const t = titulo.toLowerCase();

  // Show / Festas
  if (
    t.includes('show') || t.includes('rock') || t.includes('sertanejo') ||
    t.includes('pagode') || t.includes('baile') || t.includes('festa') ||
    t.includes('cover') || t.includes('tributo') || t.includes('ao vivo') ||
    t.includes('tour') || t.includes('sambatiz') || t.includes('maroto') ||
    t.includes('resenha') || t.includes('baby')
  ) return 'Show';

  // Esporte
  if (
    t.includes('nbb') || t.includes('basquete') || t.includes('futebol') ||
    t.includes('esport') || t.includes('corrida') || t.includes('trilha') ||
    t.includes('playoff') || t.includes('final')
  ) return 'Esporte';

  // Gastronomia
  if (
    t.includes('gastrono') || t.includes('bacon') || t.includes('feijoada') ||
    t.includes('almoço') || t.includes('almoco') || t.includes('jantar') ||
    t.includes('culinár') || t.includes('queima do alho')
  ) return 'Gastronomia';

  // Palestra / Congresso
  if (
    t.includes('congresso') || t.includes('palestra') || t.includes('seminário') ||
    t.includes('conferência') || t.includes('fórum')
  ) return 'Palestra';

  // Workshop
  if (
    t.includes('workshop') || t.includes('curso') || t.includes('oficina') ||
    t.includes('capacitação')
  ) return 'Workshop';

  // Teatro
  if (
    t.includes('teatro') || t.includes('stand-up') || t.includes('standup') ||
    t.includes('comedy') || t.includes('comédia') || t.includes('espetáculo')
  ) return 'Teatro';

  // Exposição
  if (
    t.includes('exposição') || t.includes('exposicao') || t.includes('expo') ||
    t.includes('mostra') || t.includes('galeria')
  ) return 'Exposicao';

  return 'Outros';
}

// ─── Helpers de extração da API da Q2 ───────────────────────────────

/**
 * Extrai descrição limpa (sem rodapé jurídico genérico da Q2), horário de abertura
 * e link do Google Maps a partir do HTML `websiteInformations` retornado pela API.
 */
function parseWebsiteInformations(html?: string | null): {
  descricaoLimpa: string;
  localLink?: string;
  localTexto?: string;
  horarioTexto?: string;
} {
  if (!html) return { descricaoLimpa: '' };

  const $ = cheerio.load(html);
  let localLink: string | undefined;
  let localTexto: string | undefined;

  $('a').each((_i, el) => {
    const href = ($(el).attr('href') || '').trim();
    const text = $(el).text().trim();
    if (
      !localLink &&
      (href.includes('maps') || href.includes('goo.gl') || href.includes('share.google'))
    ) {
      localLink = href;
      if (text && text.length > 2 && !text.startsWith('http')) {
        localTexto = text;
      }
    }
  });

  // Preserva quebras de linha de blocos e <br> antes de extrair texto puro
  $('br').replaceWith('\n');
  $('p, div, li, tr, h1, h2, h3, h4, h5, h6').each((_i, el) => {
    $(el).append('\n');
  });

  let text = $.text()
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();

  // Tenta identificar horário explícito no texto caso o campo `time` venha vazio
  let horarioTexto: string | undefined;
  const horaMatch = text.match(
    /(?:Abertura(?:\s+dos\s+port[õo]es)?|Hor[áa]rio|In[íi]cio)[^\n\d]{0,25}(\d{1,2})[:hH](\d{2})/i
  );
  if (horaMatch) {
    horarioTexto = `${horaMatch[1].padStart(2, '0')}:${horaMatch[2]}`;
  }

  // Remove blocos jurídicos/institucionais padronizados da plataforma Q2 no final
  const boilerplateMarkers = [
    /\n[_\-\s]*\n?\s*Transfer[êe]ncia de ingresso\b/i,
    /\n[_\-\s]*\n?\s*Objetos proibidos\b/i,
    /\n?\s*A Q2 Ingressos n[ãa]o faz parte da organiza[çc][ãa]o do evento/i,
    /\n[_\-\s]*\n?\s*Suporte e d[úu]vidas\b/i,
  ];
  for (const marker of boilerplateMarkers) {
    const idx = text.search(marker);
    if (idx > 60) {
      text = text.substring(0, idx).trim();
    }
  }

  // Remove linhas compostas apenas por underscores/traços separadores excessivos
  text = text
    .replace(/_{4,}/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { descricaoLimpa: text, localLink, localTexto, horarioTexto };
}

/**
 * Calcula o menor preço disponível a partir das seções/lotes retornados pela API.
 */
function extractMinPriceFromSections(
  sections?: Q2SectionItem[],
  allowFreeTickets?: boolean
): string | undefined {
  if (!Array.isArray(sections) || sections.length === 0) return undefined;

  const availablePositivePrices: number[] = [];
  const allPositivePrices: number[] = [];
  let hasZeroTicket = false;

  for (const sec of sections) {
    for (const t of sec.tickets || []) {
      const val = typeof t.value === 'number' ? t.value : Number(t.value);
      if (isNaN(val)) continue;
      if (val === 0) {
        hasZeroTicket = true;
      } else if (val > 0) {
        allPositivePrices.push(val);
        if (t.available === undefined || t.available === null || Number(t.available) > 0) {
          availablePositivePrices.push(val);
        }
      }
    }
  }

  const pool = availablePositivePrices.length > 0 ? availablePositivePrices : allPositivePrices;
  if (pool.length > 0) {
    const min = Math.min(...pool);
    return `a partir de R$ ${min.toFixed(2)}`;
  }

  if (allowFreeTickets && hasZeroTicket) {
    return 'Gratuito';
  }

  return undefined;
}

/**
 * Caso o token público do endpoint `getEventTicketsBySlug` seja rotacionado no futuro,
 * abre o Puppeteer uma única vez para interceptar o token atualizado enviado pelo site.
 */
async function refreshCompatTokenViaPuppeteer(sampleSlug: string): Promise<string | null> {
  try {
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    try {
      const page = await browser.newPage();
      await page.setUserAgent(USER_AGENT);
      let capturedToken: string | null = null;

      page.on('request', (req) => {
        if (req.method() === 'POST' && req.url().includes('getEventTicketsBySlug')) {
          try {
            const parsed = JSON.parse(req.postData() || '{}');
            if (parsed.token) capturedToken = parsed.token;
          } catch {}
        }
      });

      await page.goto(`${BASE_URL}/events/${sampleSlug}`, {
        waitUntil: 'domcontentloaded',
        timeout: 20000,
      });

      for (let i = 0; i < 12 && !capturedToken; i++) {
        await new Promise((r) => setTimeout(r, 500));
      }

      return capturedToken;
    } finally {
      await browser.close();
    }
  } catch {
    return null;
  }
}

async function fetchCompatDetailBySlug(
  slug: string,
  token: string
): Promise<{ status: number; data: Q2CompatDetailResponse | null }> {
  const res = await fetch(`${CACHE_API_URL}/compat/getEventTicketsBySlug`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'Origin': BASE_URL,
      'Referer': `${BASE_URL}/`,
      'User-Agent': USER_AGENT,
    },
    body: JSON.stringify({ eventSlug: slug, token }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    return { status: res.status, data: null };
  }

  const data = (await res.json()) as Q2CompatDetailResponse;
  return { status: res.status, data };
}

/**
 * Extrai eventos diretamente da API de cache pública da Q2 (`cache-control-api.q2ingressos.com.br`).
 */
export async function getQ2EventsByApi(cidade: string = 'Franca'): Promise<Q2EventRaw[]> {
  const cidadeNorm = normalizeText(cidade);
  console.log(`\n🌐 [Q2 API] Consultando eventos em ${CACHE_API_URL}/home ...`);

  const homeRes = await fetch(`${CACHE_API_URL}/home`, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': USER_AGENT,
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!homeRes.ok) {
    throw new Error(`Falha ao consultar ${CACHE_API_URL}/home: HTTP ${homeRes.status}`);
  }

  const homeItems = (await homeRes.json()) as Q2HomeApiItem[];
  if (!Array.isArray(homeItems)) {
    throw new Error('Formato inesperado retornado por /api/v1/home');
  }

  const matchedItems: Q2HomeApiItem[] = [];

  for (const item of homeItems) {
    if (!item?.Slug || !item?.Name) continue;
    const itemCityNorm = normalizeText(item.City || '');
    const isTargetCity = itemCityNorm === cidadeNorm;

    // Expande eventos-mestre (multi-sessão) quando pertencerem à cidade alvo e não forem de teste
    if (item.IsMasterEvent) {
      if (isTargetCity && !item.Name.toLowerCase().includes('teste') && !item.Slug.toLowerCase().includes('teste')) {
        try {
          const masterRes = await fetch(`${CACHE_API_URL}/eventos-mestre/${item.Slug}`, {
            headers: { 'Accept': 'application/json', 'User-Agent': USER_AGENT },
            signal: AbortSignal.timeout(10000),
          });
          if (masterRes.ok) {
            const subEvents = (await masterRes.json()) as Q2HomeApiItem[];
            if (Array.isArray(subEvents)) {
              for (const sub of subEvents) {
                if (sub?.Slug && normalizeText(sub.City || '') === cidadeNorm) {
                  matchedItems.push(sub);
                }
              }
            }
          }
        } catch {
          matchedItems.push(item);
        }
      } else if (isTargetCity) {
        matchedItems.push(item);
      }
      continue;
    }

    if (isTargetCity) {
      matchedItems.push(item);
    }
  }

  // Deduplica por Slug
  const uniqueItems = Array.from(new Map(matchedItems.map((i) => [i.Slug, i])).values());
  console.log(`📋 [Q2 API] ${uniqueItems.length} evento(s) localizado(s) para ${cidade}`);

  let compatToken = DEFAULT_COMPAT_TOKEN;
  let tokenRefreshed = false;
  const eventos: Q2EventRaw[] = [];

  for (let i = 0; i < uniqueItems.length; i++) {
    const item = uniqueItems[i];
    const eventUrl = `${BASE_URL}/events/${item.Slug}`;
    const isTestEvent =
      item.Name.toLowerCase().includes('teste') || item.Slug.toLowerCase().includes('teste');

    // Para eventos de teste, não gasta chamada de detalhe (o sync filtrará logo em seguida)
    if (isTestEvent) {
      eventos.push({
        titulo: item.Name.trim(),
        data: item.StartDate,
        local_nome: `${item.City || cidade}/${item.State || 'SP'}`,
        link: eventUrl,
        imagemUrl: buildQ2CdnImageUrl(item.ImageEvent || item.ImageHomeEvent) || undefined,
        descricao: item.Name.trim(),
      });
      continue;
    }

    console.log(`   📄 [${i + 1}/${uniqueItems.length}] ${item.Slug}`);

    let detail: Q2CompatDetailResponse | null = null;
    try {
      let resp = await fetchCompatDetailBySlug(item.Slug, compatToken);
      if ((resp.status === 400 || resp.status === 401 || resp.status === 403) && !tokenRefreshed) {
        tokenRefreshed = true;
        console.log('   🔄 [Q2 API] Atualizando token público via navegador headless...');
        const newToken = await refreshCompatTokenViaPuppeteer(item.Slug);
        if (newToken) {
          compatToken = newToken;
          resp = await fetchCompatDetailBySlug(item.Slug, compatToken);
        }
      }
      detail = resp.data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`   ⚠️  [Q2 API] Aviso ao buscar detalhes de ${item.Slug}: ${msg}`);
    }

    // Ignora sessões-filhas cujo evento mestre seja de teste
    if (detail?.isSessionEventChild && detail.sessionEventMasterSlug?.toLowerCase().includes('teste')) {
      continue;
    }

    const webInfo = parseWebsiteInformations(detail?.websiteInformations || item.Description);

    // Combina data ("YYYY-MM-DD") + horário ("HH:mm")
    const baseDatePart = (detail?.date || item.StartDate || '').split('T')[0];
    let timePart = '00:00';
    const rawTime = (detail?.time || webInfo.horarioTexto || '').trim();
    const timeMatch = rawTime.match(/(\d{1,2})[:hH](\d{2})/);
    if (timeMatch) {
      timePart = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
    } else if (item.StartDate && item.StartDate.includes('T') && !item.StartDate.endsWith('T00:00:00')) {
      timePart = item.StartDate.split('T')[1].substring(0, 5);
    }
    const isoDateTime = baseDatePart ? `${baseDatePart}T${timePart}:00` : item.StartDate;

    // Monta local no padrão "NomeLocal - Cidade, UF"
    let placeName = (detail?.location || item.Place || '').trim();
    if ((!placeName || placeName === '.') && webInfo.localTexto) {
      placeName = webInfo.localTexto.split(' - ')[0].trim();
    }
    const evCity = (detail?.city || item.City || cidade).trim();
    const evState = (detail?.state || item.State || 'SP').trim();
    const local_nome =
      placeName && placeName !== '.' && normalizeText(placeName) !== normalizeText(evCity)
        ? `${placeName} - ${evCity}, ${evState}`
        : `${evCity}/${evState}`;

    const preco = extractMinPriceFromSections(detail?.sections, detail?.allowFreeTickets);
    const imagemUrl =
      buildQ2CdnImageUrl(
        detail?.eventImage || item.ImageEvent || detail?.imageHomeEvent || item.ImageHomeEvent
      ) || undefined;

    eventos.push({
      titulo: (detail?.name || item.Name).trim(),
      data: isoDateTime,
      local_nome,
      local_link: webInfo.localLink,
      link: eventUrl,
      imagemUrl,
      preco,
      descricao: webInfo.descricaoLimpa || (detail?.name || item.Name).trim(),
    });
  }

  console.log(`✅ [Q2 API] ${eventos.length} evento(s) extraídos com sucesso`);
  return eventos;
}

// ─── Tentativa de extração via Cheerio / API (página individual) ────

/**
 * Tenta extrair dados adicionais de uma página individual de evento.
 * Usa a API pública de detalhes por slug com fallback para HTML estático.
 */
export async function parseEventDetailPage(eventUrl: string): Promise<Partial<Q2EventRaw>> {
  try {
    const slugMatch = eventUrl.match(/\/events\/([^/?#]+)/);
    if (slugMatch) {
      const { data } = await fetchCompatDetailBySlug(slugMatch[1], DEFAULT_COMPAT_TOKEN);
      if (data) {
        const webInfo = parseWebsiteInformations(data.websiteInformations);
        return {
          titulo: data.name,
          descricao: webInfo.descricaoLimpa || data.name,
          preco: extractMinPriceFromSections(data.sections, data.allowFreeTickets),
          imagemUrl: buildQ2CdnImageUrl(data.eventImage || data.imageHomeEvent) || undefined,
          local_link: webInfo.localLink,
        };
      }
    }

    const html = await fetchWithRetry(eventUrl);
    const $ = cheerio.load(html);

    // Tenta extrair dados do __NEXT_DATA__ (legado)
    const nextDataScript = $('script#__NEXT_DATA__').html();
    if (nextDataScript) {
      const data = JSON.parse(nextDataScript);
      const pageProps = data?.props?.pageProps;
      if (pageProps?.event) {
        const ev = pageProps.event;
        return {
          titulo: ev.name || ev.title,
          descricao: ev.description,
          preco: ev.price ? `R$ ${ev.price}` : undefined,
          imagemUrl: ev.bannerUrl || ev.image,
        };
      }
    }

    return {};
  } catch {
    return {};
  }
}

// ─── Função Principal ───────────────────────────────────────────────

/**
 * Busca eventos da Q2 Ingressos para a cidade especificada.
 *
 * @param cidade - Nome da cidade para buscar (default: "Franca")
 * @returns Array de eventos brutos encontrados
 */
export async function getQ2Events(cidade: string = 'Franca'): Promise<Q2EventRaw[]> {
  try {
    return await getQ2EventsByApi(cidade);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ [Q2 Service] Erro ao buscar eventos via API: ${msg}`);
    return [];
  }
}

// ─── Função com dados pré-extraídos (browser) ──────────────────────

/**
 * Retorna eventos pré-extraídos via browser automation.
 * Dados extraídos em 22/04/2026 incluindo detalhes das páginas individuais.
 * Contém: nome do local, link Google Maps, preço e descrição.
 */
export function getQ2EventsPreExtracted(): Q2EventRaw[] {
  return [
    {
      titulo: 'NBB 18 OITAVAS DE FINAL | JOGO 1 | SESI FRANCA X BOTAFOGO',
      data: 'Quarta-feira, 22 de Abril - ABERTURA 19:30',
      local_nome: 'Ginásio Pedrocão - Franca, SP',
      local_link: 'https://maps.app.goo.gl/6hiXXTg9yQiYNqKc9',
      link: 'https://q2ingressos.com.br/events/nbb018-oitavas-de-final-sesi-franca-jogo-1',
      preco: 'a partir de R$ 30.00',
      descricao: 'NBB 18 OITAVAS DE FINAL - SESI FRANCA X BOTAFOGO - JOGO 1',
    },
    {
      titulo: 'RESENHA DO TUTI - TOMA PARTIDO',
      data: 'Sábado, 25 de Abril - ABERTURA 18:30',
      local_nome: 'Clube AABB - Franca, SP',
      local_link: 'https://maps.app.goo.gl/sKcwhj4Gc9YAAFL49',
      link: 'https://q2ingressos.com.br/events/resenha-do-tuti-toma-partido',
      preco: 'a partir de R$ 50.00',
      descricao: 'Atrações: Ramon Ramos, Grupo Misturadin, Chega Pra Sambar, Os Marotos, Tiago Alexandre. Instagram: @resenhadotuti.',
    },
    {
      titulo: '2° BAILE SERTANEJO DO ECC - PARÓQUIA SÃO VICENTE DE PAULO',
      data: 'Sexta-feira, 08 de Maio - ABERTURA 19:30',
      local_nome: 'Morada du Capiau - Franca, SP',
      local_link: 'https://maps.app.goo.gl/uBVRGDCb7khrtYCw5',
      link: 'https://q2ingressos.com.br/events/segundobailesertanejodoecc-paroquiasaovicentedepaulo',
      preco: 'a partir de R$ 15.00',
      descricao: 'Atrações: Pedro Paulo & Paulo Vitor, Luis Henrique & Matheus. Instagram: @paroquiasaovicentefranca.',
    },
    {
      titulo: 'SORRISO MAROTO AO VIVO EM FRANCA',
      data: 'Sexta-feira, 08 de Maio - ABERTURA 21:00',
      local_nome: 'Villa Eventos - Franca, SP',
      local_link: 'https://maps.app.goo.gl/uGwmEqy9QzvJoEgM8',
      link: 'https://q2ingressos.com.br/events/sorriso-maroto-ao-vivo-em-franca',
      preco: 'a partir de R$ 70.00',
      descricao: 'Impossível resistir a esse Sorriso! Franca vai ficar pequena para o fenômeno Sorriso Maroto! Prepare o coração para cantar todos os sucessos no dia 08 de Maio, no Villa Eventos.',
    },
    {
      titulo: 'ALMOÇO ESPECIAL DIA DAS MÃES',
      data: 'Domingo, 10 de Maio - ABERTURA 11:00',
      local_nome: 'Morada du Capiau - Franca, SP',
      local_link: 'https://maps.app.goo.gl/9i48xUnyMeWgjjit9',
      link: 'https://q2ingressos.com.br/events/almoco-especial-dia-das-maes',
      preco: 'a partir de R$ 29.90',
      descricao: 'Almoço especial Dia das Mães na Morada du Capiau. Cardápio variado e música ao vivo com Eurico & Ernane, Pedro Paulo & Paulo Vitor, Danilo & Delmar.',
    },
    {
      titulo: 'FÁTIMA LEÃO 40 ANOS DE CARREIRA NA MORADA DU CAPIAU',
      data: 'Sábado, 16 de Maio - ABERTURA 20:30',
      local_nome: 'Morada du Capiau - Franca, SP',
      local_link: 'https://maps.app.goo.gl/9i48xUnyMeWgjjit9',
      link: 'https://q2ingressos.com.br/events/fatima-leao-40-anos-de-carreira-na-morada-du-capiau',
      preco: 'a partir de R$ 40.00',
      descricao: 'Fátima Leão 40 Anos de Carreira. Show inesquecível na Morada du Capiau.',
    },
    {
      titulo: 'RESENHA DO TUTI 2ª EDIÇÃO',
      data: 'Sábado, 23 de Maio - ABERTURA 20:30',
      local_nome: 'Clube AABB - Franca, SP',
      local_link: 'https://maps.app.goo.gl/sKcwhj4Gc9YAAFL49',
      link: 'https://q2ingressos.com.br/events/resenha-do-tuti-segunda-edicao',
      preco: 'a partir de R$ 30.00',
      descricao: 'RESENHA DO TUTI 2ª EDIÇÃO. Atrações: PC MACABU, Chega Pra Sambar. Local: Clube AABB.',
    },
    {
      titulo: 'FEIJOADA DO PINHEIRO 2026',
      data: 'Sábado, 29 de Agosto - ABERTURA 13:00',
      local_nome: 'Villa Eventos - Franca, SP',
      local_link: 'https://maps.app.goo.gl/uGwmEqy9QzvJoEgM8',
      link: 'https://q2ingressos.com.br/events/feijoada-do-pinheiro-2026-brasilidade',
      preco: 'a partir de R$ 480.00',
      descricao: 'FEIJOADA DO PINHEIRO 2026 - BRASILIDADE. Atrações: Péricles e outros. 100% Open Bar & Food. Local: Villa Eventos.',
    },
    {
      titulo: '3º CONESPIFRAN - CONGRESSO ESPÍRITA DE FRANCA',
      data: 'Sábado, 07 de Novembro - ABERTURA 08:00',
      local_nome: 'Escola Pestalozzi (Unidade I) - Franca, SP',
      local_link: 'https://maps.app.goo.gl/bUUGeMEAmAVqZ8Yz7',
      link: 'https://q2ingressos.com.br/events/terceiro-conespifran-congresso-espirita-de-franca',
      preco: 'a partir de R$ 10.00',
      descricao: '3º CONESPIFRAN - Congresso Espírita de Franca. O despertar da consciência: das paixões ao equilíbrio.',
    },
  ];
}

// ─── Extração Principal (API + Fallback Puppeteer na nova UI) ───────

/**
 * Extrai eventos da Q2 Ingressos priorizando a API pública de cache da Q2
 * e recorrendo ao Puppeteer na nova página `/search?search=...` caso necessário.
 */
export async function getQ2EventsPuppeteer(cidade: string = 'Franca'): Promise<Q2EventRaw[]> {
  // 1. Tenta extração direta pela API pública da Q2 (rápida e sem overhead de browser)
  try {
    const apiEvents = await getQ2EventsByApi(cidade);
    if (apiEvents.length > 0) {
      return apiEvents;
    }
  } catch (apiErr) {
    const msg = apiErr instanceof Error ? apiErr.message : String(apiErr);
    console.warn(`⚠️  [Q2 API] Falhou (${msg}). Iniciando fallback com Puppeteer...`);
  }

  // 2. Fallback via Puppeteer compatível com a nova interface Expo / React Native Web da Q2
  const puppeteer = await import('puppeteer');

  console.log(`\n🚀 [Q2 Puppeteer] Iniciando browser headless...`);
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    await page.setViewport({ width: 1280, height: 800 });

    const searchUrl = `${SEARCH_URL}?search=${encodeURIComponent(cidade)}`;
    console.log(`🔍 [Q2 Puppeteer] Navegando: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Aguarda cards do novo layout (`data-testid="card_home_search_result_*"`) ou links legados
    const cardSelector = '[data-testid^="card_home_search_result_"], a[href*="/events/"]';
    try {
      await page.waitForSelector(cardSelector, { timeout: 15000 });
    } catch {
      console.warn('⚠️  [Q2 Puppeteer] Nenhum card de evento encontrado após 15s.');
      return [];
    }

    const eventLinks: string[] = await page.evaluate((baseUrl) => {
      const urls = new Set<string>();

      document.querySelectorAll('[data-testid^="card_home_search_result_"]').forEach((el) => {
        const testId = el.getAttribute('data-testid') || '';
        const slug = testId.replace(/^card_home_search_result_/, '').trim();
        if (slug) urls.add(`${baseUrl}/events/${slug}`);
      });

      document.querySelectorAll('a[href*="/events/"]').forEach((el) => {
        const href = (el as HTMLAnchorElement).href;
        if (href) urls.add(href);
      });

      return Array.from(urls);
    }, BASE_URL);

    console.log(`📋 [Q2 Puppeteer] ${eventLinks.length} evento(s) encontrados na listagem`);

    if (eventLinks.length === 0) {
      return [];
    }

    const eventos: Q2EventRaw[] = [];

    for (let i = 0; i < eventLinks.length; i++) {
      const eventUrl = eventLinks[i];
      const slug = eventUrl.split('/events/')[1] || eventUrl;
      console.log(`   📄 [${i + 1}/${eventLinks.length}] ${slug}`);

      let capturedDetail: Q2CompatDetailResponse | null = null;
      const responseHandler = async (resp: any) => {
        if (resp.request().method() === 'POST' && resp.url().includes('getEventTicketsBySlug')) {
          try {
            capturedDetail = await resp.json();
          } catch {}
        }
      };

      page.on('response', responseHandler);
      try {
        await page.goto(eventUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
        for (let w = 0; w < 10 && !capturedDetail; w++) {
          await new Promise((r) => setTimeout(r, 400));
        }

        if (capturedDetail) {
          const d = capturedDetail as Q2CompatDetailResponse;
          if (d.isSessionEventChild && d.sessionEventMasterSlug?.toLowerCase().includes('teste')) {
            continue;
          }
          const webInfo = parseWebsiteInformations(d.websiteInformations);
          const baseDatePart = (d.date || '').split('T')[0];
          const rawTime = (d.time || webInfo.horarioTexto || '00:00').trim();
          const tMatch = rawTime.match(/(\d{1,2})[:hH](\d{2})/);
          const hhmm = tMatch ? `${tMatch[1].padStart(2, '0')}:${tMatch[2]}` : '00:00';
          const evCity = (d.city || cidade).trim();
          const evState = (d.state || 'SP').trim();
          const place = (d.location || '').trim();

          eventos.push({
            titulo: (d.name || '').trim(),
            data: baseDatePart ? `${baseDatePart}T${hhmm}:00` : '',
            local_nome:
              place && place !== '.' && normalizeText(place) !== normalizeText(evCity)
                ? `${place} - ${evCity}, ${evState}`
                : `${evCity}/${evState}`,
            local_link: webInfo.localLink,
            link: eventUrl,
            imagemUrl: buildQ2CdnImageUrl(d.eventImage || d.imageHomeEvent) || undefined,
            preco: extractMinPriceFromSections(d.sections, d.allowFreeTickets),
            descricao: webInfo.descricaoLimpa || (d.name || '').trim(),
          });
          continue;
        }

        // Fallback via DOM do novo layout caso a resposta JSON não tenha sido capturada
        await new Promise((r) => setTimeout(r, 1500));
        const eventData = await page.evaluate((targetCity) => {
          const lines = document.body.innerText
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean);

          const titulo =
            document.querySelector('h1')?.textContent?.trim() ||
            lines[0] ||
            '';

          const allText = document.body.innerText;
          let data = '';
          const dataMatch = allText.match(
            /(?:SEG|TER|QUA|QUI|SEX|SÁB|DOM|Segunda|Terça|Quarta|Quinta|Sexta|Sábado|Domingo)(?:-[Ff]eira)?[\s,.-]+(\d{1,2})\s+(?:de\s+)?([A-Za-zçÇ]+)[\s\S]{0,40}?(?:Abertura|Início)?\s*(\d{1,2}[:hH]\d{2})?/i
          );
          if (dataMatch) {
            data = `${dataMatch[1]} de ${dataMatch[2]}${dataMatch[3] ? ' ' + dataMatch[3] : ''}`;
          }

          // Extrai preço apenas após "SELECIONE O INGRESSO" para ignorar "Ingresso verde + R$ 2,00"
          let preco = '';
          const ticketSectionIdx = allText.indexOf('SELECIONE O INGRESSO');
          const priceSource = ticketSectionIdx !== -1 ? allText.substring(ticketSectionIdx) : allText;
          const precoMatch = priceSource.match(/R\$\s*[\d.,]+/i);
          if (precoMatch) preco = `a partir de ${precoMatch[0].trim()}`;

          const cityLineIdx = lines.findIndex((l) => /,?\s*[A-Z]{2}$/.test(l) && l.length < 40);
          let local_nome = `${targetCity}/SP`;
          if (cityLineIdx > 0) {
            local_nome = `${lines[cityLineIdx - 1]} - ${lines[cityLineIdx]}`;
          }

          let imagemUrl = '';
          const banner = Array.from(document.querySelectorAll('img')).find((img) => {
            const src = (img.src || '').toLowerCase();
            if (!src || src.includes('logo') || src.includes('icon') || src.includes('avatar')) return false;
            if (img.width > 0 && img.width < 150) return false;
            return src.includes('cdn.q2ingressos.com.br') || src.includes('/events/');
          });
          if (banner) imagemUrl = banner.src;

          return { titulo, data, local_nome, preco, imagemUrl };
        }, cidade);

        if (eventData.titulo) {
          eventos.push({
            titulo: eventData.titulo,
            data: eventData.data || 'Data não disponível',
            local_nome: eventData.local_nome,
            link: eventUrl,
            imagemUrl: buildQ2CdnImageUrl(eventData.imagemUrl) || undefined,
            preco: eventData.preco || undefined,
            descricao: eventData.titulo,
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`   ⚠️  Erro ao extrair ${eventUrl}: ${msg}`);
      } finally {
        page.off('response', responseHandler);
      }
    }

    console.log(`\n✅ [Q2 Puppeteer] ${eventos.length} evento(s) extraídos com sucesso`);
    return eventos;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ [Q2 Puppeteer] Erro fatal: ${msg}`);
    throw err;
  } finally {
    await browser.close();
  }
}
