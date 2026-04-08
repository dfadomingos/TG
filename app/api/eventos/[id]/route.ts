import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const evento = await prisma.evento.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            nome: true,
            nome_produtora: true,
          },
        },
      },
    });

    if (!evento) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 });
    }

    return NextResponse.json(evento);
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    return NextResponse.json({ error: 'Erro ao buscar evento' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verificar se o evento existe
    const eventoExistente = await prisma.evento.findUnique({ where: { id } });
    if (!eventoExistente) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 });
    }

    const {
      titulo, descricao, categoria, data_horario,
      endereco, numero, bairro, complemento, cidade, estado, cep,
      preco, link_compra, imagem,
    } = body;

    // Validações básicas
    if (!titulo || titulo.trim().length === 0) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 });
    }
    if (!descricao || descricao.trim().length === 0) {
      return NextResponse.json({ error: 'Descrição é obrigatória' }, { status: 400 });
    }
    if (!categoria) {
      return NextResponse.json({ error: 'Categoria é obrigatória' }, { status: 400 });
    }
    if (!data_horario) {
      return NextResponse.json({ error: 'Data e horário são obrigatórios' }, { status: 400 });
    }
    if (!endereco || endereco.trim().length === 0) {
      return NextResponse.json({ error: 'Endereço é obrigatório' }, { status: 400 });
    }
    if (!bairro || bairro.trim().length === 0) {
      return NextResponse.json({ error: 'Bairro é obrigatório' }, { status: 400 });
    }

    const eventoAtualizado = await prisma.evento.update({
      where: { id },
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
        ...(imagem && { imagem }), // Só atualiza imagem se foi enviada
      },
    });

    return NextResponse.json({
      message: 'Evento atualizado com sucesso!',
      evento: eventoAtualizado,
    });

  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    return NextResponse.json({ error: 'Erro ao atualizar evento' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar se o evento existe
    const evento = await prisma.evento.findUnique({ where: { id } });
    if (!evento) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 });
    }

    // Deletar favoritos associados primeiro, depois o evento
    await prisma.$transaction([
      prisma.favorito.deleteMany({ where: { eventoId: id } }),
      prisma.evento.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: 'Evento removido com sucesso!' });

  } catch (error) {
    console.error('Erro ao remover evento:', error);
    return NextResponse.json({ error: 'Erro ao remover evento' }, { status: 500 });
  }
}
