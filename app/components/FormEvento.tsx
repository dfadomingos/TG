"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { CategoriaEvento, CATEGORIA_LABELS } from '../types';

// Opções do Select geradas a partir do enum
const categoriaOptions = Object.values(CategoriaEvento).map((value) => ({
  value,
  label: CATEGORIA_LABELS[value],
}));

export interface DadosEvento {
  titulo: string;
  descricao: string;
  categoria: string;
  data: string;
  horario: string;
  endereco: string;
  numero: string;
  bairro: string;
  complemento: string;
  cidade: string;
  estado: string;
  cep: string;
  preco: string;
  link_compra: string;
  imagem: string;
}

interface FormEventoProps {
  /** Título exibido no topo do formulário */
  titulo: string;
  /** Subtítulo exibido abaixo do título */
  subtitulo: string;
  /** Texto do botão de submit */
  textoBotaoSubmit?: string;
  /** Texto exibido no botão durante o loading */
  textoLoading?: string;
  /** Dados iniciais para preencher o formulário (modo edição) */
  dadosIniciais?: Partial<DadosEvento>;
  /** Callback chamado ao submeter o formulário */
  onSubmit: (dados: DadosEvento) => Promise<void>;
  /** Mensagem de erro vinda do pai */
  erro?: string;
  /** Mensagem de sucesso vinda do pai */
  sucesso?: string;
  /** Se está carregando */
  isLoading?: boolean;
}

export function FormEvento({
  titulo,
  subtitulo,
  textoBotaoSubmit = 'Salvar',
  textoLoading = 'Salvando...',
  dadosIniciais,
  onSubmit,
  erro: erroProp = '',
  sucesso: sucessoProp = '',
  isLoading = false,
}: FormEventoProps) {
  const [imagemPreview, setImagemPreview] = useState<string | null>(dadosIniciais?.imagem || null);

  function handleImagemChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagemPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const dados: DadosEvento = {
      titulo: formData.get('titulo') as string,
      descricao: formData.get('descricao') as string,
      categoria: formData.get('categoria') as string,
      data: formData.get('data') as string,
      horario: formData.get('horario') as string,
      endereco: formData.get('endereco') as string,
      numero: formData.get('numero') as string || '',
      bairro: formData.get('bairro') as string,
      complemento: formData.get('complemento') as string || '',
      cidade: formData.get('cidade') as string || 'Franca',
      estado: formData.get('estado') as string || 'SP',
      cep: formData.get('cep') as string || '',
      preco: formData.get('preco') as string || '0',
      link_compra: formData.get('link_compra') as string || '',
      imagem: imagemPreview || dadosIniciais?.imagem || '',
    };

    await onSubmit(dados);
  }

  return (
    <div className="flex flex-col items-center px-4 py-6 md:px-12 md:py-8">
      <h1 className="text-[#1E293B] font-bold text-xl md:text-3xl mb-1 text-center">{titulo}</h1>
      <p className="text-[#1E293B] font-light text-sm md:text-lg mb-6 text-center">{subtitulo}</p>

      {/* Mensagens de feedback */}
      {erroProp && (
        <div className="w-full max-w-[700px] mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
          <span>⚠️</span>
          <span>{erroProp}</span>
        </div>
      )}
      {sucessoProp && (
        <div className="w-full max-w-[700px] mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium flex items-center gap-2">
          <span>✅</span>
          <span>{sucessoProp}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        {/* Image Upload */}
        <div className="flex flex-col gap-1 w-full mb-2">
          <label className="text-gray-900 font-semibold text-sm">Capa do Evento:</label>
          <label htmlFor="imagem-evento" className="flex flex-col items-center justify-center w-full h-40 md:h-48 border-2 border-dashed border-gray-400 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-[#0A2342] transition-colors cursor-pointer group overflow-hidden relative">
            {imagemPreview ? (
              <img src={imagemPreview} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-10 h-10 mb-3 text-gray-400 group-hover:text-[#0A2342] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                </svg>
                <p className="mb-2 text-sm text-gray-500 group-hover:text-gray-700"><span className="font-semibold text-[#0A2342]">Clique para enviar</span> ou arraste a imagem</p>
                <p className="text-xs text-gray-400">SVG, PNG, JPG ou GIF (MAX. 800x400px)</p>
              </div>
            )}
            <input
              id="imagem-evento"
              name="imagem"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImagemChange}
            />
          </label>
        </div>

        {/* Title */}
        <Input name="titulo" label="Título do Evento" placeholder="Nome do seu evento" defaultValue={dadosIniciais?.titulo} required />

        {/* Category & Date & Time */}
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex-[2]">
            <Select
              name="categoria"
              label="Categoria"
              options={categoriaOptions}
              defaultValue={dadosIniciais?.categoria || ''}
              required
            />
          </div>
          <div className="flex-1">
            <Input name="data" label="Data" type="date" defaultValue={dadosIniciais?.data} required />
          </div>
          <div className="flex-1">
            <Input name="horario" label="Horário" type="time" defaultValue={dadosIniciais?.horario} required />
          </div>
        </div>

        {/* Address Row 1 */}
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex-1">
            <Input name="cep" label="CEP" placeholder="00000-000" defaultValue={dadosIniciais?.cep} />
          </div>
          <div className="flex-[3]">
            <Input name="endereco" label="Endereço" placeholder="Rua, Avenida, etc." defaultValue={dadosIniciais?.endereco} required />
          </div>
          <div className="flex-1">
            <Input name="numero" label="Número" placeholder="123" defaultValue={dadosIniciais?.numero} />
          </div>
        </div>

        {/* Address Row 2 */}
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex-[2]">
            <Input name="bairro" label="Bairro" placeholder="Nome do bairro" defaultValue={dadosIniciais?.bairro} required />
          </div>
          <div className="flex-[2]">
            <Input name="complemento" label="Complemento" placeholder="Bloco, sala, etc. (opcional)" defaultValue={dadosIniciais?.complemento} />
          </div>
        </div>

        {/* City & State */}
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex-[2]">
            <Input name="cidade" label="Cidade" placeholder="Nome da cidade" defaultValue={dadosIniciais?.cidade || 'Franca'} />
          </div>
          <div className="flex-1">
            <Input name="estado" label="Estado" placeholder="UF" defaultValue={dadosIniciais?.estado || 'SP'} />
          </div>
        </div>

        {/* Price and Link */}
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex-[1]">
            <Input name="preco" label="Preço do ingresso" type="number" step="0.01" placeholder="R$ 0,00" defaultValue={dadosIniciais?.preco} />
          </div>
          <div className="flex-[3]">
            <Input name="link_compra" label="Link para compra" type="url" placeholder="https://..." defaultValue={dadosIniciais?.link_compra} />
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
              defaultValue={dadosIniciais?.descricao}
              required
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
          <Button
            type="submit"
            variant="primary"
            className={`w-full sm:w-auto h-10 md:h-[44px] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? textoLoading : textoBotaoSubmit}
          </Button>
        </div>
      </form>
    </div>
  );
}
