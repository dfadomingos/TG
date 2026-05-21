import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const events = await prisma.evento.findMany({
    where: {
      titulo: {
        contains: 'Resenha do boteco da Villa',
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      titulo: true,
      link_compra: true,
      status: true,
      endereco: true,
      data_horario: true
    }
  });
  console.log('Repeated events:', JSON.stringify(events, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
