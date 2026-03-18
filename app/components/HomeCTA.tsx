import IconMegafone from "./IconMegafone";

export function HomeCTA() {
  return (
    <section className="bg-[#1E3A8A] py-6 md:py-10 px-6 lg:px-12 shadow-inner overflow-hidden relative border-t border-white/10">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 relative z-10">
        
        <div className="flex flex-col text-left text-white max-w-2xl">
          <h3 className="text-lg md:text-xl lg:text-2xl font-extrabold mb-2 tracking-tight leading-tight text-center md:text-left">
            Organiza eventos em Franca? <br className="hidden lg:block"/>
            Simplifique sua divulgação.
          </h3>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg font-medium opacity-80 leading-relaxed text-center md:text-left">
            Pare de espalhar informações em silos. Publique uma vez na <strong>Franca Eventos</strong> e seja encontrado por quem consome cultura na cidade.
          </p>
        </div>

        <button 
          className="bg-background-button text-text-button font-bold py-3 md:py-3.5 px-8 md:px-10 rounded-full flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl whitespace-nowrap group shrink-0 w-full sm:w-auto text-sm md:text-base"
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
