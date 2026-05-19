/**
 * DuoTicket - Service de Extração de Eventos
 *
 * Abordagem: Cheerio (HTML parsing direto) — sem necessidade de Puppeteer.
 *
 * Justificativa:
 * - O DuoTicket usa Server-Side Rendering (SSR) com PHP + jQuery + Bootstrap.
 * - Diferente da Q2 e Sympla (que são SPAs com CSR), o HTML retornado pelo
 *   fetch() já contém todos os cards de eventos renderizados.
 * - Isso permite usar Cheerio diretamente, resultando em extração mais rápida,
 *   leve e confiável (sem dependência de Chrome headless).
 *
 * Estrutura:
 * ├── Tipos e interfaces
 * ├── Constantes e configuração (incl. VENUES_ADDRESSES)
 * ├── resolveVenueAddress() — resolve endereço completo via lookup
 * ├── parseDataDuoTicket() — parser de data DD/MM/YYYY
 * ├── inferirCategoria() — inferência de categoria pelo título
 * ├── getDuoTicketEvents() — extração via Cheerio (homepage + pesquisa) ★
 * ├── getDuoTicketEventDetail() — dados extras da página individual
 * └── normalizeDuoTicketEvent() — normaliza dados para formato Prisma
 */

import * as cheerio from 'cheerio';

// ─── Tipos ──────────────────────────────────────────────────────────

/** Evento bruto extraído do DuoTicket */
export interface DuoTicketEventRaw {
  titulo: string;
  dataStr: string;        // Formato: "DD/MM/YYYY"
  local_nome: string;     // Nome do local (ex: "Varanda Leblon")
  cidade: string;         // Cidade (ex: "Franca")
  estado: string;         // UF (ex: "SP")
  link: string;
  imagemUrl: string;
  descricao?: string;
}

/** Evento normalizado para integração com Prisma */
export interface DuoTicketEventNormalized {
  titulo: string;
  descricao: string;
  data_horario: Date | null;
  endereco: string;
  numero: string | null;
  bairro: string;
  complemento: string | null;
  cidade: string;
  estado: string;
  cep: string | null;
  preco: number;
  link_compra: string;
  imagem: string;
  categoria_sugerida: string;
  fonte: 'duoticket';
}

// ─── Constantes ─────────────────────────────────────────────────────

const BASE_URL = 'https://duoticket.com.br';
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ─── Endereços Conhecidos ───────────────────────────────────────────

interface VenueAddress {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

const VENUES_ADDRESSES: Record<string, VenueAddress> = {
  'varanda leblon': {
    rua: 'Rua Irmã Eufrásia',
    numero: '300',
    bairro: 'Jardim Petráglia',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14403-600',
  },
  'villa eventos': {
    rua: 'Rodovia Engenheiro Ronan Rocha',
    numero: '19304',
    bairro: 'Rural',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14404-080',
  },
  'teatro judas iscariotes': {
    rua: 'Rua José Marquês García',
    numero: '395',
    bairro: 'Cidade Nova',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14401-080',
  },
  'ginasio pedrocao': {
    rua: 'Rua dos Pracinhas',
    numero: '510',
    bairro: 'Residencial Paraiso',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14403-160',
  },
  'clube aabb': {
    rua: 'Avenida São Vicente',
    numero: '3501',
    bairro: 'Jardim Noemia',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14403-720',
  },
  'morada du capiau': {
    rua: 'Avenida Rio Amazonas',
    numero: '578',
    bairro: 'Residencial Oswaldo Maciel',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14406-010',
  },
  'espina': {
    rua: 'Rua Monsenhor Rosa',
    numero: '2100',
    bairro: 'Centro',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14400-670',
  },
  'barril 10': {
    rua: 'Rua Voluntários da Franca',
    numero: '2685',
    bairro: 'Centro',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14400-490',
  },
  // Mais locais podem ser adicionados conforme aparecem
};

/**
 * Resolve o endereço completo de um venue pelo nome.
 * Busca no lookup table VENUES_ADDRESSES.
 */
function resolveVenueAddress(venueName: string): VenueAddress | null {
  const normalized = venueName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .trim();

  // Busca exata
  if (VENUES_ADDRESSES[normalized]) {
    return VENUES_ADDRESSES[normalized];
  }

  // Busca parcial (venue name contém a chave ou vice-versa)
  for (const [key, addr] of Object.entries(VENUES_ADDRESSES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return addr;
    }
  }

  return null;
}

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

// ─── Parse de data DD/MM/YYYY ───────────────────────────────────────

/**
 * Converte string de data no formato DuoTicket para Date.
 * Formato suportado: "DD/MM/YYYY" (ex: "21/05/2026")
 * 
 * Muito mais simples que Q2/Sympla pois o DuoTicket já fornece a data
 * completa com ano no formato numérico.
 */
export function parseDataDuoTicket(dataStr: string): Date | null {
  try {
    const cleaned = dataStr.trim();
    const match = cleaned.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!match) return null;

    const dia = parseInt(match[1], 10);
    const mes = parseInt(match[2], 10) - 1; // JavaScript: 0-indexed
    const ano = parseInt(match[3], 10);

    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return null;

    return new Date(ano, mes, dia);
  } catch {
    return null;
  }
}

// ─── Inferência de Categoria ────────────────────────────────────────

/**
 * Tenta inferir a categoria do evento pelo título.
 * Mapeamento para o enum CategoriaEvento do Prisma.
 */
function inferirCategoria(titulo: string): string {
  const t = titulo.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Show / Festas
  if (
    t.includes('show') || t.includes('rock') || t.includes('sertanejo') ||
    t.includes('pagode') || t.includes('baile') || t.includes('festa') ||
    t.includes('cover') || t.includes('tributo') || t.includes('ao vivo') ||
    t.includes('tour') || t.includes('festival') || t.includes('fest') ||
    t.includes('samba') || t.includes('resenha') || t.includes('feijoada') ||
    t.includes('after') || t.includes('house') || t.includes('funk') ||
    t.includes('sunset') || t.includes('emo night') || t.includes('bpm') ||
    t.includes('barbecue') || t.includes('turne') || t.includes('farra')
  ) return 'Show';

  // Esporte
  if (
    t.includes('nbb') || t.includes('basquete') || t.includes('futebol') ||
    t.includes('esport') || t.includes('corrida') || t.includes('trilha') ||
    t.includes('playoff') || t.includes('campeonato')
  ) return 'Esporte';

  // Gastronomia
  if (
    t.includes('gastrono') || t.includes('bacon') || t.includes('almoco') ||
    t.includes('jantar') || t.includes('culinari') || t.includes('degustacao')
  ) return 'Gastronomia';

  // Palestra / Congresso
  if (
    t.includes('congresso') || t.includes('palestra') || t.includes('seminario') ||
    t.includes('conferencia') || t.includes('forum')
  ) return 'Palestra';

  // Workshop
  if (
    t.includes('workshop') || t.includes('curso') || t.includes('oficina') ||
    t.includes('capacitacao')
  ) return 'Workshop';

  // Teatro / Comedy
  if (
    t.includes('teatro') || t.includes('stand-up') || t.includes('standup') ||
    t.includes('comedy') || t.includes('comedia') || t.includes('espetaculo') ||
    t.includes('cirillo') || t.includes('humor')
  ) return 'Teatro';

  // Exposição
  if (
    t.includes('exposicao') || t.includes('expo') ||
    t.includes('mostra') || t.includes('galeria')
  ) return 'Exposicao';

  return 'Outros';
}

// ─── Extração de cards da página ────────────────────────────────────

/**
 * Parseia os cards de eventos de uma página HTML do DuoTicket.
 * Funciona tanto na homepage quanto na página de pesquisa.
 */
function parseEventCards(html: string, cidadeFiltro?: string): DuoTicketEventRaw[] {
  const $ = cheerio.load(html);
  const eventos: DuoTicketEventRaw[] = [];

  // Seleciona todos os containers de cards
  $('div.item-listing-container-skrn').each((_i, el) => {
    const $card = $(el);

    // Link e título
    const $titleLink = $card.find('h6 a').first();
    const titulo = $titleLink.text().trim();
    let link = $titleLink.attr('href') || '';

    // Garante URL completa
    if (link && !link.startsWith('http')) {
      link = `${BASE_URL}/${link.replace(/^\//, '')}`;
    }

    // Imagem (usa data-src por conta do lazy loading)
    const $img = $card.find('img').first();
    const imagemUrl = $img.attr('data-src') || $img.attr('src') || '';

    // Data e Local (dentro de .evento-block-dates)
    const $dates = $card.find('div.evento-block-dates p');
    let dataStr = '';
    let cidadeEstado = '';

    $dates.each((_j, pEl) => {
      const text = $(pEl).text().trim();
      // Se contém formato de data DD/MM/YYYY
      if (/\d{2}\/\d{2}\/\d{4}/.test(text)) {
        dataStr = text.replace(/[^\d\/]/g, '').trim(); // Limpa ícones etc
      }
      // Se contém indicador de local (pipe separando cidade | UF)
      else if (text.includes('|')) {
        cidadeEstado = text;
      }
    });

    // Parse cidade e estado
    let cidade = 'Franca';
    let estado = 'SP';
    if (cidadeEstado) {
      const parts = cidadeEstado.split('|').map(p => p.trim());
      if (parts.length >= 2) {
        cidade = parts[0];
        estado = parts[1];
      }
    }

    // Filtro por cidade (se especificado)
    if (cidadeFiltro) {
      const cidadeNorm = cidade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const filtroNorm = cidadeFiltro.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (!cidadeNorm.includes(filtroNorm)) return; // Pula este card
    }

    if (titulo && link) {
      eventos.push({
        titulo,
        dataStr,
        local_nome: '', // Será preenchido na etapa de detalhe
        cidade,
        estado,
        link,
        imagemUrl,
      });
    }
  });

  return eventos;
}

// ─── Função Principal de Extração ───────────────────────────────────

/**
 * Busca eventos do DuoTicket para a cidade especificada.
 *
 * Estratégia dupla:
 * 1. Varre a homepage (lista todos os próximos eventos) e filtra por cidade
 * 2. Usa a rota de pesquisa (?p=cidade) para capturar eventos adicionais
 * 3. Deduplica por link
 *
 * @param cidade - Nome da cidade para filtrar (default: "Franca")
 * @returns Array de eventos brutos encontrados
 */
export async function getDuoTicketEvents(cidade: string = 'Franca'): Promise<DuoTicketEventRaw[]> {
  console.log(`\n🔍 [DuoTicket Service] Buscando eventos para: ${cidade}`);
  const allEvents: DuoTicketEventRaw[] = [];

  // 1. Homepage — lista todos os próximos eventos
  try {
    console.log(`   📄 Varrendo homepage...`);
    const homepageHtml = await fetchWithRetry(`${BASE_URL}/index`);
    const homepageEvents = parseEventCards(homepageHtml, cidade);
    console.log(`   ✅ Homepage: ${homepageEvents.length} evento(s) de ${cidade}`);
    allEvents.push(...homepageEvents);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`   ⚠️ Erro ao varrer homepage: ${msg}`);
  }

  // 2. Pesquisa — busca textual por cidade
  try {
    console.log(`   📄 Varrendo pesquisa por "${cidade}"...`);
    const searchHtml = await fetchWithRetry(`${BASE_URL}/pesquisa?p=${encodeURIComponent(cidade)}`);
    const searchEvents = parseEventCards(searchHtml); // Sem filtro, a pesquisa já filtra
    console.log(`   ✅ Pesquisa: ${searchEvents.length} evento(s) encontrados`);
    allEvents.push(...searchEvents);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`   ⚠️ Erro ao varrer pesquisa: ${msg}`);
  }

  // 3. Deduplicação por link
  const eventosUnicos = Array.from(
    new Map(allEvents.map((e) => [e.link, e])).values()
  );

  console.log(`\n✅ [DuoTicket Service] ${eventosUnicos.length} evento(s) únicos de ${cidade}`);
  return eventosUnicos;
}

// ─── Detalhes do Evento (página individual) ─────────────────────────

/**
 * Acessa a página individual de um evento para extrair dados adicionais:
 * - Nome do local/venue
 * - Descrição completa (se disponível)
 */
export async function getDuoTicketEventDetail(eventUrl: string): Promise<{
  local_nome: string;
  descricao: string;
}> {
  try {
    const html = await fetchWithRetry(eventUrl);
    const $ = cheerio.load(html);

    // Local/Venue — fica dentro da sidebar, abaixo de "LOCAL"
    let local_nome = '';
    const $localHeader = $('h4.content-sidebar-sub-header').filter((_i, el) =>
      $(el).text().trim().toUpperCase() === 'LOCAL'
    );
    if ($localHeader.length > 0) {
      const $localDiv = $localHeader.next('div.content-sidebar-short-description');
      if ($localDiv.length > 0) {
        // O nome do local é o texto antes do <br> ou <i>
        const localHtml = $localDiv.html() || '';
        const localText = localHtml.split(/<br\s*\/?>/i)[0];
        local_nome = cheerio.load(localText).text().trim();
      }
    }

    // Descrição — dentro de .row-descri-event
    let descricao = '';
    const $descDiv = $('div.row-descri-event');
    if ($descDiv.length > 0) {
      // Pega o texto principal, ignorando orientações gerais
      const $contentDiv = $descDiv.find('div.mt-2').first();
      if ($contentDiv.length > 0) {
        descricao = $contentDiv.text().trim();
      }
      // Se não achou no mt-2, tenta pegar qualquer parágrafo substancial
      if (!descricao || descricao.length < 20) {
        $descDiv.find('p').each((_i, el) => {
          const text = $(el).text().trim();
          if (text.length > 30 && text.length > descricao.length && !text.includes('obrigatória')) {
            descricao = text;
          }
        });
      }
    }

    return { local_nome, descricao };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`   ⚠️ Erro ao acessar detalhe: ${eventUrl} — ${msg}`);
    return { local_nome: '', descricao: '' };
  }
}

// ─── Extração de Horário da Descrição ───────────────────────────────

/**
 * Tenta extrair o horário de início (hora e minuto) a partir do texto
 * da descrição do evento.
 */
function extrairHorarioDaDescricao(descricao: string): { hora: number; minuto: number } | null {
  if (!descricao) return null;

  // Limpa tags HTML
  const textoLimpo = descricao.replace(/<[^>]*>/g, ' ');

  // Busca padrões como: 22h, 22:00, 22h30, 20h30, às 20h, etc.
  const regexHora = /(?:abertura|inicio|as|partir\s+das|horario)?\s*\b([0-2]?\d)(?:[h:]([0-5]\d)?)\b/i;
  
  const matches = textoLimpo.match(new RegExp(regexHora, 'gi'));
  if (matches) {
    for (const match of matches) {
      // Ignora anos correntes ou próximos (ex: 2024, 2025, 2026) que possam ser capturados
      if (match.includes('2024') || match.includes('2025') || match.includes('2026')) {
        continue;
      }
      
      const parts = match.match(/([0-2]?\d)(?:[h:]([0-5]\d)?)/i);
      if (parts) {
        const hora = parseInt(parts[1], 10);
        const minuto = parts[2] ? parseInt(parts[2], 10) : 0;
        
        if (hora >= 0 && hora < 24) {
          return { hora, minuto };
        }
      }
    }
  }

  // Tenta achar apenas o número se precedido de termos indicadores de início
  const regexTexto = /(?:abertura|inicio|comeca|a\s+partir\s+das|as)\s+\b([0-2]?\d)\b/i;
  const matchTexto = textoLimpo.match(regexTexto);
  if (matchTexto) {
    const hora = parseInt(matchTexto[1], 10);
    if (hora >= 0 && hora < 24) {
      return { hora, minuto: 0 };
    }
  }

  return null;
}

// ─── Normalização ───────────────────────────────────────────────────

/**
 * Normaliza um evento bruto do DuoTicket para formato compatível com o schema Prisma.
 */
export function normalizeDuoTicketEvent(raw: DuoTicketEventRaw): DuoTicketEventNormalized {
  const dataParsed = parseDataDuoTicket(raw.dataStr);
  
  // Tenta enriquecer a data com o horário de início extraído da descrição original
  if (dataParsed && raw.descricao) {
    const horario = extrairHorarioDaDescricao(raw.descricao);
    if (horario) {
      dataParsed.setHours(horario.hora);
      dataParsed.setMinutes(horario.minuto);
    }
  }

  const categoria = inferirCategoria(raw.titulo);

  // Endereço — resolve via lookup table
  let endereco = 'Em breve';
  let numero: string | null = null;
  let bairro = 'Centro';
  let cidade = raw.cidade || 'Franca';
  let estado = raw.estado || 'SP';
  let cep: string | null = null;
  let complemento: string | null = null;

  if (raw.local_nome) {
    const addr = resolveVenueAddress(raw.local_nome);
    if (addr) {
      endereco = addr.rua;
      numero = addr.numero;
      bairro = addr.bairro;
      cidade = addr.cidade;
      estado = addr.estado;
      cep = addr.cep;
      complemento = `(${raw.local_nome})`;
    } else if (raw.local_nome.length > 3) {
      // Usa o nome do local como endereço genérico
      endereco = raw.local_nome;
    }
  }

  // Garante URL completa da imagem
  let imagem = raw.imagemUrl || '';
  if (imagem && !imagem.startsWith('http')) {
    imagem = `${BASE_URL}/${imagem.replace(/^\//, '')}`;
  }

  // Garante URL completa do link
  let link = raw.link;
  if (link && !link.startsWith('http')) {
    link = `${BASE_URL}/${link.replace(/^\//, '')}`;
  }

  // Preço — DuoTicket não exibe preço no card (carregado via JS async), então definimos como -1 para indicar que necessita consultar o site ("Ver ingressos")
  const preco = -1;

  return {
    titulo: raw.titulo,
    descricao: raw.descricao || `Evento ${raw.titulo} em ${cidade}/${estado}. Mais informações no site oficial.`,
    data_horario: dataParsed,
    endereco,
    numero,
    bairro,
    complemento,
    cidade,
    estado,
    cep,
    preco,
    link_compra: link,
    imagem,
    categoria_sugerida: categoria,
    fonte: 'duoticket',
  };
}
