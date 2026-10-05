import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-background-1 flex items-center justify-center">
      <div className="px-4 py-4 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 text-center">
        <p className="text-text-1 font-regular text-xs">© 2026 FrancaEventos. Todos os direitos reservados.</p>
        <span className="hidden sm:inline text-text-1/60 text-xs">•</span>
        <Link 
          href="/termos" 
          className="text-text-1/80 hover:text-[#F59E0B] hover:underline font-medium text-xs transition-colors"
        >
          Termos de Uso e Privacidade
        </Link>
      </div>
    </footer>
  );
}
