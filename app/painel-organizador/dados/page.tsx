"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { Input } from "@/app/components/Input";
import { Button } from "@/app/components/Button";
import IconUser from "@/app/components/IconUser";
import IconEmail from "@/app/components/IconEmail";
import IconPhone from "@/app/components/IconPhone";
import IconLock from "@/app/components/IconLock";
import IconOrganizer from "@/app/components/IconOrganizer";
import IconShare from "@/app/components/IconShare";

export default function MeusDadosOrganizadorPage() {
  const { user, isLoggedIn, login } = useAuth();
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [nomeProdutora, setNomeProdutora] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [linkSocial, setLinkSocial] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // Buscar dados atuais do organizador
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    async function fetchDados() {
      if (!user) return;
      try {
        const res = await fetch(`/api/organizadores/profile/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setNome(data.nome || "");
          setEmail(data.email || "");
          setCelular(data.celular || "");
          setNomeProdutora(data.nome_produtora || "");
          setCnpj(data.cnpj || "");
          setLinkSocial(data.link_social || "");
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchDados();
  }, [isLoggedIn, user, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setIsLoading(true);

    if (!user) return;

    const payload: any = {
      nome,
      email,
      celular,
      nome_produtora: nomeProdutora,
      cnpj,
      link_social: linkSocial,
    };

    // Só envia senha se o organizador quiser alterar
    if (novaSenha) {
      payload.senha_atual = senhaAtual;
      payload.nova_senha = novaSenha;
    }

    try {
      const res = await fetch(`/api/organizadores/update/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao atualizar dados.");
        return;
      }

      setSucesso(data.message || "Dados atualizados com sucesso!");

      // Atualiza o contexto com os novos dados
      login({
        id: user.id,
        nome: data.user.nome,
        email: data.user.email,
        tipo: user.tipo,
      });

      // Limpa campos de senha
      setSenhaAtual("");
      setNovaSenha("");

    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Carregando seus dados...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Título */}
      <div className="mb-6 pl-4 sm:pl-8">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-1">
          Meus Dados
        </h1>
        <p className="text-gray-500 text-sm md:text-base">
          Visualize e edite suas informações
        </p>
      </div>

      {/* Form Card */}
      <div className="mx-4 sm:mx-8 max-w-[640px]">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">

          {/* Mensagens de feedback */}
          {erro && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{erro}</span>
            </div>
          )}
          {sucesso && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium flex items-center gap-2">
              <span>✅</span>
              <span>{sucesso}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Dados Pessoais */}
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
              Dados Pessoais
            </h2>

            <Input
              label="Nome Completo"
              name="nome"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              icon={<IconUser className="w-full h-full" fill="#000000" />}
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<IconEmail className="w-full h-full" fill="#000000" />}
              required
            />

            <Input
              label="Celular"
              name="celular"
              type="tel"
              placeholder="(00)00000-0000"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              icon={<IconPhone className="w-full h-full" fill="#000000" />}
              required
            />

            {/* Dados da Produtora */}
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mt-4">
              Dados da Produtora
            </h2>

            <Input
              label="Nome Produtora"
              name="nome_produtora"
              placeholder="Nome da produtora"
              value={nomeProdutora}
              onChange={(e) => setNomeProdutora(e.target.value)}
              icon={<IconOrganizer className="w-full h-full" fill="#000000" />}
              required
            />

            <Input
              label="CNPJ"
              name="cnpj"
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              icon={<IconOrganizer className="w-full h-full" fill="#000000" />}
              required
            />

            <Input
              label="Link Rede Social / Site"
              name="link_social"
              type="url"
              placeholder="https://..."
              value={linkSocial}
              onChange={(e) => setLinkSocial(e.target.value)}
              icon={<IconShare className="w-full h-full" fill="#000000" />}
            />

            {/* Alterar Senha */}
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mt-4">
              Alterar Senha <span className="text-sm font-normal text-gray-400">(opcional)</span>
            </h2>

            <Input
              label="Senha Atual"
              name="senha_atual"
              type="password"
              placeholder="Digite a senha atual"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              icon={<IconLock className="w-full h-full" fill="#000000" />}
            />

            <Input
              label="Nova Senha"
              name="nova_senha"
              type="password"
              placeholder="Digite a nova senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              icon={<IconLock className="w-full h-full" fill="#000000" />}
              minLength={6}
            />

            {/* Botão Salvar */}
            <div className="mt-4">
              <Button
                type="submit"
                variant="accent"
                fullWidth
                className={`h-11 text-base shadow-lg ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
