import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.evento.delete({
    where: { id: 'cmpejas430002le1o0tr27ewt' }
  });
  console.log('Duplicate event deleted successfully.');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
