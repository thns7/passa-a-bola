import CardSection from "./components/CardSection";
import HeroImage from "./components/HeroImage";

export default function Home() {
  return (
    <div className="h-screen w-full">
      {/* Mobile*/}
      <div className="md:hidden relative h-full">
        <HeroImage />
        <CardSection
          title="Bem vindo"
          description="Bem-vinda ao lugar onde o futebol feminino é protagonista. Conecte-se, jogue e inspire."
          showRegisterLogin
        />
      </div>

      {/* Desktop*/}
      <div className="hidden md:grid grid-cols-2 h-full">
        {/* Esquerda*/}
        <div className="bg-[var(--primary-color)] flex items-center justify-center">
          <div className=" w-[50vh] ">
            <HeroImage />
          </div>
        </div>

        {/* Lado direito:  */}
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
