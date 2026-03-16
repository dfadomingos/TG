import IconHeader from "./IconHeader";
import Link from "next/link";

export function Header() {
  return (
    <header className="bg-background-1 p-3 flex items-center justify-start px-4">
      <Link href="/" className="flex items-center">
        <span className="text-text-1 mr-2.5"><IconHeader /></span>        
        <p className="text-text-1 font-bold text-lg">FrancaEventos</p>
      </Link>
    </header>
  );
}
