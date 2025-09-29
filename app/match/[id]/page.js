"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function MatchDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [match, setMatch] = useState(undefined);
  const [tab, setTab] = useState("status");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        setLoading(true);
        
        // ✅ Busca da API (sistema híbrido)
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://passa-a-bola.onrender.com';
        const response = await fetch(`${API_URL}/api/matches/${id}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          // Se encontrou na API, usa esses dados
          setMatch(formatMatchData(data.data));
        } else {
          // Se não encontrou, tenta o localStorage como fallback
          const stored = localStorage.getItem("matches");
          if (stored) {
            const matches = JSON.parse(stored);
            const localMatch = matches.find((x) => String(x.id) === String(id));
            setMatch(localMatch || null);
          } else {
            setMatch(null);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes da partida:", error);
        // Fallback para localStorage
        try {
          const stored = localStorage.getItem("matches");
          if (stored) {
            const matches = JSON.parse(stored);
            const localMatch = matches.find((x) => String(x.id) === String(id));
            setMatch(localMatch || null);
          } else {
            setMatch(null);
          }
        } catch (err) {
          setMatch(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMatchDetails();
  }, [id]);

  // Função para formatar dados da API para o formato do componente
  const formatMatchData = (apiMatch) => {
    return {
      id: apiMatch.fixture.id,
      campeonato: apiMatch.league.name,
      timeCasa: apiMatch.teams.home.name,
      timeVisitante: apiMatch.teams.away.name,
      logoCasa: apiMatch.teams.home.logo,
      logoVisitante: apiMatch.teams.away.logo,
      placarCasa: apiMatch.goals.home ?? 0,
      placarVisitante: apiMatch.goals.away ?? 0,
      tempo: apiMatch.fixture.status.elapsed ? `${apiMatch.fixture.status.elapsed}′` : "0′",
      data: new Date(apiMatch.fixture.date).toLocaleDateString('pt-BR'),
      hora: new Date(apiMatch.fixture.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      // ✅ Dados mockados para estatísticas (já que a API free não tem)
      stats: {
        chutes: [Math.floor(Math.random() * 10) + 5, Math.floor(Math.random() * 10) + 3],
        chutesAoGol: [Math.floor(Math.random() * 5) + 2, Math.floor(Math.random() * 5) + 1],
        posse: [`${Math.floor(Math.random() * 30) + 35}%`, `${Math.floor(Math.random() * 30) + 35}%`],
        passes: [Math.floor(Math.random() * 200) + 300, Math.floor(Math.random() * 200) + 250],
        precisao: [`${Math.floor(Math.random() * 20) + 75}%`, `${Math.floor(Math.random() * 20) + 70}%`],
        faltas: [Math.floor(Math.random() * 10) + 5, Math.floor(Math.random() * 10) + 5],
        amarelos: [Math.floor(Math.random() * 3), Math.floor(Math.random() * 3)],
        vermelhos: [Math.floor(Math.random() * 1), Math.floor(Math.random() * 1)],
        impedimentos: [Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)],
        escanteios: [Math.floor(Math.random() * 6) + 2, Math.floor(Math.random() * 6) + 1],
      }
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Carregando detalhes da partida...</p>
      </div>
    );
  }

  if (match === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-xl mb-4">Partida não encontrada</p>
          <button 
            onClick={() => router.push("/home")}
            className="bg-[var(--primary-color)] text-white px-4 py-2 rounded"
          >
            Voltar para a Home
          </button>
        </div>
      </div>
    );
  }

  const stats = match.stats || {};

  return (
    <div className="bg-gray-100 min-h-screen">
      
      <div className="bg-[var(--primary-color)] text-white px-4 py-15 rounded-b-2xl flex items-center gap-4 md:gap-20">
        <button onClick={() => router.back()}>
          <img src="/seta.png" alt="Voltar" className="w-6 h-6 md:w-8 md:h-8" />
        </button>
        <h1 className="font-semibold text-lg md:text-2xl">{match.campeonato}</h1>
      </div>

      
      <div className="max-w-[23.75rem] mx-auto -mt-6 md:max-w-3xl">
        <div className="bg-white rounded-xl shadow p-4 flex items-center md:flex-row justify-between md:p-6">
          <div className="flex flex-col items-center md:items-start md:gap-2">
            <img src={match.logoCasa} alt={match.timeCasa} className="w-12 h-12 md:w-16 md:h-16" />
            <p className="mt-1 text-sm md:text-base">{match.timeCasa}</p>
            <span className="text-xs text-gray-500 md:text-sm">Casa</span>
          </div>

          <div className="flex flex-col items-center my-3 md:my-0">
            <p className="text-3xl font-bold md:text-5xl">
              {match.placarCasa} : {match.placarVisitante}
            </p>
            <span className="mt-1 text-xs bg-gray-200 px-2 py-0.5 rounded md:text-sm">
              {match.tempo}
            </span>
            <span className="text-xs text-gray-500 mt-1">{match.data} - {match.hora}</span>
          </div>

          <div className="flex flex-col items-center md:items-end md:gap-2">
            <img src={match.logoVisitante} alt={match.timeVisitante} className="w-12 h-12 md:w-16 md:h-16" />
            <p className="mt-1 text-sm md:text-base">{match.timeVisitante}</p>
            <span className="text-xs text-gray-500 md:text-sm">Visitante</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-[23.75rem] mx-auto mt-4 md:max-w-3xl">
        <div className="flex bg-gray-200 rounded-lg p-1">
          {["status", "escalacao", "sumario"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-md text-sm font-medium md:text-base ${
                tab === t ? "bg-white shadow text-purple-700" : "text-gray-600"
              }`}
            >
              {t === "status" ? "Status" : t === "escalacao" ? "Escalação" : "Sumário"}
            </button>
          ))}
        </div>

        {/* Conteúdo da Tab */}
        <div className="mt-4 bg-white p-4 rounded-lg shadow md:p-6">
          {tab === "status" && (
            <div className="grid grid-cols-3 gap-y-4 text-base md:text-lg">
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
            <div className="text-center text-gray-500">
              <p>Escalação disponível apenas para assinantes</p>
              <p className="text-sm mt-2">Com a API premium, você terá acesso à escalação completa dos times.</p>
            </div>
          )}
          
          {tab === "sumario" && (
            <div className="text-center text-gray-500">
              <p>Sumário do jogo disponível apenas para assinantes</p>
              <p className="text-sm mt-2">Com a API premium, você terá acesso aos eventos detalhados da partida.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}