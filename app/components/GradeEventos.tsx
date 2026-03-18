import { CardEvento } from "./CardEvento";
import { todosEventos } from "../data/eventosTeste";

export function GradeEventos() {
  return (
    <section className="w-full"> 
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-6 sm:mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-black">
              Próximos Eventos
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm font-medium">
              Encontramos <span className="text-black font-bold">{todosEventos.length}</span> eventos na cidade
            </p>    
        </div>     
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {todosEventos.map((evento) => (
          <CardEvento 
            key={evento.id}
            id={evento.id}
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