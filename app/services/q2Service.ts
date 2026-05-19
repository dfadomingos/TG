/**
 * Q2 Ingressos - Service de Extração de Eventos
 *
 * Abordagem: Puppeteer (headless browser) com fallback para dados pré-extraídos.
 *
 * Justificativa:
 * - A Q2 NÃO possui API pública documentada.
 * - A BFF API (q2ingressos-bff.q2ingressos.com.br/api/) requer headers
 *   de autenticação/CSRF que o frontend envia automaticamente.
 * - O site usa Next.js com Client-Side Rendering (BAILOUT_TO_CLIENT_SIDE_RENDERING),
 *   o que significa que o HTML estático vem vazio — sem dados de eventos.
 * - Portanto, Cheerio sozinho NÃO consegue extrair os eventos da listagem.
 * - A solução definitiva é Puppeteer (headless browser) que executa o JavaScript
 *   e permite ler o DOM renderizado.
 *
 * Estrutura:
 * ├── Tipos e interfaces
 * ├── Constantes e configuração (incl. VENUES_ADDRESSES)
 * ├── resolveVenueAddress() — resolve endereço completo via lookup
 * ├── parseDataQ2() / parseLocalQ2() / parsePrecoQ2() — parsers
 * ├── normalizeQ2Event() — normaliza dados para formato Prisma
 * ├── inferirCategoria() — inferência de categoria pelo título
 * ├── getQ2EventsPuppeteer() — extração real via headless browser ★
 * ├── getQ2EventsPreExtracted() — dados fixos (fallback)
 * └── getQ2Events() — tentativa via Cheerio (limitado por CSR)
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
  bairro: string;
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
  bairro: string;        // Bairro
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

// ─── Constantes ─────────────────────────────────────────────────────

const BASE_URL = 'https://q2ingressos.com.br';
const SEARCH_URL = `${BASE_URL}/resultados`;
const CDN_URL = 'https://cdn.q2ingressos.com.br';
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
};

/**
 * Resolve o endereço completo de um venue pelo nome.
 * Busca no lookup table VENUES_ADDRESSES.
 */
export function resolveVenueAddress(venueName: string): VenueAddress | null {
  const normalized = venueName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .trim();

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

// ─── Parse de data PT-BR ────────────────────────────────────────────

/**
 * Converte string de data no formato Q2 para Date.
 * Formatos suportados:
 *   - "SÁB, 25 de ABR."
 *   - "SEX, 08 de MAI."
 *   - "DOM, 10 de MAI."
 *   - "QUA, 22 de ABR."
 */
export function parseDataQ2(dataStr: string): Date | null {
  try {
    // Remove pontos e espaços extras
    const cleaned = dataStr.replace(/\./g, '').trim().toUpperCase();

    // Formato: "DIA_SEMANA, DD de MES - ABERTURA HH:MM"
    const match = cleaned.match(/(\d{1,2})\s+DE\s+(\w{3})/);
    if (!match) return null;

    const dia = parseInt(match[1], 10);
    const mesAbrev = match[2];
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
  const venueAddr = resolveVenueAddress(venueName);

  // Garante que a imagem tem URL completa
  let imagem = raw.imagemUrl || '';
  if (imagem && !imagem.startsWith('http')) {
    imagem = `${CDN_URL}${imagem}`;
  }

  // Garante que o link tem URL completa
  let link = raw.link;
  if (link && !link.startsWith('http')) {
    link = `${BASE_URL}${link}`;
  }

  return {
    titulo: raw.titulo,
    descricao: raw.descricao || raw.titulo,
    data_horario,
    endereco: venueAddr?.rua || venueName || parsedCidade,
    numero: venueAddr?.numero || null,
    bairro: venueAddr?.bairro || 'Centro',
    complemento: venueName ? `(${venueName})` : null,
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
    t.includes('culinár')
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

// ─── Tentativa de extração via Cheerio (página individual) ──────────

/**
 * Tenta extrair dados adicionais de uma página individual de evento.
 * Funciona parcialmente — o HTML pode conter dados no __NEXT_DATA__ ou script inline.
 */
export async function parseEventDetailPage(eventUrl: string): Promise<Partial<Q2EventRaw>> {
  try {
    const html = await fetchWithRetry(eventUrl);
    const $ = cheerio.load(html);

    // Tenta extrair dados do __NEXT_DATA__
    const nextDataScript = $('script#__NEXT_DATA__').html();
    if (nextDataScript) {
      const data = JSON.parse(nextDataScript);
      // Navegar na estrutura do Next.js para encontrar dados do evento
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
 * ⚠️ IMPORTANTE: A Q2 usa Client-Side Rendering (CSR).
 * O HTML estático retornado pelo fetch() NÃO contém os cards de eventos.
 * Esta função tenta extrair dados via Cheerio, mas o resultado será vazio
 * na maioria dos casos. Para extração real, use Puppeteer (veja fallback abaixo).
 *
 * @param cidade - Nome da cidade para buscar (default: "Franca")
 * @returns Array de eventos brutos encontrados
 */
export async function getQ2Events(cidade: string = 'Franca'): Promise<Q2EventRaw[]> {
  const url = `${SEARCH_URL}?s=${encodeURIComponent(cidade)}`;
  console.log(`\n🔍 [Q2 Service] Buscando eventos: ${url}`);

  try {
    const html = await fetchWithRetry(url);
    const $ = cheerio.load(html);
    const eventos: Q2EventRaw[] = [];

    // Verifica se o HTML contém conteúdo renderizado
    const hasContent = $('a[href*="/events/"]').length > 0;

    if (!hasContent) {
      console.warn('⚠️  [Q2 Service] HTML estático sem conteúdo de eventos (CSR detectado).');
      console.warn('   → A Q2 usa Client-Side Rendering. Cheerio não consegue extrair dados.');
      console.warn('   → Use Puppeteer como fallback para extração real.');
      return [];
    }

    // Se por algum motivo o HTML vier renderizado (SSR parcial)
    $('a[href*="/events/"]').each((_i, el) => {
      const $card = $(el);
      const link = $card.attr('href') || '';
      const titulo = $card.find('h3, abbr').first().text().trim();
      const data = $card.find('[class*="date"], [class*="data"]').text().trim();
      const local_nome = $card.find('[class*="local"], [class*="city"]').text().trim();
      const imgEl = $card.find('img');
      const imagemUrl = imgEl.attr('src') || imgEl.attr('data-src') || '';

      if (titulo) {
        eventos.push({
          titulo,
          data: data || 'Data não disponível',
          local_nome: local_nome || `${cidade}/SP`,
          link: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          imagemUrl,
        });
      }
    });

    // Deduplicação por link
    const eventosUnicos = Array.from(
      new Map(eventos.map((e) => [e.link, e])).values()
    );

    console.log(`✅ [Q2 Service] ${eventosUnicos.length} evento(s) extraídos via Cheerio`);
    return eventosUnicos;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ [Q2 Service] Erro ao buscar eventos: ${msg}`);
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

// ─── Extração via Puppeteer (real) ──────────────────────────────────

/**
 * Extrai eventos da Q2 Ingressos via Puppeteer (headless browser).
 * Supera o CSR renderizando o JavaScript do site.
 *
 * Fluxo:
 * 1. Abre browser headless
 * 2. Navega para a página de resultados
 * 3. Extrai links dos cards de eventos
 * 4. Visita cada página de detalhe para extrair dados completos
 * 5. Retorna array de Q2EventRaw
 */
export async function getQ2EventsPuppeteer(cidade: string = 'Franca'): Promise<Q2EventRaw[]> {
  // Import dinâmico para não quebrar se puppeteer não estiver instalado
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

    // 1. Navega para resultados de busca
    const searchUrl = `${BASE_URL}/resultados?s=${encodeURIComponent(cidade)}`;
    console.log(`🔍 [Q2 Puppeteer] Navegando: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // 2. Espera os cards de eventos renderizarem
    try {
      await page.waitForSelector('a[href*="/events/"]', { timeout: 15000 });
    } catch {
      console.warn('⚠️  [Q2 Puppeteer] Nenhum card de evento encontrado após 15s.');
      await browser.close();
      return [];
    }

    // 3. Extrai links dos eventos da listagem
    const eventLinks: string[] = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href*="/events/"]');
      const hrefs = new Set<string>();
      links.forEach((el) => {
        const href = (el as HTMLAnchorElement).href;
        if (href && !hrefs.has(href)) hrefs.add(href);
      });
      return Array.from(hrefs);
    });

    console.log(`📋 [Q2 Puppeteer] ${eventLinks.length} evento(s) encontrados na listagem`);

    if (eventLinks.length === 0) {
      await browser.close();
      return [];
    }

    // 4. Visita cada página de detalhe
    const eventos: Q2EventRaw[] = [];

    for (let i = 0; i < eventLinks.length; i++) {
      const eventUrl = eventLinks[i];
      console.log(`   📄 [${i + 1}/${eventLinks.length}] ${eventUrl.split('/events/')[1] || eventUrl}`);

      try {
        await page.goto(eventUrl, { waitUntil: 'networkidle2', timeout: 20000 });
        await new Promise((r) => setTimeout(r, 2000)); // Espera renderização

        const eventData = await page.evaluate(() => {
          // Título — geralmente o h1 ou elemento principal
          const titulo =
            document.querySelector('h1')?.textContent?.trim() ||
            document.querySelector('h2')?.textContent?.trim() ||
            '';

          // Data — busca perto do ícone de calendário ou texto com padrão de data
          let data = '';
          const allText = document.body.innerText;
          // Padrão: "Dia da semana, DD de Mês" ou similar
          const dataMatch = allText.match(
            /(Segunda|Terça|Quarta|Quinta|Sexta|Sábado|Domingo)(?:-[Ff]eira)?[-,\s]+\d{1,2}\s+de\s+\w+[\s\S]*?(?:ABERTURA|abertura|Início|início)?\s*\d{1,2}[:hH]\d{2}/i
          );
          if (dataMatch) {
            data = dataMatch[0].trim();
          } else {
            // Fallback: busca qualquer texto com formato de data
            const dataFallback = allText.match(
              /(?:SEG|TER|QUA|QUI|SEX|SÁB|DOM|Segunda|Terça|Quarta|Quinta|Sexta|Sábado|Domingo)(?:-[Ff]eira)?[.,\s-]+\d{1,2}\s+de\s+\w+/i
            );
            if (dataFallback) data = dataFallback[0].trim();
          }

          // Local — busca link com "Local:" label ou link do Google Maps próximo
          let local_nome = '';
          let local_link = '';

          // Procura links do Google Maps
          const mapsLinks = document.querySelectorAll('a[href*="maps"], a[href*="goo.gl"]');
          mapsLinks.forEach((el) => {
            const anchor = el as HTMLAnchorElement;
            if (anchor.href.includes('maps') || anchor.href.includes('goo.gl')) {
              local_link = anchor.href;
              // O texto do link geralmente é o nome do local
              const linkText = anchor.textContent?.trim();
              if (linkText && linkText.length > 3) {
                local_nome = linkText;
              }
            }
          });

          // Se não achou nome do local no link, procura na label "Local:"
          if (!local_nome) {
            const localLabel = Array.from(document.querySelectorAll('span, p, div')).find(
              (el) => el.textContent?.trim().startsWith('Local:')
            );
            if (localLabel) {
              local_nome = localLabel.textContent?.replace('Local:', '').trim() || '';
            }
          }

          // Preço — busca "a partir de R$" ou "R$"
          let preco = '';
          const precoMatch = allText.match(/(?:a partir de\s*)?R\$\s*[\d.,]+/i);
          if (precoMatch) preco = precoMatch[0].trim();

          // Descrição — busca o primeiro bloco de texto substancial
          let descricao = '';
          const paragraphs = document.querySelectorAll('p, div[class*="description"], div[class*="descri"]');
          paragraphs.forEach((p) => {
            const text = p.textContent?.trim() || '';
            if (text.length > 30 && text.length > descricao.length && !text.includes('R$')) {
              descricao = text;
            }
          });
          if (!descricao) descricao = titulo;

          // Imagem
          let imagemUrl = '';
          const images = Array.from(document.querySelectorAll('img'));
          
          const banner = images.find(img => {
            const src = (img.src || '').toLowerCase();
            const alt = (img.alt || '').toLowerCase();
            
            // Ignora imagens de logo ou ícones
            if (src.includes('logo') || alt.includes('logo')) return false;
            if (src.includes('icon') || src.includes('avatar')) return false;
            
            // Ignora imagens dentro de cabecalho ou navegacao
            const isInsideHeader = !!img.closest('header, nav, [class*="header"], [class*="nav"]');
            if (isInsideHeader) return false;

            // Se as dimensões estiverem disponíveis e a imagem for um ícone pequeno
            if (img.width > 0 && img.width < 150) return false;

            // Se for carregada da CDN e não for logo, grande chance de ser o banner
            if (src.includes('cdn')) return true;

            // Fallback genérico
            return true;
          });

          if (banner) {
            imagemUrl = banner.src;
          }
          
          return { titulo, data, local_nome, local_link, preco, descricao, imagemUrl };
        });

        if (eventData.titulo) {
          eventos.push({
            titulo: eventData.titulo,
            data: eventData.data || 'Data não disponível',
            local_nome: eventData.local_nome || `${cidade}/SP`,
            local_link: eventData.local_link || undefined,
            link: eventUrl,
            imagemUrl: eventData.imagemUrl || undefined,
            preco: eventData.preco || undefined,
            descricao: eventData.descricao || undefined,
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`   ⚠️  Erro ao extrair ${eventUrl}: ${msg}`);
      }
    }

    console.log(`\n✅ [Q2 Puppeteer] ${eventos.length} evento(s) extraídos com sucesso`);
    await browser.close();
    return eventos;
  } catch (err) {
    await browser.close();
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ [Q2 Puppeteer] Erro fatal: ${msg}`);
    return [];
  }
}
