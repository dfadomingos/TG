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
    const { nome, email, celular, nome_produtora, cnpj, link_social, senha_atual, nova_senha } = body;

    // Verifica se o organizador existe
    const organizador = await prisma.organizador.findUnique({ where: { id } });
    if (!organizador) {
      return NextResponse.json({ error: 'Organizador não encontrado' }, { status: 404 });
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
    if (!nome_produtora || nome_produtora.trim().length === 0) {
      return NextResponse.json({ error: 'Nome da produtora é obrigatório' }, { status: 400 });
    }
    if (!cnpj || cnpj.trim().length === 0) {
      return NextResponse.json({ error: 'CNPJ é obrigatório' }, { status: 400 });
    }

    // Se o email mudou, verificar duplicidade
    if (email !== organizador.email) {
      const emailExiste = await prisma.organizador.findUnique({ where: { email } });
      if (emailExiste) {
        return NextResponse.json({ error: 'Este email já está em uso' }, { status: 400 });
      }
    }

    // Se o CNPJ mudou, verificar duplicidade
    if (cnpj !== organizador.cnpj) {
      const cnpjExiste = await prisma.organizador.findUnique({ where: { cnpj } });
      if (cnpjExiste) {
        return NextResponse.json({ error: 'Este CNPJ já está em uso' }, { status: 400 });
      }
    }

    // Montar dados de atualização
    const dadosAtualizacao: any = {
      nome,
      email,
      celular,
      nome_produtora,
      cnpj,
      link_social: link_social || null,
    };

    // Se quer trocar a senha
    if (nova_senha && nova_senha.length > 0) {
      if (!senha_atual) {
        return NextResponse.json({ error: 'Informe a senha atual para alterá-la' }, { status: 400 });
      }
      const senhaValida = await bcrypt.compare(senha_atual, organizador.senha);
      if (!senhaValida) {
        return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 });
      }
      if (nova_senha.length < 6) {
        return NextResponse.json({ error: 'A nova senha deve ter pelo menos 6 caracteres' }, { status: 400 });
      }
      dadosAtualizacao.senha = await bcrypt.hash(nova_senha, 10);
    }

    const organizadorAtualizado = await prisma.organizador.update({
      where: { id },
      data: dadosAtualizacao,
    });

    return NextResponse.json({
      message: 'Dados atualizados com sucesso!',
      user: {
        id: organizadorAtualizado.id,
        nome: organizadorAtualizado.nome,
        email: organizadorAtualizado.email,
        celular: organizadorAtualizado.celular,
        nome_produtora: organizadorAtualizado.nome_produtora,
        cnpj: organizadorAtualizado.cnpj,
        link_social: organizadorAtualizado.link_social,
      },
    });

  } catch (error) {
    console.error('Erro ao atualizar organizador:', error);
    return NextResponse.json({ error: 'Erro ao atualizar dados' }, { status: 500 });
  }
}
