import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso e Política de Privacidade | FrancaEventos",
  description: "Conheça os Termos de Uso e a Política de Privacidade e Tratamento de Dados (LGPD) da plataforma FrancaEventos.",
};

export default function TermosPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb / Botão Voltar */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-semibold text-[#0A2342] hover:text-[#F59E0B] transition-colors"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar para o Início
          </Link>
          <span className="text-xs text-gray-500 font-medium">Última atualização: Outubro de 2026</span>
        </div>

        {/* Header do Documento */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 mb-8">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-[#0A2342] text-xs font-bold uppercase tracking-wider mb-3">
            Documento Legal e Transparência
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0A2342] tracking-tight">
            Termos de Uso e Política de Privacidade
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
            Bem-vindo ao <strong>FrancaEventos</strong>. Este documento estabelece as regras de utilização da plataforma, as responsabilidades de usuários e organizadores, e o nosso compromisso com a proteção dos seus dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
          </p>

          {/* Atalhos Rápidos */}
          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
            <a
              href="#termos"
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-[#0A2342] hover:text-white text-xs sm:text-sm font-bold text-gray-700 transition-all"
            >
              1. Termos de Uso
            </a>
            <a
              href="#privacidade"
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-[#0A2342] hover:text-white text-xs sm:text-sm font-bold text-gray-700 transition-all"
            >
              2. Política de Privacidade (LGPD)
            </a>
            <a
              href="#organizadores"
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-[#0A2342] hover:text-white text-xs sm:text-sm font-bold text-gray-700 transition-all"
            >
              3. Regras para Organizadores
            </a>
            <a
              href="#ingressos"
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-[#0A2342] hover:text-white text-xs sm:text-sm font-bold text-gray-700 transition-all"
            >
              4. Bilheterias e Ingressos
            </a>
          </div>
        </div>

        {/* Conteúdo dos Termos */}
        <div className="space-y-8 bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-200">
          {/* SEÇÃO 1: TERMOS DE USO */}
          <section id="termos" className="scroll-mt-8">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#0A2342] text-white text-sm font-bold">
                1
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0A2342]">Termos de Uso da Plataforma</h2>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
              <p>
                <strong>1.1. Natureza do Serviço:</strong> O FrancaEventos é um portal agregador e catalisador de informações culturais, artísticas, gastronômicas, esportivas e de entretenimento da cidade de Franca-SP e região circunvizinha. O acesso ao portal por parte dos visitantes é livre e gratuito.
              </p>
              <p>
                <strong>1.2. Cadastro e Acesso:</strong> Para usufruir de recursos personalizados, como salvar atrações na lista de favoritos ou cadastrar novos eventos como produtor, o usuário deve realizar um cadastro fornecendo dados verídicos, completos e atualizados.
              </p>
              <p>
                <strong>1.3. Guarda de Credenciais:</strong> O usuário é o único responsável pela guarda e confidencialidade de sua senha de acesso, devendo notificar imediatamente a administração em caso de suspeita de uso não autorizado de sua conta.
              </p>
              <p>
                <strong>1.4. Condutas Vedadas:</strong> É expressamente proibido utilizar a plataforma para veicular conteúdo fraudulento, difamatório, pornográfico, que faça apologia a crimes, incite ao ódio ou viole direitos de propriedade intelectual de terceiros.
              </p>
            </div>
          </section>

          {/* SEÇÃO 2: POLÍTICA DE PRIVACIDADE */}
          <section id="privacidade" className="scroll-mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#0A2342] text-white text-sm font-bold">
                2
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0A2342]">
                Política de Privacidade e Proteção de Dados (LGPD)
              </h2>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
              <p>
                Em conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD)</strong>, apresentamos de forma transparente como seus dados são coletados, armazenados e protegidos:
              </p>

              <div className="bg-blue-50/70 rounded-xl p-4 sm:p-5 border border-blue-100 text-sm">
                <h3 className="font-bold text-[#0A2342] mb-2">Dados Coletados no Cadastro:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li><strong>Usuários Comuns:</strong> Nome completo, endereço de e-mail, número de celular e senha criptografada.</li>
                  <li><strong>Organizadores / Produtores:</strong> Nome do responsável, e-mail, telefone/celular, razão social ou nome da produtora, CNPJ e links de redes sociais.</li>
                </ul>
              </div>

              <p>
                <strong>2.1. Finalidade do Tratamento:</strong> Os dados são coletados exclusivamente para fins de autenticação de sessão, personalização do painel do usuário (marcação de favoritos), comunicação essencial sobre a conta e controle de autoria dos eventos publicados.
              </p>
              <p>
                <strong>2.2. Segurança e Criptografia:</strong> As senhas de acesso são submetidas a funções de dispersão criptográfica irreversível (hashing via <em>Bcrypt</em>) com salgamento aleatório antes de qualquer gravação no banco de dados. Nenhum operador ou administrador do sistema possui acesso à sua senha original em texto puro.
              </p>
              <p>
                <strong>2.3. Não Compartilhamento com Terceiros:</strong> O FrancaEventos <strong>não comercializa, não aluga e não transfere</strong> seus dados pessoais a terceiros para fins de marketing ou publicidade não solicitada.
              </p>
              <p>
                <strong>2.4. Direitos do Titular (Art. 18 da LGPD):</strong> Você tem o direito de solicitar a qualquer momento a confirmação da existência de tratamento, o acesso aos seus dados, a correção de dados incompletos ou a exclusão definitiva de sua conta da plataforma.
              </p>
            </div>
          </section>

          {/* SEÇÃO 3: REGRAS PARA ORGANIZADORES */}
          <section id="organizadores" className="scroll-mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#0A2342] text-white text-sm font-bold">
                3
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0A2342]">
                Responsabilidades dos Organizadores e Produtores
              </h2>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
              <p>
                Ao se cadastrar como Produtor ou Organizador cultural na plataforma, você declara expressamente que:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>Possui autorização e poderes legítimos para representar e divulgar as atrações cadastradas em nome de sua empresa ou produtora.</li>
                <li>É o único responsável pela veracidade das informações fornecidas (datas, horários, locais, valores de entrada e classificação indicativa de idade).</li>
                <li>Possui todas as licenças, alvarás de funcionamento, alvarás judiciais e autorizações dos órgãos públicos competentes (Prefeitura Municipal de Franca, Corpo de Bombeiros, ECAD, etc.) requeridos para a realização do evento.</li>
                <li>Compromete-se a atualizar prontamente ou cancelar o evento no sistema caso ocorram imprevistos, alterações de endereço ou adiamentos.</li>
              </ul>
            </div>
          </section>

          {/* SEÇÃO 4: BILHETERIAS E INGRESSOS */}
          <section id="ingressos" className="scroll-mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#0A2342] text-white text-sm font-bold">
                4
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0A2342]">
                Isenção de Responsabilidade sobre Ingressos e Bilheterias
              </h2>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
              <p>
                <strong>4.1. Plataforma Exclusivamente Informativa:</strong> O FrancaEventos <strong>não realiza intermediação financeira, não processa pagamentos e não emite ingressos</strong> diretamente.
              </p>
              <p>
                <strong>4.2. Links Externos:</strong> Os botões de aquisição direcionam o usuário para os canais oficiais de venda das atrações (como Sympla, Q2 Ingressos, DuoTicket ou pontos físicos). Todas as transações financeiras, regras de cancelamento, direito de arrependimento (Art. 49 do CDC) e solicitações de reembolso são de inteira e exclusiva responsabilidade da respectiva ticketeira e do organizador do evento.
              </p>
            </div>
          </section>

          {/* SEÇÃO 5: CONTATO E FORO */}
          <section className="pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#0A2342] text-white text-sm font-bold">
                5
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0A2342]">Disposições Finais e Contato</h2>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
              <p>
                Para exercer seus direitos de privacidade, reportar eventos em desconformidade ou esclarecer dúvidas sobre estes Termos de Uso, entre em contato com a equipe de administração do projeto pelo e-mail de suporte institucional.
              </p>
              <p className="text-xs text-gray-500">
                Fica eleito o Foro da Comarca de Franca, Estado de São Paulo, para dirimir eventuais controvérsias decorrentes da interpretação destes termos, com renúncia expressa a qualquer outro.
              </p>
            </div>
          </section>
        </div>

        {/* Rodapé Interno com Ações */}
        <div className="mt-8 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/cadastro"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0A2342] text-white font-bold hover:bg-[#F59E0B] hover:text-[#0A2342] transition-colors shadow-md text-sm"
          >
            Prosseguir para Cadastro de Usuário
          </Link>
          <Link
            href="/cadastro-organizador"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-[#0A2342] border-2 border-[#0A2342] font-bold hover:bg-gray-50 transition-colors text-sm"
          >
            Cadastro de Organizador
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
