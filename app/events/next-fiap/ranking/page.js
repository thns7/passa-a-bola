"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";

const API_BASE_URL = "https://passa-a-bola.onrender.com";

export default function NextFiapRanking() {
  const [ranking, setRanking] = useState([]);
  const [user, setUser] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }
  }, []);

  useEffect(() => {
    const carregarRanking = async () => {
      if (!user) return;
      
      try {
        setCarregando(true);
        setErro(null);

        const res = await fetch(`${API_BASE_URL}/api/ranking-next-fiap`);
        
        if (res.ok) {
          const data = await res.json();
          console.log('Ranking carregado:', data);
          
          if (data.success) {
            setRanking(data.data || []);
          } else {
            throw new Error('Erro na resposta da API');
          }
        } else {
          throw new Error('Erro ao carregar ranking do servidor');
        }

      } catch (error) {
        console.error('Erro ao carregar ranking:', error);
        setErro('Erro ao carregar ranking do servidor');
        
        const rankingLocal = JSON.parse(localStorage.getItem('ranking-next-fiap') || '[]');
        const rankingOrdenado = rankingLocal.sort((a, b) => (b.pontos || 0) - (a.pontos || 0));
        setRanking(rankingOrdenado);
      } finally {
        setCarregando(false);
      }
    };

    carregarRanking();
  }, [user]);

  const getPosicaoUsuario = () => {
    if (!user) return -1;
    return ranking.findIndex(item => item.user_id === user.id);
  };

  const usuarioAtual = user ? ranking.find(item => item.user_id === user.id) : null;

  return (
    <div className="bg-[#f5f6f8] min-h-screen">
      <Header name="Ranking NEXT FIAP" />
      
      <main className="pt-20 max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-center">
          <h1 className="text-3xl font-bold text-purple-800 mb-2">
            Ranking NEXT Passa a Bola
          </h1>
          <p className="text-gray-600 mb-4">
            Cada acerto = 10 pontos • 5 chutes por rodada
          </p>
          
          {erro && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700">{erro}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-600">Jogadores</p>
              <p className="text-xl font-bold text-purple-700">{ranking.length}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600">Total de Acertos</p>
              <p className="text-xl font-bold text-blue-700">
                {ranking.reduce((sum, player) => sum + (player.acertos || 0), 0)}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-sm text-green-600">Recorde</p>
              <p className="text-xl font-bold text-green-700">
                {ranking.length > 0 ? Math.max(...ranking.map(p => p.pontos || 0)) : 0} pts
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

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Classificação</h2>
          
          {carregando ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando ranking...</p>
            </div>
          ) : ranking.length > 0 ? (
            <div className="space-y-3">
              {ranking.map((player, index) => (
                <div
                  key={player.id || index}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    index === 0 
                      ? "bg-yellow-50 border-yellow-200 shadow-md" 
                      : player.user_id === user?.id
                      ? "bg-purple-50 border-purple-200 shadow-sm"
                      : "bg-white border-gray-100"
                  } ${player.user_id === user?.id ? 'scale-105' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? "bg-yellow-400 text-white shadow-lg" :
                      index === 1 ? "bg-gray-400 text-white shadow-md" :
                      index === 2 ? "bg-orange-400 text-white shadow-md" :
                      player.user_id === user?.id ? "bg-purple-500 text-white shadow-sm" :
                      "bg-gray-200 text-gray-600"
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className={`font-semibold text-lg ${
                        player.user_id === user?.id ? "text-purple-700" : "text-gray-800"
                      }`}>
                        {player.nome || "Jogador"} {player.user_id === user?.id && "(Você)"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(player.acertos || 0)} acertos • {player.created_at ? new Date(player.created_at).toLocaleDateString('pt-BR') : "Data não disponível"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-700">
                      {player.pontos || 0} pts
                    </p>
                    {index === 0 && (
                      <p className="text-xs text-yellow-600 font-bold mt-1">LÍDER</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold text-gray-700 mb-2">Ranking Vazio</h3>
              <p className="text-gray-500 mb-6">Seja o primeiro a participar do desafio!</p>
              <button
                onClick={() => router.push("/events/next-fiap")}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105"
              >
                Participar do Desafio
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push("/events/next-fiap")}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg transition transform hover:scale-105 text-lg"
          >
            Fazer Outra Rodada
          </button>
          <button
            onClick={() => router.push("/events")}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 rounded-lg transition transform hover:scale-105 text-lg"
          >
            Voltar aos Eventos
          </button>
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Ranking atualizado automaticamente a cada rodada</p>
          <p>Vencedor será anunciado no final do NEXT FIAP!</p>
          {usuarioAtual && (
            <p className="mt-2 text-purple-600 font-semibold">
              Sua melhor pontuação: <strong>{usuarioAtual.pontos || 0} pontos</strong>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}