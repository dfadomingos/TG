export function SearchBar() {
  return (    
    <div className="flex items-center bg-white rounded-full p-0.3 w-full max-w-3xl mx-auto shadow-md p-0.5">
      
      {/* icone de lupa */}
      <div className="pl-4 pr-2 text-gray-400 font-family p-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* campo de texto */}
      <input 
        type="text" 
        placeholder="Busque por nome, local ou artista..." 
        // 'outline-none' tira aquela borda preta feia que o navegador põe ao clicar
        className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-[0.95rem]"
      />

      {/* botão de busca */}
      <button className="bg-background-button text-text-button text-[0.95rem] font-bold py-2 px-7 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap border-2 border-gray-200">
        Buscar
      </button>

    </div>
  );
}