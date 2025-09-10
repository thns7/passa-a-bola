"use client";

import CardSection from "../components/CardSection";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    router.push("/");
  };

  return (
    <div className="bg-[var(--primary-color)] h-screen relative">
      <CardSection title="Login" size="base">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 w-full"
        >
          <input
            type="text"
            placeholder="Email ou Username"
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <button
            type="submit"
            className="bg-[var(--primary-color)] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Entrar
          </button>
        </form>

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
