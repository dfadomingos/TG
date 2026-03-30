import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria');
    
    const eventos = await prisma.evento.findMany({
      where: {
        status: 'Publicado',
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