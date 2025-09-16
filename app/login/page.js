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

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const email = form.get("email");
    const password = form.get("password");

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("currentUser", JSON.stringify(user));
      router.push("/home");
    } else {
      setError("Email ou senha inválidos");
    }
  };

  return (
    <div className="h-screen w-full">
      {/* Mobile*/}
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
        {/* Esquerda */}
        <div className="bg-[var(--primary-color)] flex items-center justify-center">
          <div className=" w-[50vh] ">
            <HeroImage />
          </div>
        </div>

        {/* Direita*/}
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
