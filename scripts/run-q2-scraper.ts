/**
 * Script para executar o Q2 Service e salvar resultado para análise.
 *
 * Execução:  npx tsx scripts/run-q2-scraper.ts
 */
import {
  getQ2EventsPuppeteer,
  getQ2EventsPreExtracted,
  normalizeQ2Event,
  Q2EventRaw,
  Q2EventNormalized,
} from '../app/services/q2Service';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const startTime = Date.now();

  console.log('━'.repeat(60));
  console.log('🎫 Q2 INGRESSOS SCRAPER - Franca/SP');
  console.log('━'.repeat(60));

  // 1. Tenta via Puppeteer (extração real)
  console.log('\n🚀 Tentativa 1: Puppeteer (headless browser)...');
  let eventosRaw: Q2EventRaw[] = [];

  try {
    eventosRaw = await getQ2EventsPuppeteer('Franca');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`⚠️  Puppeteer falhou: ${msg}`);
  }

  // 2. Fallback: usa dados pré-extraídos
  if (eventosRaw.length === 0) {
    console.log('\n📋 Fallback: Usando dados pré-extraídos...');
    eventosRaw = getQ2EventsPreExtracted();
    console.log(`   ✅ ${eventosRaw.length} evento(s) carregados`);
  }

  // 3. Normaliza todos os eventos
  console.log('\n🔄 Normalizando dados para formato Prisma...');
  const eventosNormalizados: Q2EventNormalized[] = eventosRaw.map(normalizeQ2Event);

  // 4. Log detalhado
  console.log('\n' + '─'.repeat(60));
  console.log('📊 EVENTOS EXTRAÍDOS:');
  console.log('─'.repeat(60));

  eventosNormalizados.forEach((ev, idx) => {
    console.log(`\n  ${idx + 1}. "${ev.titulo}"`);
    console.log(`     📅 Data:      ${ev.data_horario?.toLocaleDateString('pt-BR') || 'N/A'}`);
    console.log(`     📍 Endereço:  ${ev.endereco}, ${ev.numero || 'S/N'}`);
    console.log(`     🏘️  Bairro:    ${ev.bairro}`);
    console.log(`     🏙️  Cidade:    ${ev.cidade}/${ev.estado} - CEP: ${ev.cep || 'N/A'}`);
    console.log(`     🗺️  Maps:      ${ev.local_link || 'N/A'}`);
    console.log(`     🏷️  Categoria: ${ev.categoria_sugerida}`);
    console.log(`     💰 Preço:     R$ ${ev.preco.toFixed(2)}`);
    console.log(`     🔗 Link:      ${ev.link_compra}`);
    console.log(`     📝 Descrição: ${ev.descricao.substring(0, 80)}${ev.descricao.length > 80 ? '...' : ''}`);
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // 5. Prepara output limpo — só o necessário
  const output = {
    fonte: 'Q2 Ingressos',
    dataExtracao: new Date().toISOString(),
    total: eventosNormalizados.length,
    eventos: eventosNormalizados.map((ev) => ({
      titulo: ev.titulo,
      descricao: ev.descricao,
      categoria: ev.categoria_sugerida,
      data_horario: ev.data_horario?.toISOString() || null,
      endereco: ev.endereco,
      numero: ev.numero,
      bairro: ev.bairro,
      complemento: ev.complemento,
      cidade: ev.cidade,
      estado: ev.estado,
      cep: ev.cep,
      preco: ev.preco,
      link_compra: ev.link_compra,
      imagem: ev.imagem || null,
    })),
  };

  // 6. Salva resultado
  const outputDir = path.resolve(__dirname, '..', 'app', 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'q2-scraper-resultado.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log('\n' + '━'.repeat(60));
  console.log('📊 RESUMO');
  console.log(`   Total de eventos: ${eventosRaw.length}`);
  console.log(`   Tempo: ${elapsed}s`);
  console.log(`   Arquivo: ${outputPath}`);
  console.log('━'.repeat(60));
}

main().catch((err) => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
