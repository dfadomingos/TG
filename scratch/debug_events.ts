import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const events = await prisma.evento.findMany({
    take: 10,
    select: {
      id: true,
      titulo: true,
      data_horario: true,
      status: true,
      endereco: true,
      bairro: true
    }
  });
  console.log('First 10 events:', JSON.stringify(events, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
