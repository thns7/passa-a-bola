"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import MatchCard from "../components/MatchCard";
import NextMatchCard from "../components/NextMatch";
import TextLink from "../components/TextLink";
import TituloAlt from "../components/TituloAlt";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState(0); 
  const router = useRouter();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) setUser(JSON.parse(currentUser));
    else router.push("/login");
  }, [router]);

  useEffect(() => {
    const matches = [
      {
        id: 1,
        campeonato: "Brasileirão Feminino",
        timeCasa: "Corinthians",
        timeVisitante: "São Paulo",
        logoCasa: "/corinthians.png",
        logoVisitante: "/spfc.png",
        placarCasa: 0,
        placarVisitante: 3,
        tempo: "76’",
        data: "14 de maio",
        hora: "18:00",
      },
    ];
    localStorage.setItem("matches", JSON.stringify(matches));
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        Carregando...
      </div>
    );
  }

  return (
    <div className="bg-[#F0F0F0] min-h-screen">
      <Header name={user.name || "Usuário"} />

      
      <div className="md:hidden px-4">
        <TituloAlt titulo="Ao vivo" />

        <Link href="/match/1">
          <div className="cursor-pointer">
            <MatchCard
              campeonato="Brasileirão Feminino"
              timeCasa="Corinthians"
              timeVisitante="São Paulo"
              logoCasa="/corinthians.png"
              logoVisitante="/spfc.png"
              placarCasa={0}
              placarVisitante={3}
              tempo="76’"
            />
          </div>
        </Link>

        <div className="flex justify-between mt-6">
          <TituloAlt titulo="Partidas" />
          <TextLink>
            <p className="my-3">Ver todos</p>
          </TextLink>
        </div>

        <NextMatchCard
          timeCasa="Flamengo"
          timeVisitante="Fluminense"
          logoCasa="/flamengo.png"
          logoVisitante="/fluminense.png"
          hora="18:00"
          data="14 de maio"
        />
        <NextMatchCard
          timeCasa="Flamengo"
          timeVisitante="Fluminense"
          logoCasa="/flamengo.png"
          logoVisitante="/fluminense.png"
          hora="18:00"
          data="14 de maio"
        />

        <TituloAlt titulo="Principais Notícias" />

        <button
          onClick={() => {
            localStorage.removeItem("currentUser");
            router.push("/login");
          }}
          className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg"
        >
          Sair
        </button>

        
        <div className="fixed bottom-0 left-0 right-0 md:hidden">
          <BottomNav activeIndex={active} onChange={setActive} />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:grid md:grid-cols-3 gap-6 p-12">
        {/* Coluna 1: Ao vivo + Partidas */}
        <div className="space-y-6">
          <TituloAlt titulo="Ao vivo" />
          <Link href="/match/1">
            <div className="cursor-pointer">
              <MatchCard
                campeonato="Brasileirão Feminino"
                timeCasa="Corinthians"
                timeVisitante="São Paulo"
                logoCasa="/corinthians.png"
                logoVisitante="/spfc.png"
                placarCasa={0}
                placarVisitante={3}
                tempo="76’"
              />
            </div>
          </Link>

          <div className="flex justify-between">
            <TituloAlt titulo="Partidas" />
            <TextLink>
              <p className="my-3">Ver todos</p>
            </TextLink>
          </div>

          <NextMatchCard
            timeCasa="Flamengo"
            timeVisitante="Fluminense"
            logoCasa="/flamengo.png"
            logoVisitante="/fluminense.png"
            hora="18:00"
            data="14 de maio"
          />
          <NextMatchCard
            timeCasa="Flamengo"
            timeVisitante="Fluminense"
            logoCasa="/flamengo.png"
            logoVisitante="/fluminense.png"
            hora="18:00"
            data="14 de maio"
          />
        </div>

        {/* Coluna 2 & 3: Notícias / Destaques */}
        <div className="col-span-2 bg-white p-8 rounded-2xl shadow-lg space-y-6">
          <h1 className="text-3xl font-bold">Bem-vindo, {user.name}</h1>
          <p className="text-gray-600">
            Aqui você encontra tudo sobre o futebol feminino: partidas, resultados e notícias.
          </p>

          <TituloAlt titulo="Principais Notícias" />

          <button
            onClick={() => {
              localStorage.removeItem("currentUser");
              router.push("/login");
            }}
            className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
