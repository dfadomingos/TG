import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const eventosCriados = await prisma.evento.findMany({
      where: { organizerId: id },
      orderBy: { data_horario: 'asc' },
    });

    return NextResponse.json(eventosCriados);
  } catch (error) {
    console.error('Erro ao carregar eventos do organizador:', error);
    return NextResponse.json({ error: 'Erro ao carregar seus eventos' }, { status: 500 });
  }
}