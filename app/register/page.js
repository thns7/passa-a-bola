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

  const handleSubmit = async (e) => {
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

    try {
      const res = await fetch("https://passa-a-bola.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Erro ao registrar.");
        return;
      }

      router.push("/login");
    } catch (err) {
      console.error(err);
      setError("Erro de conexão com o servidor.");
    }
  };

  return (
    <div className="h-screen w-full">
      {/* Mobile */}
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

      {/* Desktop */}
      <div className="hidden md:grid grid-cols-2 h-full">
        {/* Esquerda */}
        <div className="bg-[var(--primary-color)] flex items-center justify-center">
          <div className="w-[50vh]">
            <HeroImage />
          </div>
        </div>

        {/* Direita */}
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