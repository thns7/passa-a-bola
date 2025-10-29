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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.target;
    const email = form[0].value;
    const password = form[1].value;

    try {
      const res = await fetch("https://passa-a-bola.onrender.com/login", {
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
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      router.push("/home");
    } catch (err) {
      console.error(err);
      setError("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full md:overflow-hidden">
      {/* Mobile */}
      <div className="md:hidden relative min-h-screen bg-[var(--primary-color)]">
        <HeroImage />
        <div className="px-4 pb-8">
          <CardSection title="Login" size="base">
            <AuthForm onSubmit={handleSubmit}>
              <FormInput label="Email" type="text" name="email" disabled={loading} />
              <FormInput label="Senha" type="password" name="password" disabled={loading} />
              <FormButton type="submit" disabled={loading}>
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Entrando...</span>
                  </div>
                ) : (
                  "Entrar"
                )}
              </FormButton>
            </AuthForm>

            {error && <p className="text-red-500 text-center mt-2">{error}</p>}

            <p className="text-center text-sm mt-4 mb-8">
              Não tem conta?{" "}
              <span
                className="text-[var(--primary-color)] font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => !loading && router.push("/register")}
              >
                Registrar
              </span>
            </p>
          </CardSection>
        </div>
      </div>

      {/* Desktop - com overflow-hidden e ajustes para não cortar */}
      <div className="hidden md:flex h-screen bg-white">
        
        <div className="flex-1 relative overflow-hidden bg-[var(--primary-color)]">
          
          <div className="absolute inset-8 lg:inset-12 xl:inset-16 rounded-3xl overflow-hidden border-4 border-white/20">
            <div className="h-full w-full flex items-center justify-center">
              <div className="w-4/5 h-full object-contain">
                <HeroImage />
              </div>
            </div>
          </div>
          
          {/* Título principal na imagem */}
          <div className="absolute top-8 lg:top-12 left-8 lg:left-12">
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight">
              PASSA<br />A BOLA
            </h1>
            <div className="w-16 lg:w-20 h-1 bg-white mt-2 lg:mt-3"></div>
          </div>

          {/* Elemento decorativo */}
          <div className="absolute bottom-8 lg:bottom-12 right-8 lg:right-12 text-white/30">
            <div className="text-lg lg:text-xl font-black text-right space-y-1">
              <div>JOGUE</div>
              <div>CONECTE</div>
              <div>EVOLUA</div>
            </div>
          </div>
        </div>

        {/* Lado direito - conteúdo */}
        <div className="flex-1 relative min-w-0 overflow-hidden">
          
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white">
            <div className="absolute top-0 left-0 w-24 lg:w-32 h-24 lg:h-32 bg-[var(--primary-color)]/5 rounded-full -translate-x-12 lg:-translate-x-16 -translate-y-12 lg:-translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-32 lg:w-48 h-32 lg:h-48 bg-[var(--primary-color)]/5 rounded-full translate-x-16 lg:translate-x-24 translate-y-16 lg:translate-y-24"></div>
          </div>

          {/* Container do conteúdo */}
          <div className="relative z-10 h-full flex items-center justify-start pl-8 lg:pl-12 pr-4">
            <div className="max-w-sm w-full">
              {/* Conteúdo textual */}
              <div className="space-y-6 lg:space-y-8 mb-8 lg:mb-10">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  Entre na<br />Sua Conta
                </h2>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
                  Acesse sua conta para conectar com outras atletas, 
                  agendar partidas e fazer parte da comunidade.
                </p>
              </div>

              {/* Formulário */}
              <div className="transform -mx-2">
                <AuthForm onSubmit={handleSubmit}>
                  <FormInput label="Email" type="text" name="email" disabled={loading} />
                  <FormInput label="Senha" type="password" name="password" disabled={loading} />
                  <FormButton type="submit" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Entrando...</span>
                      </div>
                    ) : (
                      "Entrar"
                    )}
                  </FormButton>
                </AuthForm>
              </div>

              {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

              {/* Link para registrar */}
              <div className="mt-6 lg:mt-8 text-center">
                <p className="text-gray-600 text-sm lg:text-base">
                  Não tem conta?{" "}
                  <span
                    className="text-[var(--primary-color)] font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => !loading && router.push("/register")}
                  >
                    Registrar
                  </span>
                </p>
                <p className="text-gray-400 text-xs lg:text-sm font-medium mt-3 lg:mt-4">
                   Partidas •  Comunidade •  Competições
                </p>
              </div>
            </div>
          </div>

          {/* Linha decorativa vertical */}
          <div className="absolute top-0 bottom-0 left-4 lg:left-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}