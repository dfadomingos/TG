import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { email, senha } = await request.json();

        // Validação básica de preenchimento
        if (!email || !senha) {
            return NextResponse.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400 });
        }

        //verifica se o email existe como usuario        
        let conta: any | null = null; 
        let tipo = 'USUARIO';

        conta = await prisma.usuario.findUnique({ where: { email } });

        if (!conta) {
            conta = await prisma.organizador.findUnique({ where: { email } });
            tipo = 'ORGANIZADOR';
        }

        // Se não existe em nenhuma das tabelas
        if (!conta) {
            return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 });
        }

        // Compara a senha digitada com o Hash do banco
        const senhaValida = await bcrypt.compare(senha, conta.senha);

        if (!senhaValida) {
            return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 });
        }
        
        return NextResponse.json({
            message: 'Login realizado com sucesso!',
            user: {
                id: conta.id,
                nome: conta.nome,
                email: conta.email,
                tipo: tipo //O front vai usar isso para o redirecionamento
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Erro no login:', error);
        return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
    }
}