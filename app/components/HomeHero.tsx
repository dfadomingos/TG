"use client";

import { SearchBar } from "./SearchBar";

interface HomeHeroProps {
  onSearch?: (termo: string) => void;
}

export function HomeHero({ onSearch }: HomeHeroProps) {
  return (
    <section className="bg-banner px-4 py-6 sm:py-10 md:py-12 flex items-center justify-center">
      <div className="max-w-[1200px] mx-auto text-center w-full px-4">
        <h1 className="text-xl sm:text-2xl lg:text-4xl text-text-1 font-extrabold pb-2 tracking-tight leading-[1.1]">
          Descubra o que acontece na cidade
        </h1>
        <p className="max-w-2xl mx-auto text-text-1 text-xs sm:text-sm lg:text-base opacity-90 pb-4 md:pb-6 text-balance leading-relaxed">
          Shows, festas, bares, teatros e workshops. Sua próxima experiência inesquecível começa aqui.
        </p>
        <div className="flex justify-center w-full max-w-2xl mx-auto">
          <SearchBar onSearch={onSearch} />
        </div>
      </div>
    </section>
  );
}
