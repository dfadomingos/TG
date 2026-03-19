import React from 'react';
import Link from 'next/link';
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

export default function CadastroPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F8FAFC]">
      <Header />
      
      <main className="flex-grow relative flex flex-col">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0 bg-gray-900 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Eventos Background" 
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 flex-grow flex flex-col items-center py-6 px-4 md:px-8">
          
          {/* Back Button */}
          <div className="w-full max-w-6xl mb-6">
            <Link href="/" className="inline-flex items-center gap-2 bg-[#0A2342] text-white px-5 py-2.5 rounded-full font-bold hover:bg-opacity-90 transition-all shadow-md">
              <IconBack className="w-5 h-5" fill="currentColor" />
              <span>Voltar</span>
            </Link>
          </div>

          {/* Form Card */}
          <div className="w-full max-w-[1084px] bg-white rounded-[20px] shadow-2xl border border-gray-300 overflow-hidden flex flex-col mb-12">
            
            {/* Tabs */}
            <div className="flex w-full h-20 md:h-[109px]">
              <div className="flex-1 bg-white flex items-center justify-center border-b-4 border-[#0A2342]">
                <div className="flex items-center gap-3">
                  <span className="text-[#1E293B] font-bold text-xl md:text-3xl">Para Usuários</span>
                  <IconUser className="w-6 h-6 md:w-10 md:h-10 hidden sm:block" fill="#1E293B" />
                </div>
              </div>
              <div className="flex-1 bg-[#D9D9D9] flex items-center justify-center opacity-70 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <span className="text-[#1E293B] font-bold text-xl md:text-3xl line-clamp-1">Para Organizadores</span>
                  <IconUser className="w-6 h-6 md:w-10 md:h-10 hidden sm:block" fill="#1E293B" />
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex flex-col items-center px-4 py-8 md:px-24 md:py-12">
              <h1 className="text-[#1E293B] font-bold text-3xl md:text-5xl mb-2 text-center">Crie sua conta</h1>
              <p className="text-[#1E293B] font-light text-lg md:text-[25px] mb-8 md:mb-12 text-center">Favorite seus eventos</p>

              <form className="w-full max-w-[893px] flex flex-col gap-6 md:gap-8">
                <Input 
                  label="Nome Completo" 
                  placeholder="Seu nome" 
                  icon={<IconUser className="w-full h-full" fill="#000000" />} 
                />
                
                <Input 
                  label="Email" 
                  type="email"
                  placeholder="seu@email.com" 
                  icon={<IconEmail className="w-full h-full" fill="#000000" />} 
                />
                
                <Input 
                  label="Celular" 
                  type="tel"
                  placeholder="(00)00000-0000" 
                  icon={<IconPhone className="w-full h-full" fill="#000000" />} 
                />

                <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full">
                  <div className="flex-1">
                    <Input 
                      label="Senha" 
                      type="password"
                      placeholder="Digite sua senha" 
                      icon={<IconLock className="w-full h-full" fill="#000000" />} 
                    />
                  </div>
                  <div className="flex-1">
                    <Input 
                      label="Confirma Senha" 
                      type="password"
                      placeholder="Digite sua senha" 
                      icon={<IconLock className="w-full h-full" fill="#000000" />} 
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex flex-col gap-4 mt-2 md:mt-4 pt-6 md:pt-8 border-t border-black/30">
                  <Checkbox 
                    label="Li e aceito os Termos de Uso e a Política de Privacidade (obrigatório)" 
                    required 
                  />
                  <Checkbox 
                    label="Desejo receber novidades sobre os eventos de Franca (opcional)" 
                  />
                </div>

                {/* Submit Action */}
                <div className="mt-6 md:mt-8 mb-4">
                  <Button variant="accent" fullWidth className="h-14 md:h-[63px] text-xl md:text-2xl shadow-lg">
                    <div className="flex items-center justify-center gap-4 w-full h-full">
                      <span>Cadastrar</span>
                      <svg width="32" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </Button>
                </div>

                {/* Login Link */}
                <div className="text-center rounded-b-[20px] bg-white pb-4">
                  <span className="text-[#1E293B] text-lg md:text-[25px] font-light">Já tem uma conta? </span>
                  <Link href="/login" className="text-[#F59E0B] text-lg md:text-[25px] font-medium hover:underline ml-2">
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
