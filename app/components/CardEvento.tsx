//o componente vai receber essas propriedades (props) para ser reutilizável
interface PropsCardEvento {
  titulo: string;
  data: string;
  local: string;
  imagem: string;
  preco: string;
}

export function CardEvento({ titulo, data, local, imagem, preco }: PropsCardEvento) {
  return (    
    <div className="bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col group cursor-pointer">
      
      {/* área da imagem */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imagem} 
          alt={titulo} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* badge de preço flutuando em cima da imagem */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          {preco}
        </div>
      </div>

      {/* área de informações */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{titulo}</h3>        
        <div className="text-sm text-gray-600 mb-4 flex-1 space-y-1">
          <p>📅 {data}</p>
          <p>📍 {local}</p>
        </div>
        
        <button className="w-full bg-background-button text-text-button font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity">
          Comprar Ingresso
        </button>
      </div>

    </div>
  );
}