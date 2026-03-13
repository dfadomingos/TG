"use client";

import { useRef, useState, useEffect } from "react";
import { eventosDestaque } from "../data/eventosTeste";

export function CarrosselDestaques() {
  const carrosselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);  

  const scrollToNext = () => {
    if (!carrosselRef.current) return;
    const container = carrosselRef.current;
    const children = Array.from(container.children);
    if (children.length === 0) return;

    let targetIndex = activeIndex + 1;
    if (targetIndex >= children.length) {
      targetIndex = children.length - 1;
    }

    const child = children[targetIndex] as HTMLElement;
    const scrollPos = child.offsetLeft - (container.clientWidth / 2) + (child.clientWidth / 2);
    container.scrollTo({ left: scrollPos, behavior: 'smooth' });
  };

  const scrollToPrev = () => {
    if (!carrosselRef.current) return;
    const container = carrosselRef.current;
    const children = Array.from(container.children);
    if (children.length === 0) return;

    let targetIndex = activeIndex - 1;
    if (targetIndex < 0) {
      targetIndex = 0;
    }

    const child = children[targetIndex] as HTMLElement;
    const scrollPos = child.offsetLeft - (container.clientWidth / 2) + (child.clientWidth / 2);
    container.scrollTo({ left: scrollPos, behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!carrosselRef.current) return;
    const container = carrosselRef.current;
    
    //obtem os filhos do carrossel
    const children = Array.from(container.children);
    if (children.length === 0) return;

    //verifica se a rolagem está no início extremo
    if (container.scrollLeft <= 5) {
      if (activeIndex !== 0) setActiveIndex(0);
      return;
    }

    //verifica se a rolagem está no final extremo
    if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 5) {
      const lastIndex = children.length - 1;
      if (activeIndex !== lastIndex) setActiveIndex(lastIndex);
      return;
    }
    
    let closestIndex = 0;
    let closestDistance = Infinity;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    children.forEach((child, index) => {
      const childEle = child as HTMLElement;
      const childRect = childEle.getBoundingClientRect();
      const childCenter = childRect.left + childRect.width / 2;

      //se o elemento não tiver largura (pode acontecer durante a montagem inicial antes das imagens), não é usado
      if (childRect.width === 0) return;

      const distance = Math.abs(childCenter - containerCenter);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);    
  }, [activeIndex]);

  return (
    <section className="w-full my-6 overflow-hidden">      
      <div className="relative group/carrossel">
        
        {/* botão de rolar para a esquerda */}
        <button 
          onClick={scrollToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/90 text-white rounded-full w-10 h-10 items-center justify-center hidden md:flex opacity-0 group-hover/carrossel:opacity-100 transition-opacity"
          aria-label="Rolar para a esquerda"
        >
          &#10094;
        </button>

        {/* overflow-x-auto, no-scrollbar e snap-x configuram a rolagem nativa */}
        <div 
          ref={carrosselRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory gap-6 px-4 md:px-8 py-8 no-scrollbar scroll-smooth items-center"
        >
          {eventosDestaque.map((evento, index) => {
            const isActive = activeIndex === index;
            
            return (
              <div 
                key={evento.id} 
                className={`
                  relative shrink-0 w-[85%] sm:w-[60%] md:w-[45%] lg:w-[35%] h-64 rounded-2xl overflow-hidden snap-center shadow-lg cursor-pointer transition-all duration-500 ease-out
                  ${isActive ? 'scale-115 z-10 opacity-100 shadow-2xl shadow-blue-500/20' : 'scale-95 opacity-50 hover:opacity-80 hover:scale-100'}
                `}
              >
                {/* imagem de fundo */}
                <img 
                  src={evento.imagem} 
                  alt={evento.titulo} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                
                {/* camada escura por cima da imagem */}
                <div className={`absolute inset-0 transition-colors duration-500 ${isActive ? 'bg-gradient-to-t from-black/90 via-black/30 to-transparent' : 'bg-black/50'}`}></div>

                {/* conteúdo do card */}
                <div className={`absolute bottom-0 left-0 p-6 transition-transform duration-500 ${isActive ? 'translate-y-0' : 'translate-y-2'}`}>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block transition-colors ${isActive ? 'bg-background-button text-text-button' : 'bg-gray-700 text-gray-300'}`}>
                    {evento.categoria}
                  </span>
                  <h3 className={`text-2xl font-bold mb-1 transition-colors ${isActive ? 'text-white' : 'text-gray-300'}`}>{evento.titulo}</h3>
                  <p className={`text-sm flex items-center gap-2 transition-colors ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>
                    📅 {evento.data}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* botão de rolar para a direita */}
        <button 
          onClick={scrollToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/90 text-white rounded-full w-10 h-10 items-center justify-center hidden md:flex opacity-0 group-hover/carrossel:opacity-100 transition-opacity"
          aria-label="Rolar para a direita"
        >
          &#10095;
        </button>

      </div>
    </section>
  );
}