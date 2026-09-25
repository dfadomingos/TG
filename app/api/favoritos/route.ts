import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { usuarioId, organizadorId, eventoId } = await request.json();
    const id = usuarioId || organizadorId;

    if (!id || !eventoId) {
      return NextResponse.json(
        { error: 'ID do usuário/organizador e eventoId são obrigatórios' },
        { status: 400 }
      );
    }

    // Identifica se o ID pertence a um Usuario ou a um Organizador
    const isUsuario = await prisma.usuario.findUnique({ where: { id } });
    const isOrganizador = !isUsuario ? await prisma.organizador.findUnique({ where: { id } }) : null;

    if (!isUsuario && !isOrganizador) {
      return NextResponse.json(
        { error: 'Conta não encontrada' },
        { status: 404 }
      );
    }

    const whereClause = isUsuario
      ? { usuarioId_eventoId: { usuarioId: id, eventoId } }
      : { organizadorId_eventoId: { organizadorId: id, eventoId } };

    const favoritoExistente = await prisma.favorito.findUnique({
      where: whereClause,
    });

    if (favoritoExistente) {
      // Se já existe, remove (desfavoritar)
      await prisma.favorito.delete({
        where: { id: favoritoExistente.id },
      });
      return NextResponse.json({ favorited: false });
    } else {
      // Se não existe, cria (favoritar)
      await prisma.favorito.create({
        data: {
          usuarioId: isUsuario ? id : null,
          organizadorId: isOrganizador ? id : null,
          eventoId,
        },
      });
      return NextResponse.json({ favorited: true });
    }

  } catch (error) {
    console.error('Erro ao alternar favorito:', error);
    return NextResponse.json(
      { error: 'Erro ao processar favorito' },
      { status: 500 }
    );
  }
}

// GET — retorna os IDs dos eventos favoritados ou a lista completa de eventos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('usuarioId') || searchParams.get('userId') || searchParams.get('organizadorId');
    const includeEventos = searchParams.get('includeEventos') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const favoritos = await prisma.favorito.findMany({
      where: {
        OR: [
          { usuarioId: userId },
          { organizadorId: userId }
        ]
      },
      include: {
        evento: includeEventos,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (includeEventos) {
      return NextResponse.json({ favoritos });
    }

    const eventoIds = favoritos.map(f => f.eventoId);
    return NextResponse.json({ eventoIds });

  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar favoritos' },
      { status: 500 }
    );
  }
}
