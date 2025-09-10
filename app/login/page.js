"use client";

import { useRouter } from "next/navigation";
import HeroImage from "../components/HeroImage";
import CardSection from "../components/CardSection";
import AuthForm from "../components/AuthForm";
import FormInput from "../components/FormInput";
import FormButton from "../components/FormButton";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push("/");
  };

  return (
    <div className="bg-[var(--primary-color)] h-screen relative">
      <HeroImage />
      <CardSection title="Login" size="base">
        <AuthForm onSubmit={handleSubmit}>
          <FormInput label="Email" type="text" />
          <FormInput label="Senha" type="password" />
          <FormButton type="submit">Entrar</FormButton>
        </AuthForm>

        <p className="text-center text-sm mt-4">
          Não tem conta?{" "}
          <span
            className="text-[var(--primary-color)] font-semibold cursor-pointer"
            onClick={() => router.push("/register")}
          >
            Registrar
          </span>
        </p>
      </CardSection>
    </div>
  );
}
