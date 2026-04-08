import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const organizador = await prisma.organizador.findUnique({
      where: { id },
    });

    if (!organizador) {
      return NextResponse.json({ error: 'Organizador não encontrado' }, { status: 404 });
    }

    // Remove a senha antes de retornar
    const { senha: _, ...organizadorSemSenha } = organizador;

    return NextResponse.json(organizadorSemSenha);
  } catch (error) {
    console.error('Erro ao carregar perfil do organizador:', error);
    return NextResponse.json({ error: 'Erro ao carregar perfil' }, { status: 500 });
  }
}
