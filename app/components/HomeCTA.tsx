import IconMegafone from "./IconMegafone";

export function HomeCTA() {
  return (
    <section className="bg-[#1E3A8A] py-1 md:py-2 px-4 sm:px-6 lg:px-8 shadow-inner overflow-hidden relative border-t border-white/10">
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-2 md:gap-3 relative z-10">
        
        <div className="flex flex-col text-left text-white max-w-5xl">
          <h3 className="text-base md:text-lg lg:text-xl font-bold mb-0.5 tracking-tight leading-tight text-center md:text-left">
            Organiza eventos em Franca? <br className="lg:hidden"/>
            Simplifique sua divulgação.
          </h3>
          <p className="text-[10px] sm:text-xs md:text-sm lg:text-base font-medium opacity-80 leading-relaxed text-center md:text-left">
            Pare de espalhar informações em silos. Publique uma vez na <strong>Franca Eventos</strong> e seja encontrado por quem consome cultura na cidade.
          </p>
        </div>

        <button 
          className="bg-background-button text-text-button font-bold py-1 md:py-1.5 px-6 md:px-8 rounded-full flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl whitespace-nowrap group shrink-0 w-full sm:w-auto text-xs md:text-sm"
        >
          <IconMegafone />
          <span>Quero Divulgar</span>
        </button>
      </div>

      {/* Decorative background elements for premium look */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[60px] pointer-events-none" />
    </section>
  );
}
