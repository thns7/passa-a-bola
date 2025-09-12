"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "../components/BottomNav";
import Header from "../components/Header";
import MatchCard from "../components/MatchCard";
import NextMatchCard from "../components/NextMatch";
import TextLink from "../components/TextLink";
import TituloAlt from "../components/TituloAlt";

export default function HomePage() {
  const [active, setActive] = useState(0);
  const [user, setUser] = useState(null);
  const router = useRouter();


  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    } else {
      router.push("/login");
    }
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
      stats: {
        chutes: [5, 7],
        chutesAoGol: [2, 4],
        posse: ["33%", "67%"],
        passes: [387, 523],
        precisao: ["65%", "77%"],
        faltas: [6, 7],
        amarelos: [0, 1],
        vermelhos: [1, 0],
        impedimentos: [3, 2],
        escanteios: [5, 9],
      },
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
    <div className="bg-[#F0F0F0] h-screen">
      <Header name={user.name || "Usuário"} />

      <main className="max-w-[23.75rem] mx-auto px-4">
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
      </main>

      <BottomNav activeIndex={active} onChange={setActive} />
    </div>
  );
}
