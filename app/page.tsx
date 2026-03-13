import { CarrosselDestaques } from "./components/CarrosselDestaques";
import { FiltroCategorias } from "./components/FiltroCategorias";
import { GradeEventos } from "./components/GradeEventos";
import IconHeader from "./components/IconHeader";
import { SearchBar } from "./components/SearchBar";

export default function Home() {
  //dados teste
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
    <main className="min-h-screen bg-white text-black font-family">
      
      {/* usando o seu gradiente: bg-banner */}
      <header className="bg-background-1 p-3 flex items-center justify-start px-4">
        <span className="text-text-1 mr-2.5"><IconHeader /></span>        
        <p className="text-text-1 font-bold text-lg">FrancaEventos</p>
      </header>

      <section className="bg-banner p-7 flex items-center justify-center">
        <div>
          <h1 className="text-4xl text-text-1 font-bold text-center pb-3">Descubra o que acontece na cidade</h1>
          <p className="text-center text-text-1 text-sm pb-5">Shows, festas, bares, teatros e workshops. Sua próxima experiência inesquecível começa aqui.</p>
          <div className="flex justify-center">
            <SearchBar />
          </div>          
        </div>  
      </section>

      <section>
        <FiltroCategorias />
      </section>

      <section className="px-8">
        <CarrosselDestaques />
      </section>

      <section className="px-8 pb-8">                
        <GradeEventos />
      </section>

    </main>
  );
}