"use client";

import { useRouter } from "next/navigation";
import HeroImage from "../components/HeroImage";
import CardSection from "../components/CardSection";
import AuthForm from "../components/AuthForm";
import FormInput from "../components/FormInput";
import FormButton from "../components/FormButton";

export default function RegisterPage() {
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push("/home"); 
  };

  return (
    <div className="bg-[var(--primary-color)] h-screen relative">
      <HeroImage />
      <CardSection title="Registrar" size="lg">
        <AuthForm onSubmit={handleSubmit}>
          <FormInput label="Nome" type="text" />
          <FormInput label="Email" type="email" />
          <FormInput label="Senha" type="password" />
          <FormInput label="Confirmar Senha" type="password" />
          <FormButton type="submit">Registrar</FormButton>
        </AuthForm>

        <p className="text-center text-sm mt-4">
          Já tem conta?{" "}
          <span
            className="text-[var(--primary-color)] font-semibold cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Entrar
          </span>
        </p>
      </CardSection>
    </div>
  );
}
