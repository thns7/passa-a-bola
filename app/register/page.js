"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import HeroImage from "../components/HeroImage";
import CardSection from "../components/CardSection";
import AuthForm from "../components/AuthForm";
import FormInput from "../components/FormInput";
import FormButton from "../components/FormButton";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const form = e.target;
    const name = form[0].value;
    const email = form[1].value;
    const password = form[2].value;
    const confirmPassword = form[3].value;

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.find((u) => u.email === email)) {
      setError("Esse email já está registrado.");
      return;
    }

    users.push({ name, email, password });
    localStorage.setItem("users", JSON.stringify(users));

    router.push("/login");
  };

  return (
    <div className="h-screen w-full">
      {/* Mobile: Hero em cima + Card embaixo */}
      <div className="md:hidden relative h-full bg-[var(--primary-color)]">
        <HeroImage />
        <CardSection title="Registrar" size="lg">
          <AuthForm onSubmit={handleSubmit}>
            <FormInput label="Nome" type="text" />
            <FormInput label="Email" type="email" />
            <FormInput label="Senha" type="password" />
            <FormInput label="Confirmar Senha" type="password" />
            <FormButton type="submit">Registrar</FormButton>
          </AuthForm>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

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

      {/* Desktop: duas colunas */}
      <div className="hidden md:grid grid-cols-2 h-full">
        {/* Esquerda: Hero */}
        <div className="bg-[var(--primary-color)] flex items-center justify-center">
          <HeroImage />
        </div>

        {/* Direita: Formulário alinhado à esquerda */}
        <div className="flex items-center bg-white p-12">
          <div className="max-w-md w-full text-left">
            <h1 className="text-4xl font-bold mb-6">Registrar</h1>

            <AuthForm onSubmit={handleSubmit}>
              <FormInput label="Nome" type="text" />
              <FormInput label="Email" type="email" />
              <FormInput label="Senha" type="password" />
              <FormInput label="Confirmar Senha" type="password" />
              <FormButton type="submit">Registrar</FormButton>
            </AuthForm>

            {error && <p className="text-red-500 mt-2">{error}</p>}

            <p className="text-sm mt-4">
              Já tem conta?{" "}
              <span
                className="text-[var(--primary-color)] font-semibold cursor-pointer hover:underline"
                onClick={() => router.push("/login")}
              >
                Entrar
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
