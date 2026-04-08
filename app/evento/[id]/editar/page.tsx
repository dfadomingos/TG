"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { FormEvento, DadosEvento } from '@/app/components/FormEvento';
import IconBack from '@/app/components/IconBack';

export default function EditarEventoPage() {
  const router = useRouter();
  const params = useParams();
  const eventoId = params.id as string;
  const { isLoggedIn, user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [dadosIniciais, setDadosIniciais] = useState<Partial<DadosEvento>>({});

  // Buscar dados do evento
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    async function fetchEvento() {
      try {
        const res = await fetch(`/api/eventos/${eventoId}`);
        if (!res.ok) {
          setErro('Evento não encontrado.');
          setIsLoadingData(false);
          return;
        }

        const evento = await res.json();

        // Separar data e horário do data_horario
        let dataStr = '';
        let horarioStr = '';
        if (evento.data_horario) {
          const dt = new Date(evento.data_horario);
          const ano = dt.getFullYear();
          const mes = String(dt.getMonth() + 1).padStart(2, '0');
          const dia = String(dt.getDate()).padStart(2, '0');
          dataStr = `${ano}-${mes}-${dia}`;
          const horas = String(dt.getHours()).padStart(2, '0');
          const minutos = String(dt.getMinutes()).padStart(2, '0');
          horarioStr = `${horas}:${minutos}`;
        }

        setDadosIniciais({
          titulo: evento.titulo || '',
          descricao: evento.descricao || '',
          categoria: evento.categoria || '',
          data: dataStr,
          horario: horarioStr,
          imagem: evento.imagem || '',
          endereco: evento.endereco || '',
          numero: evento.numero || '',
          bairro: evento.bairro || '',
          complemento: evento.complemento || '',
          cidade: evento.cidade || 'Franca',
          estado: evento.estado || 'SP',
          cep: evento.cep || '',
          preco: evento.preco?.toString() || '0',
          link_compra: evento.link_compra || '',
        });
      } catch (error) {
        console.error('Erro ao carregar evento:', error);
        setErro('Erro ao carregar dados do evento.');
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchEvento();
  }, [isLoggedIn, router, eventoId]);

  async function handleSubmit(dados: DadosEvento) {
    setErro('');
    setSucesso('');
    setIsLoading(true);

    if (!user) {
      setErro('Você precisa estar logado.');
      setIsLoading(false);
      return;
    }

    // Combinar data + horário
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
      preco: dados.preco,
      link_compra: dados.link_compra,
      imagem: dados.imagem,
    };

    try {
      const res = await fetch(`/api/eventos/${eventoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setErro(responseData.error || 'Erro ao atualizar evento.');
        return;
      }

      setSucesso('Evento atualizado com sucesso!');
      setTimeout(() => {
        router.push('/painel-organizador');
      }, 1500);
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-[#F8FAFC]">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-gray-500">Carregando dados do evento...</p>
        </main>
        <Footer />
      </div>
    );
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
              titulo="Editar Evento"
              subtitulo="Atualize os dados do seu evento"
              textoBotaoSubmit="Salvar Alterações"
              textoLoading="Salvando..."
              dadosIniciais={dadosIniciais}
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
