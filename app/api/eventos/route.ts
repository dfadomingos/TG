import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria');
    
    const eventos = await prisma.evento.findMany({
      where: {
        status: 'Publicado',
        data_horario: {
          gte: new Date(), // Somente eventos futuros
        },
        ...(categoria && { categoria: categoria as any }),
      },
      include: {
        organizer: {
          select: {
            nome: true,
            nome_produtora: true,
          },
        },
      },
      orderBy: {
        data_horario: 'asc', // Eventos mais próximos primeiro
      },
    });

    return NextResponse.json(eventos);
    
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    return NextResponse.json(
      { error: 'Erro ao carregar eventos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      titulo, descricao, categoria, data_horario,
      endereco, numero, bairro, complemento, cidade, estado, cep,
      preco, link_compra, imagem, organizerId,
    } = body;

    // Validações básicas
    if (!titulo || !descricao || !categoria || !data_horario || !endereco || !bairro || !imagem || !organizerId) {
      return NextResponse.json(
        { error: 'Preencha todos os campos obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o organizador existe
    const organizador = await prisma.organizador.findUnique({ where: { id: organizerId } });
    if (!organizador) {
      return NextResponse.json({ error: 'Organizador não encontrado' }, { status: 404 });
    }

    const evento = await prisma.evento.create({
      data: {
        titulo,
        descricao,
        categoria,
        data_horario: new Date(data_horario),
        endereco,
        numero: numero || null,
        bairro,
        complemento: complemento || null,
        cidade: cidade || 'Franca',
        estado: estado || 'SP',
        cep: cep || null,
        preco: parseFloat(preco) || 0,
        link_compra: link_compra || null,
        imagem,
        organizerId,
      },
    });

    return NextResponse.json({
      message: 'Evento criado com sucesso!',
      evento,
    }, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar evento:", error);
    return NextResponse.json(
      { error: 'Erro ao criar evento' },
      { status: 500 }
    );
  }
}