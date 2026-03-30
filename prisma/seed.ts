import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seed...');

  // 1. Limpeza de dados
  await prisma.favorito.deleteMany();
  await prisma.evento.deleteMany();
  await prisma.organizador.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('Banco de dados limpo.');

  // 2. Cria Senha Hash
  const salt = await bcrypt.genSalt(10);
  const senhaHash = await bcrypt.hash('Franca123', salt);

  // 3. Cria Usuário Comum
  const usuario = await prisma.usuario.create({
    data: {
      nome: 'Usuário teste',
      email: 'teste@email.com',
      celular: '16999999999',
      senha: senhaHash,
      aceitou_termos: true,
      receber_novidades: true,
    },
  });

  // 4. Cria Organizador
  const organizador = await prisma.organizador.create({
    data: {
      nome: 'Organizador teste',
      email: 'organizador@email.com',
      celular: '1637119000',
      senha: senhaHash,
      nome_produtora: 'Organizador teste',
      cnpj: '47.122.493/0001-46',
      aceitou_termos: true,
    },
  });

  console.log('Usuários e Organizadores criados.');

  // 5. Cria Eventos em Franca (dados do eventosTeste.ts)
  const evento1 = await prisma.evento.create({
    data: {
      titulo: 'Show de Pop',
      descricao: 'Um grande show de pop com artistas nacionais e internacionais. Venha curtir uma noite inesquecível!',
      categoria: 'Show',
      data_horario: new Date('2026-05-20T19:00:00Z'),
      status: 'Publicado',
      destaque: true,
      endereco: 'Av. Brasil',
      numero: '1500',
      bairro: 'Centro',
      cidade: 'Franca',
      estado: 'SP',
      cep: '14400-000',
      preco: 50.0,
      link_compra: 'https://ingressos.example.com/show-pop',
      imagem: '/imagens_teste/image1.png',
      organizerId: organizador.id,
    },
  });

  const evento2 = await prisma.evento.create({
    data: {
      titulo: 'Show de Rock',
      descricao: 'Rock pesado e clássico para os amantes do gênero. Bandas locais e convidados especiais.',
      categoria: 'Show',
      data_horario: new Date('2026-06-15T19:00:00Z'),
      status: 'Publicado',
      endereco: 'Rua General Osório',
      numero: '320',
      bairro: 'Vila Santa Cruz',
      complemento: 'Teatro Municipal',
      cidade: 'Franca',
      estado: 'SP',
      cep: '14401-100',
      preco: 0,
      imagem: '/imagens_teste/image2.png',
      organizerId: organizador.id,
    },
  });

  const evento3 = await prisma.evento.create({
    data: {
      titulo: 'Teatro de Comédia',
      descricao: 'Uma peça hilária com o grupo de teatro local. Risos garantidos para toda a família!',
      categoria: 'Teatro',
      data_horario: new Date('2026-10-10T19:00:00Z'),
      status: 'Publicado',
      endereco: 'Rua Voluntários da Franca',
      numero: '100',
      bairro: 'Centro',
      complemento: 'Espaço Cultural',
      cidade: 'Franca',
      estado: 'SP',
      cep: '14400-500',
      preco: 30.0,
      link_compra: 'https://ingressos.example.com/teatro-comedia',
      imagem: '/imagens_teste/image3.png',
      organizerId: organizador.id,
    },
  });

  const evento4 = await prisma.evento.create({
    data: {
      titulo: 'Encontro de Carros Antigos',
      descricao: 'Exposição de carros antigos com entrada solidária. Traga 1kg de alimento não perecível.',
      categoria: 'Exposicao',
      data_horario: new Date('2026-11-15T10:00:00Z'),
      status: 'Publicado',
      destaque: true,
      endereco: 'Parque Fernando Costa',
      bairro: 'Jardim Petráglia',
      cidade: 'Franca',
      estado: 'SP',
      cep: '14405-000',
      preco: 0,
      imagem: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1000&auto=format&fit=crop',
      organizerId: organizador.id,
    },
  });

  const evento5 = await prisma.evento.create({
    data: {
      titulo: 'Feira de Artesanato Local',
      descricao: 'Artesanato regional com produtos únicos. Acontece todos os finais de semana na Praça Central.',
      categoria: 'Outros',
      data_horario: new Date('2026-07-01T08:00:00Z'),
      status: 'Publicado',
      endereco: 'Praça Nossa Senhora da Conceição',
      bairro: 'Centro',
      complemento: 'Praça Central',
      cidade: 'Franca',
      estado: 'SP',
      cep: '14400-010',
      preco: 0,
      imagem: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?q=80&w=1000&auto=format&fit=crop',
      organizerId: organizador.id,
    },
  });

  console.log(`5 eventos criados: ${evento1.id}, ${evento2.id}, ${evento3.id}, ${evento4.id}, ${evento5.id}`);

  // 6. Cria Favoritos (Relacionando o usuário aos 2 primeiros eventos)
  await prisma.favorito.createMany({
    data: [
      { usuarioId: usuario.id, eventoId: evento1.id },
      { usuarioId: usuario.id, eventoId: evento2.id },
    ],
  });

  console.log('Favoritos de teste criados.');
  console.log('Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });