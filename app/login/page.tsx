import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { LoginHero } from "./components/LoginHero";
import { HomeCTA } from "../components/HomeCTA";

export const metadata = {
  title: "Login | FrancaEventos",
  description: "Faça login na plataforma FrancaEventos para descobrir os melhores eventos de Franca.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0D47A1] font-(--font-family) selection:bg-blue-100 flex flex-col">
      <Header />
      <LoginHero />
      <Footer />
    </main>
  );
}
