import { CardEvento } from "./CardEvento";
import { todosEventos } from "../data/eventosTeste";

export function GradeEventos() {
  return (
    <section className="w-full"> 
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold mb-3">Próximos Eventos</h2>
            <p className="text-gray-400 text-sm mb-3">
             Foram encontrados <span className="text-black font-bold">{todosEventos.length}</span> eventos
            </p>    
        </div>     
      {/* grid-cols-1 (celular), sm:grid-cols-2 (tablet), lg:grid-cols-4 (desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {todosEventos.map((evento) => (
          <CardEvento 
            key={evento.id}
            titulo={evento.titulo}
            data={evento.data}
            local={evento.local}
            imagem={evento.imagem}
            hora={evento.hora}
            preco={evento.preco}
          />
        ))}
      </div>
    </section>
  );
}