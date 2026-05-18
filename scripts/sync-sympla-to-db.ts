/**
 * Script para extrair eventos do Sympla e sincronizar diretamente com o Banco de Dados (Prisma).
 * 
 * Execução: npx tsx scripts/sync-sympla-to-db.ts
 */
import { config } from 'dotenv';
config();
import { PrismaClient, CategoriaEvento, EventStatus } from '@prisma/client';
import { 
  getSymplaEventsPuppeteer, 
  normalizeSymplaEvent
} from '../app/services/symplaService';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

async function downloadImage(url: string | null): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('/')) return url;
  
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) return null;
    
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    if (buffer.length < 5000) {
      console.warn(`   ⚠️ Imagem muito pequena (${buffer.length} bytes), ignorando: ${url.substring(0, 60)}...`);
      return null;
    }
    
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
    const filename = `sympla-${hash}.${ext}`;
    
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

async function resumirComIA(descricao: string, titulo: string): Promise<string> {
  // Se a descrição for genérica e curta, usaremos a IA para gerar uma introdução atraente baseada no título
  const prompt = `Você é um curador de um guia cultural de eventos de Franca-SP. 
Crie uma descrição atrativa, animada e direta ao ponto para o seguinte evento: '${titulo}'.
Você tem poucas informações sobre ele (Descrição original: "${descricao}"), então use a criatividade sem inventar dados críticos.
Máximo de 2 parágrafos.

REGRA CRÍTICA: Retorne APENAS o texto da descrição do evento. NÃO adicione introduções, saudações, conclusões ou frases como "Aqui está uma versão...", "Aproveite!" ou "Confira".

Resumo:`;

  if (process.env.GEMINI_API_KEY) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (res.ok) {
        const data = await res.json();
        const textoGerado = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textoGerado) return textoGerado.trim();
      }
    } catch (e) {
      console.warn("   ⚠️ Erro ao acessar IA do Gemini.");
    }
  }

  return descricao; // Fallback
}

const prisma = new PrismaClient();

async function main() {
  console.log('━'.repeat(60));
  console.log('🔄 INICIANDO SINCRONIZAÇÃO: SYMPLA -> BANCO DE DADOS');
  console.log('━'.repeat(60));
  
  try {
    // 1. Garantir que o organizador "Sympla" existe
    console.log('\n👤 Verificando organizador do sistema...');
    const organizer = await prisma.organizador.upsert({
      where: { email: 'sistema@sympla.com.br' },
      update: {},
      create: {
        nome: 'Sympla',
        email: 'sistema@sympla.com.br',
        celular: '0000000000',
        senha: 'SISTEMA_NO_LOGIN',
        nome_produtora: 'Sympla (Automático)',
        cnpj: '00.000.000/0002-00',
        aceitou_termos: true,
      },
    });
    console.log(`   ✅ Organizador ID: ${organizer.id}`);

    // 2. Extrair eventos
    console.log('\n🚀 Extraindo eventos do Sympla...');
    const rawEvents = await getSymplaEventsPuppeteer('Franca');

    if (rawEvents.length === 0) {
      console.log('🛑 Nenhum evento encontrado para sincronizar.');
      return;
    }

    // 3. Normalizar e salvar no banco
    console.log(`\n💾 Sincronizando ${rawEvents.length} eventos...`);
    let criados = 0;
    let atualizados = 0;

    for (const raw of rawEvents) {
      const normalized = normalizeSymplaEvent(raw);
      
      if (!normalized.data_horario) continue;

      // 3.1. Baixar a imagem (se disponível)
      const localImagePath = await downloadImage(normalized.imagem);
      const finalImagePath = localImagePath || normalized.imagem || '';

      // 3.2. Formatar descrição com IA
      let descricaoFormatada = normalized.descricao;
      if (process.env.GEMINI_API_KEY) {
         descricaoFormatada = await resumirComIA(normalized.descricao, normalized.titulo);
      }

      // Verifica se o evento já existe
      const existingEvent = await prisma.evento.findFirst({
        where: {
          OR: [
            { link_compra: normalized.link_compra },
            { 
              titulo: normalized.titulo,
              data_horario: normalized.data_horario
            }
          ]
        }
      });

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
        await prisma.evento.update({
          where: { id: existingEvent.id },
          data: eventData,
        });
        atualizados++;
        console.log(`   ♻️  Atualizado: "${normalized.titulo}"`);
      } else {
        await prisma.evento.create({
          data: eventData,
        });
        criados++;
        console.log(`   ✨ Criado: "${normalized.titulo}"`);
      }
    }

    console.log('\n' + '━'.repeat(60));
    console.log('📊 RESUMO DA SINCRONIZAÇÃO');
    console.log(`   Novos eventos:   ${criados}`);
    console.log(`   Atualizados:     ${atualizados}`);
    console.log('   Status:          Sucesso! ✅');
    console.log('━'.repeat(60));

  } catch (error) {
    console.error('\n❌ ERRO FATAL NA SINCRONIZAÇÃO:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
