"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Checkbox } from '../components/Checkbox';

import IconUser from '../components/IconUser';
import IconEmail from '../components/IconEmail';
import IconLock from '../components/IconLock';
import IconPhone from '../components/IconPhone';
import IconBack from '../components/IconBack';
import IconOrganizer from '../components/IconOrganizer';
import IconShare from '../components/IconShare';

export default function CadastroOrganizadorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    const payload = {
      nome: formData.get('nome') as string,
      email: formData.get('email') as string,
      celular: formData.get('celular') as string,
      senha: formData.get('senha') as string,
      confirmacao_senha: formData.get('confirmacao_senha') as string,
      nome_produtora: formData.get('nome_produtora') as string,
      cnpj: formData.get('cnpj') as string,
      link_social: formData.get('link_social') as string || '',
      aceitou_termos: formData.get('aceitou_termos') === 'on',
    };

    try {
      const res = await fetch('/api/organizadores/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || 'Erro ao criar conta.');
        return;
      }

      setSucesso(data.message || 'Conta criada com sucesso!');

      // Redireciona para o login após 2 segundos
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F8FAFC]">
      <Header />
      
      <main className="flex-grow relative flex flex-col">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="/imagens_teste/1773781867148_2.png" 
            alt="Eventos Background" 
            className="w-full h-full object-contain object-top"
          />
          {/* Gradient overlay: white from bottom to transparent at top */}
          <div 
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, #FFFFFF 0%, #FFFFFF 20%, rgba(255,255,255,0.85) 40%, rgba(255,255,255,0.4) 70%, rgba(255,255,255,0) 100%)' }}
          />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 flex-grow flex flex-col items-center py-3 px-4 md:px-8">
          
          {/* Back Button */}
          <div className="w-full mb-2 self-start">
            <Link href="/" className="inline-flex items-center gap-1.5 bg-[#0A2342] text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-opacity-90 transition-all shadow-md">
              <IconBack className="w-5 h-5" fill="currentColor" />
              <span>Voltar</span>
            </Link>
          </div>

          {/* Form Card */}
          <div className="w-full max-w-[640px] bg-white rounded-[16px] shadow-2xl border border-gray-300 overflow-hidden flex flex-col mb-4">
            
            {/* Tabs */}
            <div className="flex w-full h-11 md:h-[50px]">
              <Link href="/cadastro" className="flex-1 bg-[#D9D9D9] flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity cursor-pointer text-decoration-none">
                <div className="flex items-center gap-3">
                  <span className="text-[#1E293B] font-bold text-base md:text-xl">Para Usuários</span>
                  <IconUser className="w-4 h-4 md:w-6 md:h-6 hidden sm:block" fill="#1E293B" />
                </div>
              </Link>
              <div className="flex-1 bg-white flex items-center justify-center border-b-4 border-[#0A2342]">
                <div className="flex items-center gap-3">
                  <span className="text-[#1E293B] font-bold text-base md:text-xl line-clamp-1">Para Organizadores</span>
                  <IconOrganizer className="w-4 h-4 md:w-6 md:h-6 hidden sm:block" fill="#1E293B" />
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex flex-col items-center px-4 py-3 md:px-12 md:py-5">
              <h1 className="text-[#1E293B] font-bold text-xl md:text-3xl mb-0.5 text-center">Crie sua conta</h1>
              <p className="text-[#1E293B] font-light text-sm md:text-lg mb-3 md:mb-4 text-center">Divulgue seus eventos</p>

              {/* Mensagens de feedback */}
              {erro && (
                <div className="w-full max-w-[520px] mb-3 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{erro}</span>
                </div>
              )}
              {sucesso && (
                <div className="w-full max-w-[520px] mb-3 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium flex items-center gap-2">
                  <span>✅</span>
                  <span>{sucesso}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="w-full max-w-[520px] flex flex-col gap-2.5 md:gap-3">
                <Input
                  name="nome"
                  label="Nome Completo" 
                  placeholder="Seu nome" 
                  icon={<IconUser className="w-full h-full" fill="#000000" />} 
                  required
                />
                
                <div className="flex flex-col md:flex-row gap-2.5 md:gap-3 w-full">
                  <div className="flex-1">
                    <Input
                      name="nome_produtora"
                      label="Nome Produtora" 
                      placeholder="Nome produtora" 
                      icon={<IconOrganizer className="w-full h-full" fill="#000000" />} 
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      name="cnpj"
                      label="CNPJ" 
                      placeholder="00.000.000/0000-00" 
                      icon={<IconOrganizer className="w-full h-full" fill="#000000" />} 
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-2.5 md:gap-3 w-full">
                  <div className="flex-1">
                    <Input
                      name="email"
                      label="Email" 
                      type="email"
                      placeholder="seu@email.com" 
                      icon={<IconEmail className="w-full h-full" fill="#000000" />} 
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      name="celular"
                      label="Celular" 
                      type="tel"
                      placeholder="(00)00000-0000" 
                      icon={<IconPhone className="w-full h-full" fill="#000000" />} 
                      required
                    />
                  </div>
                </div>

                <Input
                  name="link_social"
                  label="Link Rede Social / Site" 
                  type="url"
                  placeholder="https://..." 
                  icon={<IconShare className="w-full h-full" fill="#000000" />} 
                />

                <div className="flex flex-col md:flex-row gap-2.5 md:gap-3 w-full">
                  <div className="flex-1">
                    <Input
                      name="senha"
                      label="Senha" 
                      type="password"
                      placeholder="Digite sua senha" 
                      icon={<IconLock className="w-full h-full" fill="#000000" />} 
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      name="confirmacao_senha"
                      label="Confirma Senha" 
                      type="password"
                      placeholder="Digite sua senha" 
                      icon={<IconLock className="w-full h-full" fill="#000000" />} 
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex flex-col gap-2 mt-1 pt-3 md:pt-3 border-t border-black/30">
                  <Checkbox
                    name="aceitou_termos"
                    label="Declaro que li os Termos de Uso e me responsabilizo pela veracidade das informações e eventos publicados no FrancaEventos" 
                    required 
                  />
                </div>

                {/* Submit Action */}
                <div className="mt-3 mb-1">
                  <Button 
                    type="submit" 
                    variant="accent" 
                    fullWidth 
                    className={`h-10 md:h-[44px] text-base md:text-lg shadow-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    disabled={isLoading}
                  >
                    <div className="flex items-center justify-center gap-4 w-full h-full">
                      <span>{isLoading ? 'Cadastrando...' : 'Cadastrar'}</span>
                      {!isLoading && (
                        <svg width="24" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12H19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </Button>
                </div>

                {/* Login Link */}
                <div className="text-center rounded-b-[16px] bg-white pb-1">
                  <span className="text-[#1E293B] text-sm md:text-base font-light">Já tem uma conta? </span>
                  <Link href="/login" className="text-[#F59E0B] text-sm md:text-base font-medium hover:underline ml-1">
                    Faça Login
                  </Link>
                </div>
              </form>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
