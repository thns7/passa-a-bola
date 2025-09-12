import CardSection from "./components/CardSection";
import HeroImage from "./components/HeroImage";

export default function Home() {
  return (
    <div className="h-screen w-full">
      {/* Mobile: Hero em cima + card embaixo */}
      <div className="md:hidden relative h-full">
        <HeroImage />
        <CardSection
          title="Bem vindo"
          description="Bem-vinda ao lugar onde o futebol feminino é protagonista. Conecte-se, jogue e inspire."
          showRegisterLogin
        />
      </div>

      {/* Desktop: layout em duas colunas */}
      <div className="hidden md:grid grid-cols-2 h-full">
        {/* Lado esquerdo: Hero */}
        <div className="flex items-center justify-center bg-[var(--primary-color)]">
          <HeroImage />
        </div>

        {/* Lado direito: Card com título e descrição */}
        <div className="flex items-center justify-center  bg-white p-12">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-6">Bem vindo</h1>
            <p className="text-lg text-gray-600 mb-8">
              Bem-vinda ao lugar onde o futebol feminino é protagonista. 
              Conecte-se, jogue e inspire.
            </p>
            <CardSection showRegisterLogin size="lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
