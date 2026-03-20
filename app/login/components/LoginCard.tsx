"use client";

import React, { useState } from "react";
import { LoginInput } from "./LoginInput";
import { LoginRoleTabs } from "./LoginRoleTabs";
import IconEmail from "../../components/IconEmail";
import IconLock from "../../components/IconLock";
import Link from "next/link";

type Role = "usuario" | "organizador";

export function LoginCard() {
  const [activeRole, setActiveRole] = useState<Role>("usuario");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt:", { role: activeRole, email, password });
  };

  return (
    <div className="w-full max-w-[550px] rounded-xl overflow-hidden shadow-2xl mx-auto">
      {/* Role Tabs */}
      <LoginRoleTabs activeRole={activeRole} onRoleChange={setActiveRole} />

      {/* Horizontal separator below tabs */}
      <div className="h-px bg-black" />

      {/* Form Area */}
      <form
        onSubmit={handleSubmit}
        className="bg-white px-5 sm:px-8 md:px-10 lg:px-12 py-4 sm:py-5 md:py-6 lg:py-8 flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6"
      >
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
          className="w-full bg-background-button border border-background-button text-text-button font-bold text-sm sm:text-base md:text-lg lg:text-xl py-2.5 sm:py-3 md:py-3.5 rounded-full hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
        >
          Entrar
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
