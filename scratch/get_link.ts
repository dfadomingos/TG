import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const ev = await prisma.evento.findFirst({
    where: { link_compra: { contains: 'duoticket' } },
    select: { link_compra: true }
  });
  console.log(ev?.link_compra);
}
main().catch(console.error).finally(() => prisma.$disconnect());
