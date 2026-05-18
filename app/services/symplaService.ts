import puppeteer from 'puppeteer';

// ─── Tipos ──────────────────────────────────────────────────────────

export interface SymplaEventRaw {
  titulo: string;
  dataStr: string;
  local_nome: string;
  link: string;
  imagemUrl: string;
  descricao?: string;
}

export interface SymplaEventNormalized {
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
  fonte: 'sympla';
}

const MESES_PT: Record<string, number> = {
  JAN: 0, FEV: 1, MAR: 2, ABR: 3, MAI: 4, JUN: 5,
  JUL: 6, AGO: 7, SET: 8, OUT: 9, NOV: 10, DEZ: 11
};

// ─── Endereços Conhecidos (Idêntico ao Q2) ──────────────────────────

interface VenueAddress {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

const VENUES_ADDRESSES: Record<string, VenueAddress> = {
  'teatro judas iscariotes': {
    rua: 'Rua José Marquês García',
    numero: '395',
    bairro: 'Cidade Nova',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14401-080',
  },
  'villa eventos': {
    rua: 'Rodovia Engenheiro Ronan Rocha',
    numero: '19304',
    bairro: 'Rural',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14404-080',
  },
  // Mais locais podem ser adicionados conforme aparecem
};

function resolveVenueAddress(venueName: string): VenueAddress | null {
  const normalized = venueName.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
    .trim();

  for (const key in VENUES_ADDRESSES) {
    if (normalized.includes(key)) return VENUES_ADDRESSES[key];
  }
  return null;
}

// ─── Parse de data PT-BR ────────────────────────────────────────────

export function parseDataSympla(dataStr: string): Date | null {
  try {
    // Formato Sympla: "Sexta, 22 de Mai às 20:00"
    const cleaned = dataStr.replace(/\./g, '').trim().toUpperCase();

    // Regex para pegar Dia e Mês: "22 DE MAI"
    const match = cleaned.match(/(\d{1,2})\s+DE\s+(\w{3})/);
    if (!match) return null;

    const dia = parseInt(match[1], 10);
    const mesAbrev = match[2];
    const mesIdx = MESES_PT[mesAbrev];

    if (mesIdx === undefined || isNaN(dia)) return null;

    // Extrair horário "às 20:00"
    let hora = 0;
    let minuto = 0;
    const timeMatch = cleaned.match(/ÀS\s*(\d{1,2}):(\d{2})/i) || cleaned.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      hora = parseInt(timeMatch[1], 10);
      minuto = parseInt(timeMatch[2], 10);
    }

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

// ─── Categoria ──────────────────────────────────────────────────────

function inferirCategoria(titulo: string): string {
  const t = titulo.toLowerCase();
  if (t.includes('show') || t.includes('festival') || t.includes('fest') || t.includes('turne') || t.includes('festa') || t.includes('tributo') || t.includes('cover') || t.includes('rock') || t.includes('samba') || t.includes('pagode')) return 'Show';
  if (t.includes('stand') || t.includes('comedy') || t.includes('teatro') || t.includes('espetaculo') || t.includes('humor')) return 'Teatro';
  if (t.includes('congresso') || t.includes('palestra') || t.includes('workshop') || t.includes('curso')) return 'Palestra';
  if (t.includes('esporte') || t.includes('jogo') || t.includes('corrida') || t.includes('campeonato')) return 'Esporte';
  if (t.includes('gastronomia') || t.includes('jantar') || t.includes('degustacao') || t.includes('feijoada')) return 'Gastronomia';
  if (t.includes('expo') || t.includes('exposicao') || t.includes('feira')) return 'Exposicao';
  return 'Outros';
}

// ─── Extração via Puppeteer ─────────────────────────────────────────

export async function getSymplaEventsPuppeteer(city: string = 'franca'): Promise<SymplaEventRaw[]> {
  const searchUrl = `https://www.sympla.com.br/eventos/${city.toLowerCase()}-sp`;
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  await page.setViewport({ width: 1366, height: 768 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

  try {
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Aguardar o carregamento dos cards
    await page.waitForSelector('a.sympla-card', { timeout: 10000 }).catch(() => null);

    const rawEvents = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('a.sympla-card'));
      const events: SymplaEventRaw[] = [];

      for (const card of cards) {
        const anchor = card as HTMLAnchorElement;
        const link = anchor.href;
        
        const imgEl = card.querySelector('img');
        const imagemUrl = imgEl ? (imgEl.src || '') : '';
        
        const titleEl = card.querySelector('h3') as HTMLElement | null;
        const titulo = titleEl ? titleEl.innerText.trim() : '';
        
        const pTags = Array.from(card.querySelectorAll('p'));
        let local_nome = 'Local a definir';
        if (pTags.length > 0) {
          local_nome = (pTags[0] as HTMLElement).innerText.trim();
        }

        let dataStr = '';
        const allText = (card as HTMLElement).innerText;
        // Tenta capturar o formato da data como "Sexta, 22 de Mai às 20:00"
        const dateMatch = allText.match(/(?:SEG|TER|QUA|QUI|SEX|SÁB|DOM|Segunda|Terça|Quarta|Quinta|Sexta|Sábado|Domingo).*?\d{1,2}\s+de\s+[a-zA-Z]+.*?às\s*\d{1,2}:\d{2}/i);
        if (dateMatch) {
          dataStr = dateMatch[0].trim();
        } else {
          // Fallback para datas simples
          const fallback = allText.match(/\d{1,2}\s+de\s+[a-zA-Z]+/i);
          if (fallback) dataStr = fallback[0].trim();
        }

        if (titulo && link) {
          events.push({ titulo, dataStr, local_nome, link, imagemUrl });
        }
      }
      return events;
    });

    // Passo Adicional Opcional: Entrar nas páginas para capturar a descrição completa
    // Por eficiência e para evitar bloqueios, usaremos o Gemini para criar a descrição 
    // a partir do título caso não façamos a navegação profunda.
    // Vamos apenas retornar os raws.
    
    return rawEvents;
  } catch (error) {
    console.error("Erro ao extrair via Puppeteer no Sympla:", error);
    return [];
  } finally {
    await browser.close();
  }
}

// ─── Normalização ───────────────────────────────────────────────────

export function normalizeSymplaEvent(raw: SymplaEventRaw): SymplaEventNormalized {
  const dataParsed = parseDataSympla(raw.dataStr);
  const categoria = inferirCategoria(raw.titulo);
  
  // Endereço
  let endereco = 'Em breve';
  let numero = null;
  let bairro = 'Centro';
  let cidade = 'Franca';
  let estado = 'SP';
  let cep = null;

  const addr = resolveVenueAddress(raw.local_nome);
  if (addr) {
    endereco = addr.rua;
    numero = addr.numero;
    bairro = addr.bairro;
    cidade = addr.cidade;
    estado = addr.estado;
    cep = addr.cep;
  } else if (raw.local_nome && raw.local_nome.length > 3) {
    // Tenta usar o nome do local como endereço genérico se não achou no map
    const partes = raw.local_nome.split('-');
    endereco = partes[0].trim();
  }

  // Preço - O Sympla não lista preço no card da vitrine geralmente, então setamos 0 para "A consultar"
  const preco = 0;

  return {
    titulo: raw.titulo,
    descricao: raw.descricao || `Evento ${raw.titulo} em Franca/SP. Mais informações no site oficial.`,
    data_horario: dataParsed,
    endereco,
    numero,
    bairro,
    complemento: null,
    cidade,
    estado,
    cep,
    preco,
    link_compra: raw.link,
    imagem: raw.imagemUrl,
    categoria_sugerida: categoria,
    fonte: 'sympla',
  };
}
