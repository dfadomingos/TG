import IconHeader from "./components/IconHeader";
import { SearchBar } from "./components/SearchBar";

export default function Home() {
  // 1. Nossos dados falsos (Mock)
  const eventos = [
    {
      id: 1,
      titulo: "Hackathon FATEC",
      data: "15 de Agosto • 08:00",
      local: "FATEC Franca",
      categoria: "Tecnologia"
    },
    {
      id: 2,
      titulo: "Expoagro Franca 2026",
      data: "20 a 31 de Maio • 19:00",
      local: "Parque Fernando Costa",
      categoria: "Show"
    }
  ];

  return (
    // Usando a sua cor de fundo principal: bg-background-1
    <main className="min-h-screen bg-white text-black">
      
      {/* Usando o seu gradiente: bg-banner */}
      <header className="bg-background-1 p-4 flex items-center justify-start px-8">
        <span className="text-text-1 mr-2"><IconHeader /></span>        
        <p className="text-text-1 font-bold text-lg">FrancaEventos</p>
      </header>

      <section className="bg-banner p-4 flex items-center justify-center">
        <div>
          <h1 className="text-2xl text-text-1 font-bold text-center">Descubra o que acontece na cidade</h1>
          <p className="text-center text-text-1">Shows, festas, bares, teatros e workshops. Sua próxima experiência inesquecível começa aqui.</p>
          <div className="flex justify-center">
            <SearchBar />
          </div>
          
        </div>  
      </section>

      <section className="px-8 pb-8">
        <h2 className="text-2xl font-semibold mb-6">Próximos Eventos</h2>
        
        {/* Grid para listar os eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventos.map((evento) => (
            <div key={evento.id} className="bg-white/10 p-6 rounded-lg border border-white/20">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-2 block">
                {evento.categoria}
              </span>
              <h3 className="text-xl font-bold mb-2">{evento.titulo}</h3>
              <p className="text-sm text-gray-300 mb-1">📅 {evento.data}</p>
              <p className="text-sm text-gray-300 mb-6">📍 {evento.local}</p>
              
              {/* Usando as cores do seu botão */}
              <button className="w-full bg-background-button text-text-button font-bold py-3 rounded-md hover:opacity-90 transition-opacity">
                Ver Detalhes
              </button>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}