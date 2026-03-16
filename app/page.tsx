import { CarrosselDestaques } from "./components/CarrosselDestaques";
import { FiltroCategorias } from "./components/FiltroCategorias";
import { GradeEventos } from "./components/GradeEventos";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import IconMegafone from "./components/IconMegafone";
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
      
      <Header />

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

      <section className="bg-[#1E3A8A] py-6 px-4 md:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">   
          <div className="flex flex-col text-left text-white font-bold text-sm md:text-[1rem] leading-snug">
            <p>Organiza eventos em Franca? Simplifique sua divulgação, pare de espalhar informações em dezenas de grupos.</p>
            <p>Publique uma vez na Franca Eventos e seja encontrado por quem procura cultura e lazer na cidade.</p>
          </div>          
          <button className="bg-background-button text-text-button font-bold py-3 px-8 rounded-full flex items-center gap-3 hover:scale-105 transition-all shadow-lg whitespace-nowrap group">            
            <IconMegafone />            
            <span className="text-sm md:text-base">Quero Divulgar</span>
          </button>          
        </div>
      </section>

      <Footer />

    </main>
  );
}