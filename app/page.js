import CardSection from "./components/CardSection";
import HeroImage from "./components/HeroImage";

export default function Home() {
  return (
    <div className="h-screen w-full overflow-hidden">
      {/* Mobile  */}
      <div className="md:hidden relative h-full">
        <HeroImage />
        <CardSection
          title="Bem vindo"
          description="Bem-vinda ao lugar onde o futebol feminino é protagonista. Conecte-se, jogue e inspire."
          showRegisterLogin
        />
      </div>

      {/* Desktop */}
      <div className="hidden md:flex h-full bg-white">
        
        <div className="flex-1 relative overflow-hidden bg-[var(--primary-color)]">
          
          <div className="absolute inset-16 rounded-3xl overflow-hidden border-4 border-white/20">
            <div className="h-full w-full flex items-center justify-center">
              <div className="w-4/5 h-full object-contain">
                <HeroImage />
              </div>
            </div>
          </div>
          
          {/* Título principal na imagem */}
          <div className="absolute top-12 left-12">
            <h1 className="text-5xl font-black text-white leading-tight">
              PASSA<br />A BOLA
            </h1>
            <div className="w-20 h-1 bg-white mt-3"></div>
          </div>

          {/* Elemento decorativo */}
          <div className="absolute bottom-12 right-12 text-white/30">
            <div className="text-xl font-black text-right space-y-1">
              <div>JOGUE</div>
              <div>CONECTE</div>
              <div>EVOLUA</div>
            </div>
          </div>
        </div>

        
        <div className="flex-1 relative min-w-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--primary-color)]/5 rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-[var(--primary-color)]/5 rounded-full translate-x-24 translate-y-24"></div>
          </div>

          
          <div className="relative z-10 h-full flex items-center justify-start pl-12">
            <div className="max-w-sm w-full">
              {/* Conteúdo textual direto */}
              <div className="space-y-8 mb-10">
                <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                  Sua Jornada<br />Começa Aqui
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  O espaço dedicado onde o futebol feminino ganha vida. 
                  Conecte atletas, crie histórias, transforme o jogo.
                </p>
              </div>

              {/* CardSection */}
              <div className="transform -mx-2">
                <CardSection showRegisterLogin size="lg" />
              </div>

              {/* Texto de rodapé */}
              <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm font-medium">
                   Partidas •  Comunidade •  Competições
                </p>
              </div>
            </div>
          </div>

          {/* Linha decorativa vertical */}
          <div className="absolute top-0 bottom-0 left-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}