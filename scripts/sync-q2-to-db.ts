/**
 * Script para extrair eventos da Q2 e sincronizar diretamente com o Banco de Dados (Prisma).
 * 
 * Execução: npx tsx scripts/sync-q2-to-db.ts
 */
import { config } from 'dotenv';
config();
import { PrismaClient, CategoriaEvento, EventStatus } from '@prisma/client';
import { 
  getQ2EventsPuppeteer, 
  normalizeQ2Event
} from '../app/services/q2Service';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

async function downloadImage(url: string | null): Promise<string | null> {
  if (!url) return null;
  // Se já for um caminho local, ignora
  if (url.startsWith('/')) return url;
  
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Ignora imagens muito pequenas (provavelmente ícones ou tracking pixels)
    if (buffer.length < 5000) {
      console.warn(`   ⚠️ Imagem muito pequena (${buffer.length} bytes), ignorando: ${url.substring(0, 60)}...`);
      return null;
    }
    
    // Detecta extensão pelo content-type se possível
    const contentType = res.headers.get('content-type') || '';
    let ext = 'jpg';
    if (contentType.includes('png')) ext = 'png';
    else if (contentType.includes('webp')) ext = 'webp';
    else if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpeg';
    else {
      const extMatch = url.match(/\.([a-zA-Z0-9]+)(?:[\?#]|$)/);
      if (extMatch) ext = extMatch[1];
    }
    
    const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 10);
    const filename = `q2-${hash}.${ext}`;
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'eventos-externos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);
    
    return `/uploads/eventos-externos/${filename}`;
  } catch (error) {
    console.warn(`   ⚠️ Erro ao baixar imagem: ${url.substring(0, 60)}...`);
    return null;
  }
}

let geminiQuotaExceeded = false;
let groqQuotaExceeded = false;

async function resumirComIA(descricao: string, titulo: string): Promise<string> {
  // Ignora descrições curtas
  if (!descricao || descricao.length < 80) return descricao;

  // Limita tamanho máximo enviado ao prompt para economizar tokens
  const descricaoRecortada = descricao.substring(0, 3500);

  const prompt = `Você é um curador de um guia cultural de eventos de Franca-SP. 
Sua tarefa é ler a descrição original do evento '${titulo}' e remover todos os textos legais, termos de uso, regras de meia-entrada e restrições burocráticas.
Crie uma descrição atrativa, animada e direta ao ponto, com no máximo 2 ou 3 parágrafos curtos, destacando apenas as atrações, o estilo da festa e o que vai rolar.

REGRA CRÍTICA: Retorne APENAS o texto da descrição do evento. NÃO adicione introduções, saudações, conclusões ou frases como "Aqui está uma versão...", "Aproveite!" ou "Confira".

Descrição Original:
"""
${descricaoRecortada}
"""

Resumo:`;

  // Tenta Gemini com retry em caso de Rate Limit (429)
  if (process.env.GEMINI_API_KEY && !geminiQuotaExceeded) {
    const maxRetries = 3;
    let delay = 2000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          signal: AbortSignal.timeout(15000),
        });

        if (res.ok) {
          const data = await res.json();
          const textoGerado = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textoGerado) return textoGerado.trim();
          break;
        } else if (res.status === 429) {
          const errorData = await res.json().catch(() => ({}));
          const errorMsg = errorData.error?.message || '';
          if (
            errorMsg.toLowerCase().includes('quota') ||
            errorMsg.toLowerCase().includes('exceeded') ||
            errorMsg.toLowerCase().includes('limit')
          ) {
            console.warn(`   ⚠️ Gemini Quota Excedida! Desabilitando chamadas subsequentes nesta execução.`);
            geminiQuotaExceeded = true;
            break;
          }

          const retryDelaySecs = errorData.error?.details?.find((d: any) => d['@type']?.includes('RetryInfo'))?.retryDelay;
          let waitTime = delay;
          if (retryDelaySecs) {
            const parsedSecs = parseInt(retryDelaySecs.replace('s', ''), 10);
            if (!isNaN(parsedSecs)) {
              waitTime = (parsedSecs + 1) * 1000;
            }
          }
          console.warn(`   ⚠️ Gemini Rate Limit (429) na tentativa ${attempt}/${maxRetries}. Aguardando ${waitTime / 1000}s...`);
          await new Promise((r) => setTimeout(r, waitTime));
          delay *= 2;
        } else {
          const errorData = await res.json().catch(() => ({}));
          console.warn(`   ⚠️ Erro API Gemini (${res.status}):`, JSON.stringify(errorData));
          break;
        }
      } catch (e) {
        console.warn(`   ⚠️ Falha na chamada do Gemini (Tentativa ${attempt}/${maxRetries}):`, e);
        if (attempt === maxRetries) break;
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
      }
    }
  }

  // Tenta Groq (fallback gratuito)
  if (process.env.GROQ_API_KEY && !groqQuotaExceeded) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'groq/compound-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.7
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        const data = await res.json();
        const textoGerado = data.choices?.[0]?.message?.content;
        if (textoGerado) return textoGerado.trim();
      } else if (res.status === 429 || res.status === 402) {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || '';
        if (
          errorMsg.toLowerCase().includes('quota') ||
          errorMsg.toLowerCase().includes('exceeded') ||
          errorMsg.toLowerCase().includes('billing')
        ) {
          console.warn(`   ⚠️ Groq Quota/Billing Excedido! Desabilitando chamadas subsequentes à Groq nesta execução.`);
          groqQuotaExceeded = true;
        }
      }
    } catch (e) {
      console.warn("   ⚠️ Erro ao acessar IA da Groq.");
    }
  }

  return descricao; // Fallback
}

const prisma = new PrismaClient();

async function main() {
  console.log('━'.repeat(60));
  console.log('🔄 INICIANDO SINCRONIZAÇÃO: Q2 -> BANCO DE DADOS');
  console.log('━'.repeat(60));
  
  console.log('🔑 Gemini API Key:', process.env.GEMINI_API_KEY ? '✅ Carregada' : '❌ Não encontrada');
  console.log('🔑 Groq API Key:', process.env.GROQ_API_KEY ? '✅ Carregada' : '❌ Não encontrada');

  let hasFatalError = false;

  try {
    // 1. Garantir que o organizador "Q2 Ingressos" existe
    console.log('\n👤 Verificando organizador do sistema...');
    const organizer = await prisma.organizador.upsert({
      where: { email: 'sistema@q2ingressos.com.br' },
      update: {},
      create: {
        nome: 'Q2 Ingressos',
        email: 'sistema@q2ingressos.com.br',
        celular: '0000000000',
        senha: 'SISTEMA_NO_LOGIN', // Senha dummy pois é automático
        nome_produtora: 'Q2 Ingressos (Automático)',
        cnpj: '00.000.000/0001-00', // CNPJ fictício para o sistema
        aceitou_termos: true,
      },
    });
    console.log(`   ✅ Organizador ID: ${organizer.id}`);

    // Desconecta o Prisma durante a extração para evitar timeout no pool de conexões do Supabase
    await prisma.$disconnect();

    // 2. Extrair eventos da Q2 (API + fallback Puppeteer)
    console.log('\n🚀 Extraindo eventos da Q2...');
    const rawEvents = await getQ2EventsPuppeteer('Franca');

    // Reconecta o Prisma
    await prisma.$connect();

    if (rawEvents.length === 0) {
      console.log('🛑 Nenhum evento encontrado para sincronizar.');
      return;
    }

    // 3. Normalizar e salvar no banco
    console.log(`\n💾 Sincronizando ${rawEvents.length} eventos...`);
    let criados = 0;
    let atualizados = 0;

    for (const raw of rawEvents) {
      const normalized = normalizeQ2Event(raw);
      
      if (!normalized.data_horario) continue;

      // Filtra eventos de teste da plataforma Q2 (que contenham 'teste' no nome)
      if (normalized.titulo.trim().toLowerCase().includes('teste')) {
        console.log(`   🚫 [Q2] Ignorado (evento de teste): "${normalized.titulo}"`);
        continue;
      }

      // Ignora eventos que não acontecem em Franca
      const cidadeNorm = (normalized.cidade || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (cidadeNorm !== 'franca') {
        console.log(`   🚫 [Q2] Ignorado (Fora de Franca: ${normalized.cidade}): "${normalized.titulo}"`);
        continue;
      }

      // Verifica se o evento já existe (pelo link de compra ou título+data)
      const existingEvent = await prisma.evento.findFirst({
        where: {
          OR: [
            { link_compra: normalized.link_compra },
            { 
              titulo: {
                equals: normalized.titulo,
                mode: 'insensitive',
              },
              data_horario: normalized.data_horario
            }
          ]
        }
      });

      let finalImagePath = '';
      let descricaoFormatada = '';
      let chamouIA = false;

      if (existingEvent) {
        // Reaproveita imagem e descrição existentes para poupar downloads e cota de IA
        finalImagePath = existingEvent.imagem;
        descricaoFormatada = existingEvent.descricao;

        const localFileExists =
          finalImagePath.startsWith('/uploads/') &&
          fs.existsSync(path.join(process.cwd(), 'public', finalImagePath));

        const precisaBaixarImagem = !finalImagePath || !localFileExists;
        const precisaIA =
          !descricaoFormatada ||
          descricaoFormatada.length < 50 ||
          descricaoFormatada === normalized.titulo ||
          descricaoFormatada.includes('A Q2 Ingressos não faz parte da organização');

        if (precisaBaixarImagem) {
          const localImagePath = await downloadImage(normalized.imagem);
          finalImagePath = localImagePath || normalized.imagem || existingEvent.imagem || '';
        }

        if (precisaIA && (process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY)) {
          console.log(`      🤖 [IA] Gerando descrição para evento atualizado: "${normalized.titulo}"`);
          descricaoFormatada = await resumirComIA(normalized.descricao, normalized.titulo);
          chamouIA = true;
        }
      } else {
        // Evento novo: baixa imagem e formata descrição com IA
        const localImagePath = await downloadImage(normalized.imagem);
        finalImagePath = localImagePath || normalized.imagem || '';

        descricaoFormatada = normalized.descricao;
        if (process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY) {
          console.log(`      🤖 [IA] Gerando descrição para novo evento: "${normalized.titulo}"`);
          descricaoFormatada = await resumirComIA(normalized.descricao, normalized.titulo);
          chamouIA = true;
        }
      }

      const eventData = {
        titulo: normalized.titulo,
        descricao: descricaoFormatada,
        categoria: normalized.categoria_sugerida as CategoriaEvento,
        data_horario: normalized.data_horario,
        endereco: normalized.endereco,
        numero: normalized.numero,
        bairro: normalized.bairro,
        complemento: normalized.complemento,
        cidade: normalized.cidade,
        estado: normalized.estado,
        cep: normalized.cep,
        preco: normalized.preco,
        link_compra: normalized.link_compra,
        imagem: finalImagePath,
        status: 'Publicado' as EventStatus,
        organizerId: organizer.id,
      };

      if (existingEvent) {
        // Atualiza se já existe
        await prisma.evento.update({
          where: { id: existingEvent.id },
          data: eventData,
        });
        atualizados++;
        console.log(`   ♻️  Atualizado: "${normalized.titulo}"`);
      } else {
        // Cria novo
        await prisma.evento.create({
          data: eventData,
        });
        criados++;
        console.log(`   ✨ Criado: "${normalized.titulo}"`);
      }

      // Pausa apenas se chamou IA
      if (chamouIA) {
        await new Promise((r) => setTimeout(r, 2000));
      } else {
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    console.log('\n' + '━'.repeat(60));
    console.log('📊 RESUMO DA SINCRONIZAÇÃO');
    console.log(`   Novos eventos:   ${criados}`);
    console.log(`   Atualizados:     ${atualizados}`);
    console.log('   Status:          Sucesso! ✅');
    console.log('━'.repeat(60));

  } catch (error) {
    hasFatalError = true;
    console.error('\n❌ ERRO FATAL NA SINCRONIZAÇÃO:', error);
  } finally {
    await prisma.$disconnect();
    if (hasFatalError) {
      process.exit(1);
    }
  }
}

main();
