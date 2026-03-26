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
                {/* Image Upload */}
                <div className="flex flex-col gap-1 w-full mb-2">
                  <label className="text-gray-900 font-semibold text-sm">Capa do Evento:</label>
                  <label htmlFor="imagem-evento" className="flex flex-col items-center justify-center w-full h-40 md:h-48 border-2 border-dashed border-gray-400 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-[#0A2342] transition-colors cursor-pointer group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-10 h-10 mb-3 text-gray-400 group-hover:text-[#0A2342] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 group-hover:text-gray-700"><span className="font-semibold text-[#0A2342]">Clique para enviar</span> ou arraste a imagem</p>
                      <p className="text-xs text-gray-400">SVG, PNG, JPG ou GIF (MAX. 800x400px)</p>
                    </div>
                    <input id="imagem-evento" name="imagem" type="file" className="hidden" accept="image/*" />
                  </label>
                </div>

                {/* Title */}
                <Input name="titulo" label="Título do Evento" placeholder="Nome do seu evento" />

                {/* Category & Date & Time */}
                <div className="flex flex-col md:flex-row gap-4 w-full">
                  <div className="flex-[2]">
                    <Input name="categoria" label="Categoria" placeholder="Ex: Show, Palestra, Esporte" />
                  </div>
                  <div className="flex-1">
                    <Input name="data" label="Data" type="date" />
                  </div>
                  <div className="flex-1">
                    <Input name="horario" label="Horário" type="time" />
                  </div>
                </div>

                {/* Address Row 1 */}
                <div className="flex flex-col md:flex-row gap-4 w-full">
                  <div className="flex-1">
                    <Input name="cep" label="CEP" placeholder="00000-000" />
                  </div>
                  <div className="flex-[3]">
                    <Input name="endereco" label="Endereço" placeholder="Rua, Avenida, etc." />
                  </div>
                  <div className="flex-1">
                    <Input name="numero" label="Número" placeholder="123" />
                  </div>
                </div>

                {/* Address Row 2 */}
                <div className="flex flex-col md:flex-row gap-4 w-full">
                  <div className="flex-[2]">
                    <Input name="bairro" label="Bairro" placeholder="Nome do bairro" />
                  </div>
                  <div className="flex-[2]">
                    <Input name="cidade" label="Cidade" placeholder="Nome da cidade" defaultValue="Franca" />
                  </div>
                  <div className="flex-1">
                    <Input name="estado" label="Estado" placeholder="UF" defaultValue="SP" />
                  </div>
                </div>

                {/* Price and Link */}
                <div className="flex flex-col md:flex-row gap-4 w-full">
                  <div className="flex-[1]">
                    <Input name="preco" label="Preço do ingresso" type="number" step="0.01" placeholder="R$ 0,00" />
                  </div>
                  <div className="flex-[3]">
                    <Input name="link_compra" label="Link para compra" type="url" placeholder="https://..." />
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1 w-full">
                  <label htmlFor="desc-evento" className="text-gray-900 font-semibold text-sm">Descrição:</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-400 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                    <textarea
                      id="desc-evento"
                      name="descricao"
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
