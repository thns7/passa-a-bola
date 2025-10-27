"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";

export default function NextFiapRanking() {
  const [ranking, setRanking] = useState([]);
  const [user, setUser] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }

    // Carregar ranking do localStorage
    const carregarRanking = () => {
      try {
        const rankingSalvo = JSON.parse(localStorage.getItem('ranking-next-fiap') || '[]');
        
        // Agrupar por usuário e pegar melhor pontuação
        const rankingAgrupado = rankingSalvo.reduce((acc, item) => {
          const existing = acc.find(i => i.userId === item.userId);
          if (!existing || item.pontos > existing.pontos) {
            if (existing) {
              // Remove o anterior se existir
              acc = acc.filter(i => i.userId !== item.userId);
            }
            acc.push(item);
          }
          return acc;
        }, []);

        // Ordenar por pontos (maior primeiro)
        const rankingOrdenado = rankingAgrupado.sort((a, b) => b.pontos - a.pontos);
        
        setRanking(rankingOrdenado);
      } catch (error) {
        console.error("Erro ao carregar ranking:", error);
        setRanking([]);
      } finally {
        setCarregando(false);
      }
    };

    carregarRanking();
  }, []);

  const getPosicaoUsuario = () => {
    if (!user) return -1;
    return ranking.findIndex(item => item.userId === user.id);
  };

  const usuarioAtual = user ? ranking.find(item => item.userId === user.id) : null;

  return (
    <div className="bg-[#f5f6f8] min-h-screen">
      <Header name="Ranking NEXT FIAP" />
      
      <main className="pt-20 max-w-4xl mx-auto px-4 py-8">
        {/* Cabeçalho do Ranking */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-center">
          <h1 className="text-3xl font-bold text-purple-800 mb-2">
            🏆 Ranking NEXT Passa a Bola
          </h1>
          <p className="text-gray-600 mb-4">
            Cada acerto = 10 pontos • 3 chutes por rodada
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-600">Jogadores</p>
              <p className="text-xl font-bold text-purple-700">{ranking.length}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600">Total de Acertos</p>
              <p className="text-xl font-bold text-blue-700">
                {ranking.reduce((sum, player) => sum + player.acertos, 0)}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-sm text-green-600">Recorde</p>
              <p className="text-xl font-bold text-green-700">
                {ranking.length > 0 ? Math.max(...ranking.map(p => p.pontos)) : 0} pts
              </p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-600">Sua Posição</p>
              <p className="text-xl font-bold text-orange-700">
                {usuarioAtual ? `#${getPosicaoUsuario() + 1}` : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Ranking */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-center">📊 Classificação</h2>
          
          {carregando ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando ranking...</p>
            </div>
          ) : ranking.length > 0 ? (
            <div className="space-y-3">
              {ranking.map((player, index) => (
                <div
                  key={player.userId || index}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    index === 0 
                      ? "bg-yellow-50 border-yellow-200 shadow-md" 
                      : player.userId === user?.id
                      ? "bg-purple-50 border-purple-200 shadow-sm"
                      : "bg-white border-gray-100"
                  } ${player.userId === user?.id ? 'scale-105' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? "bg-yellow-400 text-white shadow-lg" :
                      index === 1 ? "bg-gray-400 text-white shadow-md" :
                      index === 2 ? "bg-orange-400 text-white shadow-md" :
                      player.userId === user?.id ? "bg-purple-500 text-white shadow-sm" :
                      "bg-gray-200 text-gray-600"
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className={`font-semibold text-lg ${
                        player.userId === user?.id ? "text-purple-700" : "text-gray-800"
                      }`}>
                        {player.nome} {player.userId === user?.id && "(Você)"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {player.acertos} acertos • {new Date(player.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-700">
                      {player.pontos} pts
                    </p>
                    {index === 0 && (
                      <p className="text-xs text-yellow-600 font-bold mt-1">🏆 LÍDER</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 text-gray-300">📊</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Ranking Vazio</h3>
              <p className="text-gray-500 mb-6">Seja o primeiro a participar do desafio!</p>
              <button
                onClick={() => router.push("/events/next-fiap")}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105"
              >
                🎯 Participar do Desafio
              </button>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push("/events/next-fiap")}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg transition transform hover:scale-105 text-lg"
          >
            🎯 Fazer Outra Rodada
          </button>
          <button
            onClick={() => router.push("/events")}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 rounded-lg transition transform hover:scale-105 text-lg"
          >
            📅 Voltar aos Eventos
          </button>
        </div>

        {/* Informações */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>⚡ Ranking atualizado automaticamente a cada rodada</p>
          <p>🏆 Vencedor será anunciado no final do NEXT FIAP!</p>
          {usuarioAtual && (
            <p className="mt-2 text-purple-600 font-semibold">
              Sua melhor pontuação: <strong>{usuarioAtual.pontos} pontos</strong>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}