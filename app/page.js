import CardSection from "./components/CardSection";
import HeroImage from "./components/HeroImage";

export default function Home() {
  return (
    <>
      <HeroImage />
      <CardSection
        title="Bem vindo"
        description="Bem-vinda ao lugar onde o futebol feminino é protagonista. Conecte-se, jogue e inspire."
        showRegisterLogin
      />
    </>
  );
}
