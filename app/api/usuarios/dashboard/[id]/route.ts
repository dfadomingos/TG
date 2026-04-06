import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const dadosUsuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        favoritos: {
          include: {
            evento: true, // traz os dados completos do evento
          },
        },
      },
    });

    if (!dadosUsuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Remove a senha antes de retornar
    const { senha: _, ...usuarioSemSenha } = dadosUsuario;

    return NextResponse.json(usuarioSemSenha);
  } catch (error) {
    console.error('Erro ao carregar painel:', error);
    return NextResponse.json({ error: 'Erro ao carregar painel' }, { status: 500 });
  }
}