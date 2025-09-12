"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function MatchDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [match, setMatch] = useState(null);

  useEffect(() => {
    const matches = JSON.parse(localStorage.getItem("matches")) || [];
    const found = matches.find((m) => m.id === Number(id));
    if (found) {
      setMatch(found);
    }
  }, [id]);

  if (!match) {
    return (
      <div className="flex items-center justify-center h-screen">
        Partida não encontrada
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">{match.campeonato}</h1>
      <div className="flex justify-between items-center mt-4">
        <div className="text-center">
          <img src={match.logoCasa} alt={match.timeCasa} className="w-16 h-16 mx-auto" />
          <p>{match.timeCasa}</p>
        </div>

        <div className="text-2xl font-bold">
          {match.placarCasa} - {match.placarVisitante}
        </div>

        <div className="text-center">
          <img src={match.logoVisitante} alt={match.timeVisitante} className="w-16 h-16 mx-auto" />
          <p>{match.timeVisitante}</p>
        </div>
      </div>

      <p className="mt-4 text-center">Tempo: {match.tempo}</p>
      <p className="mt-2 text-center">{match.data} às {match.hora}</p>

      <button
        onClick={() => router.push("/home")}
        className="mt-6 w-full bg-[var(--primary-color)] text-white py-2 rounded-lg"
      >
        Voltar
      </button>
    </div>
  );
}
