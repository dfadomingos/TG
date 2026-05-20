import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const eventos = await prisma.evento.findMany({
    where: { bairro: 'null' } // Procurando a string literal 'null'
  });

  let updated = 0;
  for (const ev of eventos) {
    await prisma.evento.update({
      where: { id: ev.id },
      data: { bairro: null }
    });
    updated++;
    console.log(`Corrigido "${ev.titulo}": string 'null' alterada para null real.`);
  }

  const ninyEvent = await prisma.evento.findFirst({
    where: { titulo: { contains: 'Niny Magalhães', mode: 'insensitive' } }
  });
  
  if (ninyEvent) {
    await prisma.evento.delete({
      where: { id: ninyEvent.id }
    });
    console.log(`Evento "Niny Magalhães" foi deletado com sucesso (cancelado).`);
  }

  console.log(`Total corrigidos: ${updated}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
