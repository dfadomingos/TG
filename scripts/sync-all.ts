/**
 * Script Orquestrador — Executa TODOS os scripts de sincronização em sequência.
 *
 * Ele roda cada sync como um subprocesso independente para evitar conflitos
 * de instâncias do Prisma e dos navegadores headless (Puppeteer).
 *
 * Execução manual:  npx tsx scripts/sync-all.ts
 * Execução via npm:  npm run sync
 */
import { execSync } from 'child_process';
import path from 'path';

// ─── Configuração ────────────────────────────────────────────
const SCRIPTS = [
  { nome: 'Q2 Ingressos', arquivo: 'sync-q2-to-db.ts' },
  { nome: 'Sympla',       arquivo: 'sync-sympla-to-db.ts' },
  { nome: 'DuoTicket',    arquivo: 'sync-duoticket-to-db.ts' },
];

// ─── Helpers ─────────────────────────────────────────────────
function timestamp(): string {
  return new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) return `${minutes}min ${remainingSeconds}s`;
  return `${remainingSeconds}s`;
}

// ─── Execução Principal ──────────────────────────────────────
interface SyncResult {
  nome: string;
  status: '✅ Sucesso' | '❌ Falhou';
  duracao: string;
  erro?: string;
}

async function main() {
  const globalStart = Date.now();

  console.log('\n' + '╔' + '═'.repeat(58) + '╗');
  console.log('║   🚀 SINCRONIZAÇÃO GERAL — EVENTOS FRANCA                ║');
  console.log('║   Executando todos os scrapers em sequência               ║');
  console.log('╚' + '═'.repeat(58) + '╝');
  console.log(`\n📅 Início: ${timestamp()}`);
  console.log(`📋 Scrapers configurados: ${SCRIPTS.length}\n`);

  const resultados: SyncResult[] = [];
  const projectRoot = path.resolve(__dirname, '..');

  for (let i = 0; i < SCRIPTS.length; i++) {
    const script = SCRIPTS[i];
    const scriptPath = path.join(__dirname, script.arquivo);
    const stepStart = Date.now();

    console.log('─'.repeat(60));
    console.log(`\n[${i + 1}/${SCRIPTS.length}] 🔄 Iniciando: ${script.nome}...`);
    console.log(`   Arquivo: scripts/${script.arquivo}`);
    console.log('');

    try {
      execSync(`npx tsx "${scriptPath}"`, {
        cwd: projectRoot,
        stdio: 'inherit',     // Mostra o output do script em tempo real
        timeout: 5 * 60 * 1000, // Timeout de 5 minutos por script
        env: { ...process.env }, // Herda variáveis de ambiente (.env já carregado)
      });

      const duracao = formatDuration(Date.now() - stepStart);
      resultados.push({ nome: script.nome, status: '✅ Sucesso', duracao });
      console.log(`\n   ✅ ${script.nome} finalizado em ${duracao}`);
    } catch (error) {
      const duracao = formatDuration(Date.now() - stepStart);
      const errorMsg = error instanceof Error ? error.message : String(error);
      resultados.push({ nome: script.nome, status: '❌ Falhou', duracao, erro: errorMsg });
      console.error(`\n   ❌ ${script.nome} FALHOU após ${duracao}`);
      console.error(`   Motivo: ${errorMsg.substring(0, 200)}`);
      // Continua para o próximo script mesmo se um falhar
    }

    // Pausa de 3s entre scrapers para dar tempo do navegador fechar completamente
    if (i < SCRIPTS.length - 1) {
      console.log('\n   ⏳ Aguardando 3s antes do próximo scraper...\n');
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  // ─── Relatório Final ───────────────────────────────────────
  const totalDuration = formatDuration(Date.now() - globalStart);
  const sucessos = resultados.filter((r) => r.status === '✅ Sucesso').length;
  const falhas = resultados.filter((r) => r.status === '❌ Falhou').length;

  console.log('\n\n' + '╔' + '═'.repeat(58) + '╗');
  console.log('║   📊 RELATÓRIO FINAL DA SINCRONIZAÇÃO                    ║');
  console.log('╚' + '═'.repeat(58) + '╝');
  console.log('');
  console.log('   Plataforma          Status           Duração');
  console.log('   ' + '─'.repeat(50));

  for (const r of resultados) {
    const nomeFormatado = r.nome.padEnd(20);
    const statusFormatado = r.status.padEnd(16);
    console.log(`   ${nomeFormatado} ${statusFormatado} ${r.duracao}`);
    if (r.erro) {
      console.log(`     └─ Erro: ${r.erro.substring(0, 120)}`);
    }
  }

  console.log('   ' + '─'.repeat(50));
  console.log(`   Total: ${sucessos} sucesso(s), ${falhas} falha(s)`);
  console.log(`   Tempo total: ${totalDuration}`);
  console.log(`   Finalizado em: ${timestamp()}`);
  console.log('');

  // Exit code não-zero se houve qualquer falha
  if (falhas > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('❌ Erro fatal no orquestrador:', err);
  process.exit(1);
});
