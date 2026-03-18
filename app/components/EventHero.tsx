import React from "react";
import Link from "next/link";
import IconBack from "./IconBack";
import IconLocal from "./IconLocal";
import IconCalendar from "./IconCalendar";
import { Badge } from "./Badge";

interface EventHeroProps {
  titulo: string;
  imagem: string;
  categoria?: string;
  local: string;
  data: string;
}

export function EventHero({
  titulo,
  imagem,
  categoria,
  local,
  data,
}: EventHeroProps) {
  return (
    <section
      className="relative w-full min-h-[300px] lg:min-h-[350px] flex items-end pb-8 pt-16"
      style={{
        backgroundImage: `url(${imagem})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Botão Voltar */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 rounded-full font-bold text-white text-sm bg-black/30 hover:bg-black/50 transition-colors"
      >
        <IconBack fill="#FFFFFF" />
        <span>Voltar</span>
      </Link>

      {/* Conteúdo sobre a imagem */}
      <div className="relative z-10 px-4 md:px-14 max-w-[1200px] w-full">
        {/* Badge de categoria */}
        <Badge className="mb-6">{categoria?.toUpperCase() ?? "SHOW"}</Badge>

        {/* Título */}
        <h1 className="text-white font-extrabold mb-5 text-4xl md:text-5xl lg:text-6xl leading-[0.92] tracking-[-0.02em]">
          {titulo}
        </h1>

        <div className="flex flex-col gap-3">
          {/* Local */}
          <div className="flex items-center gap-3">
            <IconLocal className="w-5 h-5 shrink-0" fill="#FFFFFF" />
            <span className="text-white font-bold text-lg md:text-xl">
              {local}
            </span>
          </div>

          {/* Data */}
          <div className="flex items-center gap-3">
            <IconCalendar className="w-5 h-5 shrink-0" fill="#FFFFFF" />
            <span className="text-white font-bold text-lg md:text-xl">
              {data}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
