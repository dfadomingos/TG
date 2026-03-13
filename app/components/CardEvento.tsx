import  IconLocal from "./IconLocal";
import IconHora from "./IconHora";
import IconHeart from "./IconHeart";

//o componente vai receber essas propriedades (props) para ser reutilizável
interface PropsCardEvento {
  titulo: string;
  data: string;
  local: string;
  imagem: string;
  hora: string;
  preco: string;
}

export function CardEvento({ titulo, data, local, imagem, hora, preco }: PropsCardEvento) {
  return (    
    <div className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col group cursor-pointer">
      
      {/* área da imagem */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imagem} 
          alt={titulo} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* badge de data flutuando em cima da imagem */}
        <div className="absolute top-1 left-1 bg-white/80 backdrop-blur-sm text-gray-900 text-xs font-bold px-3 py-3 rounded-lg shadow-sm">
          {data}
        </div>
        <div className="absolute top-1 right-1 bg-white/80 backdrop-blur-sm text-gray-900 text-xs font-bold p-3 rounded-lg shadow-sm">
          <IconHeart />
        </div>
        
      </div>

      {/* área de informações */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{titulo}</h3>        
        <div className="text-sm text-gray-600 mb-4 flex-1 space-y-1">
          <p className="flex items-center gap-1.5"><IconLocal /> {local}</p>
          <p className="flex items-center gap-1.5"><IconHora /> {hora}</p>
        </div>        
        
        <button className="w-full bg-background-button text-text-button font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity">
          Visualizar Detalhes
        </button>
      </div>

    </div>
  );
}