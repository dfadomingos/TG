import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { usuarioId, eventoId } = await request.json();

    if (!usuarioId || !eventoId) {
      return NextResponse.json(
        { error: 'usuarioId e eventoId são obrigatórios' },
        { status: 400 }
      );
    }

    // Verifica se já existe o favorito
    const favoritoExistente = await prisma.favorito.findUnique({
      where: {
        usuarioId_eventoId: { usuarioId, eventoId },
      },
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
        data: { usuarioId, eventoId },
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

// GET — retorna os IDs dos eventos favoritados por um usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get('usuarioId');

    if (!usuarioId) {
      return NextResponse.json(
        { error: 'usuarioId é obrigatório' },
        { status: 400 }
      );
    }

    const favoritos = await prisma.favorito.findMany({
      where: { usuarioId },
      select: { eventoId: true },
    });

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
