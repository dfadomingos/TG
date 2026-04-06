"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { LoginInput } from "./LoginInput";
import IconEmail from "../../components/IconEmail";
import IconLock from "../../components/IconLock";
import Link from "next/link";

export function LoginCard() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao fazer login.");
        return;
      }

      // Salva os dados do usuário no contexto de autenticação
      login(data.user);

      // Redireciona baseado no tipo de conta
      if (data.user.tipo === "ORGANIZADOR") {
        router.push("/painel-organizador");
      } else {
        router.push("/painel-usuario");
      }

    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[550px] rounded-xl overflow-hidden shadow-2xl mx-auto">

      {/* Form Area */}
      <form
        onSubmit={handleSubmit}
        className="bg-white px-5 sm:px-8 md:px-10 lg:px-12 py-6 sm:py-7 md:py-8 lg:py-10 flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6"
      >
        <h2 className="text-center text-[#1E293B] font-bold text-xl sm:text-2xl md:text-3xl mb-1">
          Faça seu Login
        </h2>

        {/* Mensagem de erro */}
        {erro && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{erro}</span>
          </div>
        )}

        {/* Email */}
        <LoginInput
          label="Email:"
          placeholder="seu@email.com"
          type="email"
          icon={<IconEmail className="w-6 h-4 sm:w-8 sm:h-6 md:w-10 md:h-[30px]" />}
          value={email}
          onChange={setEmail}
        />

        {/* Senha */}
        <LoginInput
          label="Senha:"
          placeholder="Digite sua senha"
          type="password"
          icon={<IconLock className="w-4 h-5 sm:w-5 sm:h-6 md:w-[25px] md:h-[30px]" />}
          value={password}
          onChange={setPassword}
        />

        {/* Esqueceu sua senha? */}
        <div className="flex justify-end -mt-1 sm:-mt-2">
          <Link
            href="#"
            className="text-black font-extralight text-xs sm:text-sm md:text-base lg:text-xl hover:underline transition-all"
          >
            Esqueceu sua senha?
          </Link>
        </div>

        {/* Botão Entrar */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-background-button border border-background-button text-text-button font-bold text-sm sm:text-base md:text-lg lg:text-xl py-2.5 sm:py-3 md:py-3.5 rounded-full hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </button>

        {/* Cadastra-se */}
        <div className="flex items-center justify-center gap-1 flex-wrap">
          <span className="text-text-button font-extralight text-xs sm:text-sm md:text-base lg:text-xl">
            Não tem uma conta?
          </span>
          <Link
            href="/cadastro"
            className="text-background-button font-semibold text-xs sm:text-sm md:text-base lg:text-xl hover:underline transition-all"
          >
            Cadastra-se aqui.
          </Link>
        </div>
      </form>
    </div>
  );
}
