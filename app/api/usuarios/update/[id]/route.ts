import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nome, email, celular, senha_atual, nova_senha, receber_novidades } = body;

    // Verifica se o usuário existe
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Validações básicas
    if (!nome || nome.trim().length === 0) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }
    if (!celular || celular.trim().length === 0) {
      return NextResponse.json({ error: 'Celular é obrigatório' }, { status: 400 });
    }

    // Se o email mudou, verificar duplicidade
    if (email !== usuario.email) {
      const emailExiste = await prisma.usuario.findUnique({ where: { email } });
      if (emailExiste) {
        return NextResponse.json({ error: 'Este email já está em uso' }, { status: 400 });
      }
    }

    // Montar dados de atualização
    const dadosAtualizacao: any = {
      nome,
      email,
      celular,
      receber_novidades: receber_novidades ?? usuario.receber_novidades,
    };

    // Se quer trocar a senha
    if (nova_senha && nova_senha.length > 0) {
      if (!senha_atual) {
        return NextResponse.json({ error: 'Informe a senha atual para alterá-la' }, { status: 400 });
      }
      const senhaValida = await bcrypt.compare(senha_atual, usuario.senha);
      if (!senhaValida) {
        return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 });
      }
      if (nova_senha.length < 6) {
        return NextResponse.json({ error: 'A nova senha deve ter pelo menos 6 caracteres' }, { status: 400 });
      }
      dadosAtualizacao.senha = await bcrypt.hash(nova_senha, 10);
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id },
      data: dadosAtualizacao,
    });

    return NextResponse.json({
      message: 'Dados atualizados com sucesso!',
      user: {
        id: usuarioAtualizado.id,
        nome: usuarioAtualizado.nome,
        email: usuarioAtualizado.email,
        celular: usuarioAtualizado.celular,
        receber_novidades: usuarioAtualizado.receber_novidades,
      },
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json({ error: 'Erro ao atualizar dados' }, { status: 500 });
  }
}
