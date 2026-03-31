import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { nome, email, celular, senha, confirmacao_senha, nome_produtora, cnpj, link_social, aceitou_termos } = await request.json();

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

        if (!nome_produtora || nome_produtora.trim().length === 0) {
            return NextResponse.json({ error: 'Por favor, insira o nome da produtora' }, { status: 400 });
        }

        if (!cnpj || cnpj.trim().length === 0) {
            return NextResponse.json({ error: 'Por favor, insira o CNPJ' }, { status: 400 });
        }    
        
        if (link_social && link_social.trim() !== "") {
            if (!link_social.startsWith('http')) {
                return NextResponse.json(
                    { error: 'O link social deve ser um URL válido (começando com http:// ou https://)' },
                    { status: 400 }
                );
            }
        }

        if (!aceitou_termos) {
            return NextResponse.json({ error: 'Por favor, aceite os termos' }, { status: 400 });
        }

        const linkSocialFinal = link_social && link_social.trim() !== "" 
            ? link_social.trim() 
            : null;

        //Verificar se organizador já existe
        const organizadorExistente = await prisma.organizador.findUnique({
            where: { email }
        });

        const emailExistente = await prisma.usuario.findUnique({
            where: { email }
        });

        if (organizadorExistente || emailExistente) {
            return NextResponse.json({ error: 'Já existe uma conta cadastrada com este email.' }, { status: 400 });
        }        

        //Criptografia
        const senhaHash = await bcrypt.hash(senha, 10);

        //Salvar no banco
        const novoOrganizador = await prisma.organizador.create({
            data: {
                nome,
                email,
                celular,
                senha: senhaHash,
                aceitou_termos,
                nome_produtora,
                cnpj,
                link_social: linkSocialFinal,
            },
        });

        return NextResponse.json(
            { message: 'Conta criada com sucesso!', id: novoOrganizador.id },
            { status: 201 }
        );

    } catch (error) {
        console.error('Erro ao criar organizador:', error);
        return NextResponse.json(
            { error: 'Erro interno ao processar cadastro' },
            { status: 500 }
        );
    }
}