import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const eventos = await prisma.evento.findMany({
    where: {
      link_compra: {
        contains: 'duoticket.com.br'
      }
    },
    select: {
      titulo: true,
      descricao: true,
      data_horario: true
    }
  });

  console.log(`Encontrados ${eventos.length} eventos do DuoTicket no banco:\n`);
  for (const ev of eventos) {
    console.log(`Título: ${ev.titulo}`);
    console.log(`Data/Hora Banco: ${ev.data_horario?.toISOString()}`);
    // Mostra as primeiras 300 letras da descrição
    console.log(`Descrição (resumo): ${ev.descricao.slice(0, 300)}...`);
    console.log('-'.repeat(50));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
