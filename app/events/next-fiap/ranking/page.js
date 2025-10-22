"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";

export default function NextFiapRanking() {
  const [ranking, setRanking] = useState([]);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) setUser(JSON.parse(currentUser));

    const mockRanking = [
      { id: 1, nome: "Ana Silva", pontos: 30, acertos: 3, rodadas: 1 },
      { id: 2, nome: "Maria Santos", pontos: 20, acertos: 2, rodadas: 1 },
      { id: 3, nome: "Joana Oliveira", pontos: 10, acertos: 1, rodadas: 1 },
    ];
    
    setRanking(mockRanking);
  }, []);

  return (
    <div className="bg-[#f5f6f8] min-h-screen">
      <Header name="Ranking NEXT FIAP" />
      
      <main className="pt-20 max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-center">
          <h1 className="text-3xl font-bold text-purple-800 mb-2">🏆 Ranking</h1>
          <p className="text-gray-600 mb-4">Cada acerto = 10 pontos • 3 chutes por rodada</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-center">📊 Classificação</h2>
          
          <div className="space-y-3">
            {ranking.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  index === 0 ? "bg-yellow-50 border-yellow-200" : "bg-white border-gray-100"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? "bg-yellow-400 text-white" :
                    index === 1 ? "bg-gray-400 text-white" :
                    "bg-orange-400 text-white"
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{player.nome}</p>
                    <p className="text-sm text-gray-500">{player.acertos} acertos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-purple-700">{player.pontos} pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => router.push("/events/next-fiap")}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition"
          >
            🎯 Fazer Rodada
          </button>
          <button
            onClick={() => router.push("/events")}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition"
          >
            📅 Voltar
          </button>
        </div>
      </main>
    </div>
  );
}