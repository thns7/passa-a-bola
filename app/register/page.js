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
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.target;
    const name = form[0].value;
    const email = form[1].value;
    const username = form[2].value;
    const password = form[3].value;
    const confirmPassword = form[4].value;

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    // Validar username (sem espaços)
    if (username.includes(" ")) {
      setError("O username não pode conter espaços.");
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError("O username deve ter pelo menos 3 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://passa-a-bola.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, username }),
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
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e) => {
    // Remover espaços do username
    const value = e.target.value.replace(/\s/g, '');
    setUsername(value);
  };

  return (
    <div className="h-screen w-full ">
      {/* Mobile */}
      <div className="md:hidden relative h-full bg-[var(--primary-color)] ">
        <HeroImage />
        <CardSection title="Registrar" size="lg">
          <AuthForm onSubmit={handleSubmit}>
            <FormInput label="Nome Completo" type="text" required disabled={loading} />
            <FormInput label="Email" type="email" required disabled={loading} />
            <FormInput 
              label="Username" 
              type="text" 
              value={username}
              onChange={handleUsernameChange}
              placeholder="@usuario"
              required
              disabled={loading}
            />
            <FormInput label="Senha" type="password" required disabled={loading} />
            <FormInput label="Confirmar Senha" type="password" required disabled={loading} />
            <FormButton type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Registrando...</span>
                </div>
              ) : (
                "Registrar"
              )}
            </FormButton>
          </AuthForm>

          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

          <p className="text-center text-sm mt-4 ">
            Já tem conta?{" "}
            <span
              className="text-[var(--primary-color)] font-semibold cursor-pointer hover:opacity-80 transition-opacity "
              onClick={() => !loading && router.push("/login")}
            >
              Entrar
            </span>
          </p>
        </CardSection>
      </div>

      {/* Desktop  */}
      <div className="hidden md:flex h-full bg-white overflow-hidden">
        
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
            <div className="text-xl font-black te2xt-right space-y-1">
              <div>JOGUE</div>
              <div>CONECTE</div>
              <div>EVOLUA</div>
            </div>
          </div>
        </div>

        {/* Lado direito - conteúdo */}
        <div className="flex-1 relative min-w-0">
          
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--primary-color)]/5 rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-[var(--primary-color)]/5 rounded-full translate-x-24 translate-y-24"></div>
          </div>

          {/* Container do conteúdo */}
          <div className="relative z-10 h-full flex items-center justify-start pl-12">
            <div className="max-w-sm w-full">
              {/* Conteúdo textual */}
              <div className=" mb-5">
                <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                  Registre-se
                </h2>
              </div>

              {/* Formulário */}
              <div className="transform -mx-2">
                <AuthForm onSubmit={handleSubmit}>
                  <FormInput label="Nome Completo" type="text" required disabled={loading} />
                  <FormInput label="Email" type="email" required disabled={loading} />
                  <FormInput 
                    label="Username" 
                    type="text" 
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="@usuario"
                    required
                    disabled={loading}
                  />
                  <FormInput label="Senha" type="password" required disabled={loading} />
                  <FormInput label="Confirmar Senha" type="password" required disabled={loading} />
                  <FormButton type="submit" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Registrando...</span>
                      </div>
                    ) : (
                      "Registrar"
                    )}
                  </FormButton>
                </AuthForm>
              </div>

              {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

              {/* Link para login */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Já tem conta?{" "}
                  <span
                    className="text-[var(--primary-color)] font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => !loading && router.push("/login")}
                  >
                    Entrar
                  </span>
                </p>
                <p className="text-gray-400 text-sm font-medium mt-4">
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