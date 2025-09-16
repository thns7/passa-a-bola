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
  const [noticias, setNoticias] = useState([]);
  const router = useRouter();

  // Busca usuário
  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) setUser(JSON.parse(currentUser));
    else router.push("/login");
  }, [router]);

  // Carrega partidas
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

  // Busca notícias da API local
  useEffect(() => {
    fetch("/api/noticias")
      .then(res => res.json())
      .then(setNoticias)
      .catch(err => console.error(err));
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

      {/* Mobile */}
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

        <TituloAlt titulo="Principais Notícias" />

        {/* Lista de notícias */}
        <div className="space-y-8 mb-20">
          {noticias.map(noticia => (
            <Link key={noticia.id} href={noticia.link}>
              <div className="cursor-pointer mb-5 flex flex-col bg-white p-6 rounded-lg shadow hover:shadow-md transition">
                <h2 className="font-bold text-xl mb-2">{noticia.titulo}</h2>
                <p className="text-gray-600 mb-4">{noticia.resumo}</p>
                <img
                  src={noticia.imagem}
                  alt={noticia.titulo}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            </Link>
          ))}
        </div>
        <div className="fixed bottom-0 left-0 right-0 md:hidden">
          <BottomNav activeIndex={active} onChange={setActive} />
        </div>
      </div>

      {/* Desktop */}
<div className="hidden md:flex md:top-24 md:gap-6 md:p-12 relative">

  {/* Coluna esquerda fixa */}
  <div className="fixed top-20 left-12 w-[25%] space-y-6">
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
  </div>

  {/* Coluna de notícias */}
  <div className="ml-[30%] w-[65%] bg-white p-8 rounded-2xl shadow-lg space-y-6">
    <h1 className="text-3xl font-bold">Bem-vindo, {user.name}</h1>
    <p className="text-gray-600">
      Aqui você encontra tudo sobre o futebol feminino: partidas, resultados e notícias.
    </p>

    <TituloAlt titulo="Principais Notícias" />

    <div className="space-y-8">
      {noticias.map(noticia => (
        <Link key={noticia.id} href={noticia.link}>
          <div className="cursor-pointer mb-5 flex flex-col bg-gray-100 p-6 rounded-lg hover:shadow-md transition">
            <h2 className="font-bold text-xl mb-2">{noticia.titulo}</h2>
            <p className="text-gray-600 mb-4">{noticia.resumo}</p>
            <img
              src={noticia.imagem}
              alt={noticia.titulo}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        </Link>
      ))}
    </div>
  </div>
</div>

    </div>
  );
}
