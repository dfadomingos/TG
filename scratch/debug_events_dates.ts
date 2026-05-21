import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const events = await prisma.evento.findMany({
    where: { status: 'Publicado' },
    select: {
      titulo: true,
      data_horario: true
    },
    orderBy: { data_horario: 'desc' }
  });
  console.log('Publicado events:', JSON.stringify(events, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
