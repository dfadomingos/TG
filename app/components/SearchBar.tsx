export function SearchBar() {
  return (
    // CAIXA PRINCIPAL: bg-white, arredondada (rounded-full), flex para alinhar os itens lado a lado
    <div className="flex items-center bg-white rounded-full p-1.5 w-full max-w-3xl mx-auto shadow-md">
      
      {/* ÍCONE DE LUPA (Margem à esquerda para não colar na borda) */}
      <div className="pl-4 pr-2 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* CAMPO DE TEXTO (O 'flex-1' faz ele esticar e ocupar todo o espaço livre) */}
      <input 
        type="text" 
        placeholder="Busque por nome, local ou artista..." 
        // O 'outline-none' é o pulo do gato: tira aquela borda preta feia que o navegador põe ao clicar
        className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm md:text-base"
      />

      {/* BOTÃO DE BUSCA (Usando as suas cores customizadas!) */}
      <button className="bg-background-button text-text-button font-bold py-2.5 px-6 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap border-2 border-gray-200">
        Buscar
      </button>

    </div>
  );
}