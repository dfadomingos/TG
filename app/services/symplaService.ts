import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

// ─── Tipos ──────────────────────────────────────────────────────────

export interface SymplaEventRaw {
  titulo: string;
  dataStr: string;
  local_nome: string;
  link: string;
  imagemUrl: string;
  descricao?: string;
  endereco_extraido?: string;
}

export interface SymplaEventNormalized {
  titulo: string;
  descricao: string;
  data_horario: Date | null;
  endereco: string;
  numero: string | null;
  bairro: string | null;
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
  // Casas de show / cultura
  'the roots franca': {
    rua: 'Rua Pernambuco',
    numero: '1177',
    bairro: 'Vila Aparecida',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14401-290',
  },
  'teatro judas iscariotes': {
    rua: 'Rua José Marquês García',
    numero: '395',
    bairro: 'Cidade Nova',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14401-080',
  },
  // Espaços de eventos
  'villa eventos': {
    rua: 'Rodovia Engenheiro Ronan Rocha',
    numero: '19304',
    bairro: 'Rural',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14404-080',
  },
  'cedro espaco de eventos': {
    rua: 'Av. Presidente Vargas',
    numero: '3630',
    bairro: 'Recanto do Itambé',
    cidade: 'Franca',
    estado: 'SP',
    cep: '',
  },
  'espaco olhos d\'agua': {
    rua: 'Rua dos Bem-Te-Vis',
    numero: '4160',
    bairro: 'Jardim Primavera',
    cidade: 'Franca',
    estado: 'SP',
    cep: '',
  },
  'olhos d\'agua': {
    rua: 'Rua dos Bem-Te-Vis',
    numero: '4160',
    bairro: 'Jardim Primavera',
    cidade: 'Franca',
    estado: 'SP',
    cep: '',
  },
  // Hotéis
  'tower franca hotel': {
    rua: 'Rua Doutor Júlio Cardoso',
    numero: '2214',
    bairro: 'Centro',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14400-730',
  },
  'comfort franca': {
    rua: 'Rua Paulo Roberto Cavalheiro Coelho',
    numero: '1505',
    bairro: 'Jardim Alvorada',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14403-200',
  },
  'comfort hotel franca': {
    rua: 'Rua Paulo Roberto Cavalheiro Coelho',
    numero: '1505',
    bairro: 'Jardim Alvorada',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14403-200',
  },
  // Entidades / Instituições
  'sindifranca': {
    rua: 'Rua Doutor Cecim Miguel',
    numero: '2760',
    bairro: 'Parque Moema',
    cidade: 'Franca',
    estado: 'SP',
    cep: '',
  },
  // Outros locais
  'adega dissul': {
    rua: 'Avenida Paulo VI',
    numero: '635',
    bairro: 'Residencial Paraíso',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14403-143',
  },
  'praca frei roque pissioni': {
    rua: 'Praça Frei Roque Pissioni',
    numero: 's/n',
    bairro: 'São Joaquim',
    cidade: 'Franca',
    estado: 'SP',
    cep: '14406-306',
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

// ─── Listas de Exclusão ───────────────────────────────────────────────
const CIDADES_EXCLUIDAS = [
  'ribeirão preto', 'ribeirao preto', 'ribeiraopreto',
  'são paulo', 'sao paulo', 'saopaulo',
  'campinas', 'uberlândia', 'uberaba', 'belo horizonte',
  'bauru', 'araraquara', 'são carlos', 'sao carlos',
  'presidente prudente', 'marília', 'marilia',
  'são josé do rio preto', 'sao jose do rio preto',
  'piracicaba', 'sorocaba', 'jundiaí', 'jundiai',
  'santos', 'guarulhos', 'osasco', 'curitiba',
  'goiânia', 'goiania', 'rio de janeiro',
  'patrocínio paulista', 'patrocinio paulista',
  'batatais', 'jardinópolis', 'jardinopolis',
  'orlândia', 'orlandia', 'ituverava',
  'restinga', 'cristais paulista',
  'são joaquim da barra', 'sao joaquim da barra',
  'canastra',
];

const LOCAIS_FORA_FRANCA = [
  'teatro santarosa',
  'teatro municipal de ribeirão preto',
  'teatro pedro ii',
  'theatro pedro ii',
  'arena eurobike',
  'espaço vinil ribeirão',
  'opera house ribeirão',
  'sesc ribeirão',
  'sesc araraquara',
  'sesc bauru',
  'sesc são carlos',
];

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

    const validEvents: SymplaEventRaw[] = [];

    // Verificação de Local e Extração de Endereço
    for (const raw of rawEvents) {
      const localLower = (raw.local_nome || '').toLowerCase();
      const tituloLower = (raw.titulo || '').toLowerCase();
      
      // 1. Verifica se a cidade ou local está na blacklist
      const isBlacklistedCity = CIDADES_EXCLUIDAS.some(c => localLower.includes(c) || tituloLower.includes(c));
      const isBlacklistedVenue = LOCAIS_FORA_FRANCA.some(l => localLower.includes(l));
      
      if (isBlacklistedCity || isBlacklistedVenue) {
        console.log(`   🚫 [Sympla] Ignorado (Blacklist): "${raw.titulo}" — Local: "${raw.local_nome}"`);
        continue;
      }

      console.log(`   🔍 [Sympla] Acessando evento para extrair endereço: "${raw.titulo}"...`);
      try {
        const eventPage = await browser.newPage();
        await eventPage.goto(raw.link, { waitUntil: 'domcontentloaded', timeout: 15000 });
        
        // Extrai o texto da página para checar o endereço e tenta encontrar a aba "Local"
        const addressData = await eventPage.evaluate(() => {
          const bodyText = document.body.innerText.toLowerCase();
          
          let address = '';
          const allElements = Array.from(document.querySelectorAll('*'));
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            if (el.innerText && el.innerText.trim() === 'Local' && el.tagName.match(/H\\d|SPAN|DIV|STRONG/)) {
               if (el.parentElement && el.parentElement.innerText.length > 10) {
                 address = el.parentElement.innerText;
                 break;
               }
            }
          }
          return { pageText: bodyText, addressText: address };
        });
        await eventPage.close();
        
        const isFromAnotherCity = CIDADES_EXCLUIDAS.some(c => addressData.pageText.includes(c));
        
        // Se a whitelist (VENUES_ADDRESSES) disser que é de Franca, a gente aprova de qualquer forma, 
        // mas ganha o address extraído.
        const addr = resolveVenueAddress(raw.local_nome);
        const forceWhitelist = addr && addr.cidade.toLowerCase() === 'franca';

        if (isFromAnotherCity && !forceWhitelist) {
           console.log(`   🚫 [Sympla] Confirmado como OUTRA CIDADE após visita: "${raw.titulo}"`);
           continue;
        } else {
           console.log(`   ✅ [Sympla] Evento aprovado: "${raw.local_nome}"`);
           raw.endereco_extraido = addressData.addressText;
           validEvents.push(raw);
        }
        
        // Pausa de 1.5s para evitar bloqueios do Sympla
        await new Promise(r => setTimeout(r, 1500));
        
      } catch (err) {
        console.log(`   ⚠️ [Sympla] Erro ao verificar detalhes do evento: ${raw.link} - Mantendo evento por precaução.`);
        // Em caso de erro de timeout, mantemos
        validEvents.push(raw); 
      }
    }
    
    return validEvents;
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
  let bairro: string | null = null;
  let complemento: string | null = null;
  let cidade = 'Franca';
  let estado = 'SP';
  let cep = null;

  let enderecoPreenchidoPelaExtracao = false;

  if (raw.endereco_extraido) {
    // Filtra as linhas para evitar lixo
    const lines = raw.endereco_extraido.split('\\n').map(l => l.trim()).filter(l => l && l.toLowerCase() !== 'local' && l.toLowerCase() !== 'ver mapa');
    
    if (lines.length > 0) {
      // Pega a linha mais longa que tenha vírgulas, pois ela costuma ser a mais detalhada
      // ex: "Avenida São Vicente, 5811, Pádua Faria Hall, Jardim Noemia"
      let targetLine = lines[0];
      for (const line of lines) {
         if (line.split(',').length > targetLine.split(',').length) {
           targetLine = line;
         }
      }
      
      const parts = targetLine.split(',').map(p => p.trim());
      if (parts.length >= 1) endereco = parts[0];
      if (parts.length >= 2) numero = parts[1];
      if (parts.length >= 3) {
        if (parts.length >= 4) {
           complemento = parts[2];
           bairro = parts[3];
        } else {
           // Se tiver 3 partes, a última pode ser o bairro ou o complemento
           bairro = parts[2];
        }
      }
      enderecoPreenchidoPelaExtracao = true;
    }
  }

  // Fallback para a tabela local caso a extração falhe ou venha vazia
  if (!enderecoPreenchidoPelaExtracao) {
    const addr = resolveVenueAddress(raw.local_nome);
    if (addr) {
      endereco = addr.rua;
      numero = addr.numero;
      bairro = addr.bairro;
      cidade = addr.cidade;
      estado = addr.estado;
      cep = addr.cep;
    } else if (raw.local_nome && raw.local_nome.length > 3) {
      const partes = raw.local_nome.split('-');
      endereco = partes[0].trim();
    }
  }

  // Preço - O Sympla não lista preço no card da vitrine geralmente, então setamos -1 para "Ver ingressos"
  const preco = -1;

  return {
    titulo: raw.titulo,
    descricao: raw.descricao || `Evento ${raw.titulo} em Franca/SP. Mais informações no site oficial.`,
    data_horario: dataParsed,
    endereco,
    numero,
    bairro,
    complemento,
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
