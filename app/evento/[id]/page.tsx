import { todosEventos } from "../../data/eventosTeste";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import IconBack from "@/app/components/IconBack";
import IconLocal from "@/app/components/IconLocal";
import IconCalendar from "@/app/components/IconCalendar";
import IconHora from "@/app/components/IconHora";
import IconPriceTag from "@/app/components/IconPriceTag";
import IconHeart from "@/app/components/IconHeart";
import IconShare from "@/app/components/IconShare";

export default async function EventoPage({ params }: any) {
  const resolvedParams = await params;
  const evento = todosEventos.find((e) => String(e.id) === resolvedParams.id);

  if (!evento) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB]">
        <p className="text-gray-500 text-xl mb-4">Evento não encontrado.</p>
        <Link href="/" className="text-[#0D47A1] font-bold hover:underline">
          ← Voltar para a Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]" style={{ fontFamily: "Inter, sans-serif" }}>

      <Header />

      {/*banner do evento */}
      <section
        className="relative w-full flex items-end"
        style={{
          height: "300px",
          backgroundImage: `url(${evento.imagem})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay escuro */}
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.55)" }} />

        {/* Botão Voltar */}
        <Link
          href="/"
          className="absolute top-3.5 left-3.5 flex items-center gap-2 px-4 py-3 rounded-full font-bold text-white text-sm"
          style={{ backgroundColor: "rgba(10, 35, 66, 0.5)" }}
        >
          <IconBack fill="#FFFFFF" />
          Voltar
        </Link>

        {/* Conteúdo sobre a imagem */}
        <div className="relative z-10 px-4 pb-2.5 max-w-[800px]">
          {/* Badge de categoria */}
          <div
            className="inline-block px-5 py-2 rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: "#0D47A1" }}
          >
            {evento.categoria?.toUpperCase() ?? "SHOW"}
          </div>

          {/* Título */}
          <h1
            className="text-white font-extrabold mb-9 mt-6"
            style={{ fontSize: "60px", lineHeight: "0.923em", letterSpacing: "-0.023em" }}
          >
            {evento.titulo}
          </h1>

          {/* Local */}
          <div className="flex items-center gap-3 mb-3">
            <IconLocal className="w-5 h-5" fill="#FFFFFF" />
            <span className="text-white font-bold" style={{ fontSize: "22px", lineHeight: "0.8em" }}>
              {evento.local}
            </span>
          </div>

          {/* Data */}
          <div className="flex items-center gap-3">
            <IconCalendar fill="#FFFFFF" />
            <span className="text-white font-bold" style={{ fontSize: "22px", lineHeight: "0.8em" }}>
              {evento.data}
            </span>
          </div>
        </div>
      </section>

      {/* ── Corpo Principal (2 colunas) ───────────────────────── */}
      <section className="w-full flex" style={{ minHeight: "775px" }}>

        {/* Coluna Esquerda — Sobre o evento */}
        <div className="flex-1 min-w-0" style={{ padding: "48px 57px" }}>
          <h2
            className="font-bold text-black mb-6"
            style={{ fontSize: "25px", lineHeight: "1.3em" }}
          >
            Sobre o evento
          </h2>
          <p
            className="text-black"
            style={{ fontSize: "16px", fontWeight: 600, lineHeight: "1.6em", letterSpacing: "0.02em" }}
          >
            Este é um dos grandes destaques de Franca! O {evento.titulo} promete agitar a cidade
            com uma estrutura impecável e momentos inesquecíveis. Venha aproveitar o melhor da
            nossa região com muita música, cultura e entretenimento para toda a família. Garanta
            seu lugar e venha viver esta experiência única que só acontece aqui em Franca.
          </p>
        </div>

        {/* Coluna Direita — Detalhes + Ingresso */}
        <div className="flex items-start py-12" style={{ width: "480px", flexShrink: 0, paddingLeft: "24px", paddingRight: "40px" }}>
          <div
            className="w-full rounded-2xl px-8 py-6"
            style={{ backgroundColor: "#D2D1D1" }}
          >
            {/* Cabeçalho "Detalhes" */}
            <h3
              className="font-bold mb-4"
              style={{ fontSize: "25px", lineHeight: "0.96em", color: "#000000" }}
            >
              Detalhes
            </h3>
            <hr style={{ borderColor: "#000000", marginBottom: "24px" }} />

            {/* Horário */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <IconHora />
                <span
                  className="font-bold"
                  style={{ fontSize: "16px", lineHeight: "1.4em", color: "#000000" }}
                >
                  Horário
                </span>
              </div>
              <p
                style={{ fontSize: "16px", fontWeight: 300, lineHeight: "1.4em", color: "#000000", paddingLeft: "28px" }}
              >
                {evento.hora}
              </p>
            </div>

            {/* Preço */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                <IconPriceTag fill="#000000" />
                <span
                  className="font-bold"
                  style={{ fontSize: "16px", lineHeight: "1.4em", color: "#000000" }}
                >
                  Preço
                </span>
              </div>
              <p
                style={{ fontSize: "16px", fontWeight: 300, lineHeight: "1.4em", color: "#000000", paddingLeft: "28px" }}
              >
                {evento.preco}
              </p>
            </div>

            {/* Botão: Comprar Ingresso */}
            <button
              className="w-full flex items-center justify-center gap-3 rounded-full font-bold mb-4"
              style={{
                backgroundColor: "#F59E0B",
                border: "1px solid #F59E0B",
                height: "52px",
                fontSize: "18px",
                lineHeight: "1em",
                color: "#1E293B",
              }}
            >
              🎟 Comprar Ingresso
            </button>

            {/* Botões: Favoritar + Compartilhar — lado a lado */}
            <div className="flex items-center justify-center gap-6">
              <button
                className="flex items-center justify-center gap-3 rounded-full font-bold"
                style={{
                  backgroundColor: "#0D47A1",
                  width: "247px",
                  height: "44px",
                  fontSize: "15px",
                  color: "#F8FAFC",
                }}
              >
                <IconHeart />
                Favoritar
              </button>

              <button
                className="flex items-center justify-center gap-3 rounded-full font-bold"
                style={{
                  backgroundColor: "#0D47A1",
                  width: "247px",
                  height: "44px",
                  fontSize: "15px",
                  color: "#F8FAFC",
                }}
              >
                <IconShare fill="#F8FAFC" />
                Compartilhar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}