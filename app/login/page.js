"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import HeroImage from "../components/HeroImage";
import CardSection from "../components/CardSection";
import AuthForm from "../components/AuthForm";
import FormInput from "../components/FormInput";
import FormButton from "../components/FormButton";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const form = e.target;
    const email = form[0].value;
    const password = form[1].value;

    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Erro ao logar.");
        return;
      }

      const data = await res.json();
      // Salva info do usuário logado (opcional)
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      router.push("/home");
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
        <CardSection title="Login" size="base">
          <AuthForm onSubmit={handleSubmit}>
            <FormInput label="Email" type="text" name="email" />
            <FormInput label="Senha" type="password" name="password" />
            <FormButton type="submit">Entrar</FormButton>
          </AuthForm>

          {error && <p className="text-red-500 text-center mt-2">{error}</p>}

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

      {/* Desktop */}
      <div className="hidden md:grid grid-cols-2 h-full">
        <div className="bg-[var(--primary-color)] flex items-center justify-center">
          <div className=" w-[50vh] ">
            <HeroImage />
          </div>
        </div>

        <div className="flex items-center bg-white p-12">
          <div className="max-w-md w-full text-left">
            <h1 className="text-4xl font-bold mb-6">Login</h1>

            <AuthForm onSubmit={handleSubmit}>
              <FormInput label="Email" type="text" name="email" />
              <FormInput label="Senha" type="password" name="password" />
              <FormButton type="submit">Entrar</FormButton>
            </AuthForm>

            {error && <p className="text-red-500 mt-2">{error}</p>}

            <p className="text-sm mt-4">
              Não tem conta?{" "}
              <span
                className="text-[var(--primary-color)] font-semibold cursor-pointer"
                onClick={() => router.push("/register")}
              >
                Registrar
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}