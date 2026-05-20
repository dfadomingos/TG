import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const evs = await prisma.evento.findMany({
    where: { link_compra: { contains: 'q2ingressos' } },
    select: { titulo: true, endereco: true, complemento: true, bairro: true }
  });
  console.dir(evs, { maxArrayLength: null });
}
main().catch(console.error).finally(() => prisma.$disconnect());
