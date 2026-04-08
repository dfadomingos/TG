"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { FormEvento, DadosEvento } from '../components/FormEvento';
import IconBack from '../components/IconBack';

export default function CadastroEventoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function handleSubmit(dados: DadosEvento) {
    setErro('');
    setSucesso('');
    setIsLoading(true);

    if (!user) {
      setErro('Você precisa estar logado para criar um evento.');
      setIsLoading(false);
      return;
    }

    // Combinar data + horário em um DateTime
    const dataHorario = dados.data && dados.horario
      ? new Date(`${dados.data}T${dados.horario}:00`).toISOString()
      : '';

    const payload = {
      titulo: dados.titulo,
      descricao: dados.descricao,
      categoria: dados.categoria,
      data_horario: dataHorario,
      endereco: dados.endereco,
      numero: dados.numero,
      bairro: dados.bairro,
      complemento: dados.complemento,
      cidade: dados.cidade,
      estado: dados.estado,
      cep: dados.cep,
      preco: parseFloat(dados.preco) || 0,
      link_compra: dados.link_compra,
      imagem: dados.imagem || '/imagens_teste/placeholder.png',
      organizerId: user.id,
    };

    try {
      const res = await fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setErro(responseData.error || 'Erro ao criar evento.');
        return;
      }

      setSucesso('Evento criado com sucesso!');
      setTimeout(() => {
        router.push('/painel-organizador');
      }, 1500);
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
          <div 
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, #FFFFFF 0%, #FFFFFF 20%, rgba(255,255,255,0.85) 40%, rgba(255,255,255,0.4) 70%, rgba(255,255,255,0) 100%)' }}
          />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 flex-grow flex flex-col items-center py-3 px-4 md:px-8">
          
          {/* Back Button */}
          <div className="w-full flex justify-start mb-4">
            <Link href="/painel-organizador" className="inline-flex items-center gap-1.5 bg-[#0A2342] text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-opacity-90 transition-all shadow-md">
              <IconBack className="w-5 h-5" fill="currentColor" />
              <span>Voltar</span>
            </Link>
          </div>

          {/* Form Card */}
          <div className="w-full max-w-[800px] bg-white rounded-[16px] shadow-2xl border border-gray-300 overflow-hidden flex flex-col mb-8">
            <FormEvento
              titulo="Cadastro de Evento"
              subtitulo="Preencha os dados do novo evento"
              textoBotaoSubmit="Salvar"
              textoLoading="Salvando..."
              onSubmit={handleSubmit}
              erro={erro}
              sucesso={sucesso}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
