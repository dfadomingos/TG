import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nome, email, celular, senha, confirmacao_senha, aceitou_termos, receber_novidades } = body;

        //Validações
        if (!nome || nome.trim().length === 0) {
            return NextResponse.json({ error: 'Por favor, insira seu nome completo' }, { status: 400 });
        }

        if (!email || email.trim().length === 0) {
            return NextResponse.json({ error: 'Por favor, preencha o campo email' }, { status: 400 });
        }

        if (!email.includes('@')) {
            return NextResponse.json({ error: 'Por favor, insira um email válido' }, { status: 400 });
        }

        if (!celular || celular.trim().length === 0) {
            return NextResponse.json({ error: 'Por favor, preencha o campo celular' }, { status: 400 });
        }

        if (!senha || senha.length < 6) {
            return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres' }, { status: 400 });
        }

        if (senha !== confirmacao_senha) {
            return NextResponse.json({ error: 'As senhas não coincidem' }, { status: 400 });
        }

        if (!aceitou_termos) {
            return NextResponse.json({ error: 'Por favor, aceite os termos' }, { status: 400 });
        }

        //Verificar se usuário já existe
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email }
        });

        if (usuarioExistente) {
            return NextResponse.json({ error: 'Já existe um usuário cadastrado com este email.' }, { status: 400 });
        }

        //Criptografia
        const senhaHash = await bcrypt.hash(senha, 10);

        //Salvar no banco
        const novoUsuario = await prisma.usuario.create({
            data: {
                nome,
                email,
                celular,
                senha: senhaHash,
                aceitou_termos,
                receber_novidades: receber_novidades || false,
            },
        });

        return NextResponse.json(
            { message: 'Conta criada com sucesso!', id: novoUsuario.id },
            { status: 201 }
        );

    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        return NextResponse.json(
            { error: 'Erro interno ao processar cadastro' },
            { status: 500 }
        );
    }
}