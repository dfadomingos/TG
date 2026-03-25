import React from 'react';
import Link from 'next/link';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import IconBack from '../components/IconBack';

export default function CadastroEventoPage() {
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
            
            {/* Form Content */}
            <div className="flex flex-col items-center px-4 py-6 md:px-12 md:py-8">
              <h1 className="text-[#1E293B] font-bold text-xl md:text-3xl mb-1 text-center">Cadastro de Evento</h1>
              <p className="text-[#1E293B] font-light text-sm md:text-lg mb-6 text-center">Preencha os dados do novo evento</p>

              <form className="w-full flex flex-col gap-4">
                {/* Title */}
                <Input label="Titulo do Evento" placeholder="Nome do seu evento" />

                {/* Category & Date & Time */}
                <div className="flex flex-col md:flex-row gap-4 w-full">
                  <div className="flex-[2]">
                    <Input label="Categoria" placeholder="Ex: Show, Palestra, Esporte" />
                  </div>
                  <div className="flex-1">
                    <Input label="Data" type="date" />
                  </div>
                  <div className="flex-1">
                    <Input label="Horário" type="time" />
                  </div>
                </div>

                {/* Address Row 1 */}
                <div className="flex flex-col md:flex-row gap-4 w-full">
                  <div className="flex-[3]">
                    <Input label="Endereço" placeholder="Rua, Avenida, etc." />
                  </div>
                  <div className="flex-1">
                    <Input label="Número" placeholder="123" />
                  </div>
                </div>

                {/* Address Row 2 & Price */}
                <div className="flex flex-col md:flex-row gap-4 w-full">
                  <div className="flex-[2]">
                    <Input label="Bairro" placeholder="Nome do bairro" />
                  </div>
                  <div className="flex-1">
                    <Input label="Preço do ingresso" type="number" step="0.01" placeholder="R$ 0,00" />
                  </div>
                </div>

                {/* Link */}
                <Input label="Link para compra" type="url" placeholder="https://..." />

                {/* Description */}
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-gray-900 font-semibold text-sm">Descrição:</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-400 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                    <textarea 
                      className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400 min-h-[120px] resize-y"
                      placeholder="Descreva os detalhes do evento..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                  <Link href="/painel-organizador" className="w-full sm:w-auto">
                    <Button type="button" variant="secondary" fullWidth className="h-10 md:h-[44px]">
                      Cancelar
                    </Button>
                  </Link>
                  <Button type="submit" variant="primary" className="w-full sm:w-auto h-10 md:h-[44px]">
                    Salvar
                  </Button>
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
