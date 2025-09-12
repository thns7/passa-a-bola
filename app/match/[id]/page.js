"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function MatchDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [match, setMatch] = useState(undefined);
  const [tab, setTab] = useState("status");

  useEffect(() => {
    const stored = localStorage.getItem("matches");
    if (!stored) {
      setMatch(null);
      return;
    }

    try {
      const matches = JSON.parse(stored);
      const m = matches.find((x) => String(x.id) === String(id));
      setMatch(m ?? null);
    } catch (err) {
      console.error("Erro ao parsear matches do localStorage:", err);
      setMatch(null);
    }
  }, [id]);


  if (match === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Carregando...</p>
      </div>
    );
  }


  if (match === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Partida não encontrada</p>
      </div>
    );
  }


  const defaultStats = {
    chutes: [0, 0],
    chutesAoGol: [0, 0],
    posse: ["0%", "0%"],
    passes: [0, 0],
    precisao: ["0%", "0%"],
    faltas: [0, 0],
    amarelos: [0, 0],
    vermelhos: [0, 0],
    impedimentos: [0, 0],
    escanteios: [0, 0],
  };

  const stats = { ...defaultStats, ...(match.stats || {}) };

  return (
    <div className="bg-gray-100 min-h-screen">
      
      <div className="bg-[var(--primary-color)] text-white px-4 py-15 rounded-b-2xl flex items-center gap-20">
        <button
          onClick={() => router.back()}
          className=""
        >
          <img src="/seta.png" alt="Voltar" className="w-6 h-6" />
        </button>
        <h1 className="font-semibold">{match.campeonato}</h1>
      </div>

      
      <div className="max-w-[23.75rem] mx-auto -mt-6">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="flex items-center justify-between w-full px-4">
            <div className="flex flex-col items-center">
              <img src={match.logoCasa} alt={match.timeCasa} className="w-12 h-12" />
              <p className="mt-1 text-sm">{match.timeCasa}</p>
              <span className="text-xs text-gray-500">Casa</span>
            </div>

            <div className="flex flex-col items-center">
              <p className="text-3xl font-bold">
                {match.placarCasa} : {match.placarVisitante}
              </p>
              <span className="mt-1 text-xs bg-gray-200 px-2 py-0.5 rounded">
                {match.tempo}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <img src={match.logoVisitante} alt={match.timeVisitante} className="w-12 h-12" />
              <p className="mt-1 text-sm">{match.timeVisitante}</p>
              <span className="text-xs text-gray-500">Visitante</span>
            </div>
          </div>
        </div>
      </div>

      
      <div className="max-w-[23.75rem] mx-auto mt-4">
        <div className="flex bg-gray-200 rounded-lg p-1">
          <button
            onClick={() => setTab("status")}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${
              tab === "status" ? "bg-white shadow text-purple-700" : "text-gray-600"
            }`}
          >
            Status
          </button>
          <button
            onClick={() => setTab("escalacao")}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${
              tab === "escalacao" ? "bg-white shadow text-purple-700" : "text-gray-600"
            }`}
          >
            Escalação
          </button>
          <button
            onClick={() => setTab("sumario")}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${
              tab === "sumario" ? "bg-white shadow text-purple-700" : "text-gray-600"
            }`}
          >
            Sumário
          </button>
        </div>

        
        <div className="mt-4 bg-white p-4 rounded-lg shadow">
          {tab === "status" && (
            <div className="grid grid-cols-3 gap-y-4 text-base">
                <span>Chutes</span>
                <span className="text-center">{stats.chutes?.[0]}</span>
                <span className="text-right">{stats.chutes?.[1]}</span>

                <span>Chutes ao gol</span>
                <span className="text-center">{stats.chutesAoGol?.[0]}</span>
                <span className="text-right">{stats.chutesAoGol?.[1]}</span>

                <span>Posse de bola</span>
                <span className="text-center">{stats.posse?.[0]}</span>
                <span className="text-right">{stats.posse?.[1]}</span>

                <span>Passes</span>
                <span className="text-center">{stats.passes?.[0]}</span>
                <span className="text-right">{stats.passes?.[1]}</span>

                <span>Precisão de passe</span>
                <span className="text-center">{stats.precisao?.[0]}</span>
                <span className="text-right">{stats.precisao?.[1]}</span>

                <span>Faltas</span>
                <span className="text-center">{stats.faltas?.[0]}</span>
                <span className="text-right">{stats.faltas?.[1]}</span>

                <span>Cartões amarelos</span>
                <span className="text-center">{stats.amarelos?.[0]}</span>
                <span className="text-right">{stats.amarelos?.[1]}</span>

                <span>Cartões vermelhos</span>
                <span className="text-center">{stats.vermelhos?.[0]}</span>
                <span className="text-right">{stats.vermelhos?.[1]}</span>

                <span>Impedimentos</span>
                <span className="text-center">{stats.impedimentos?.[0]}</span>
                <span className="text-right">{stats.impedimentos?.[1]}</span>

                <span>Escanteios</span>
                <span className="text-center">{stats.escanteios?.[0]}</span>
                <span className="text-right">{stats.escanteios?.[1]}</span>
            </div>
          )}

          {tab === "escalacao" && (
            <p className="text-sm text-gray-500">Aqui entraria a escalação dos times.</p>
          )}

          {tab === "sumario" && (
            <p className="text-sm text-gray-500">Aqui entraria o resumo da partida (gols, cartões, eventos).</p>
          )}
        </div>
      </div>
    </div>
  );
}
