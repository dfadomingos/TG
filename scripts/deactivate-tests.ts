import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const titlesToDeactivate = [
    'EVENTO TESTE - 2.0',
    'TESTE 2',
    'Show de Pop',
    'Show de Rock',
    'Teatro de Comédia',
    'Encontro de Carros Antigos',
    'Feira de Artesanato Local'
  ];

  const result = await prisma.evento.updateMany({
    where: {
      titulo: {
        in: titlesToDeactivate
      }
    },
    data: {
      status: 'Cancelado'
    }
  });

  console.log(`Sucesso: ${result.count} eventos foram desativados (Status: Cancelado).`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
