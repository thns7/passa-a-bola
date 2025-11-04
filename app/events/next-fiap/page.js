"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";

const API_BASE_URL = "https://passa-a-bola.onrender.com";

export default function NextFiapEvent() {
  const [user, setUser] = useState(null);
  const [rodadaAtiva, setRodadaAtiva] = useState(false);
  const [chutesRestantes, setChutesRestantes] = useState(5);
  const [pontos, setPontos] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const [mostrarInputNome, setMostrarInputNome] = useState(false);
  const [nomeJogador, setNomeJogador] = useState("");
  const [isClient, setIsClient] = useState(false);
  
  const pontosRef = useRef(0);
  const acertosRef = useRef(0);
  const chutesRestantesRef = useRef(5);
  
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const currentUser = localStorage.getItem("currentUser");
      if (currentUser) {
        try {
          const parsedUser = JSON.parse(currentUser);
          setUser(parsedUser);
          setNomeJogador(parsedUser.name || "");
        } catch (error) {
          console.error("Erro ao parsear usuário:", error);
        }
      }
    }
  }, [isClient]);

  const iniciarRodada = () => {
    setMostrarInputNome(true);
  };

  const confirmarNomeEIniciar = () => {
    if (!nomeJogador.trim()) {
      setErro("Por favor, digite seu nome para começar a rodada!");
      return;
    }

    setMostrarInputNome(false);
    setRodadaAtiva(true);
    setChutesRestantes(5);
    setPontos(0);
    setAcertos(0);
    setMostrarResultado(false);
    setErro(null);
    
    pontosRef.current = 0;
    acertosRef.current = 0;
    chutesRestantesRef.current = 5;

    console.log(`Rodada iniciada para: ${nomeJogador}`);
  };

  const cancelarRodada = () => {
    setMostrarInputNome(false);
    setNomeJogador(user?.name || "");
  };

  const registrarAcerto = () => {
    if (!rodadaAtiva || chutesRestantesRef.current <= 0) return;

    pontosRef.current += 10;
    acertosRef.current += 1;
    chutesRestantesRef.current -= 1;

    setPontos(pontosRef.current);
    setAcertos(acertosRef.current);
    setChutesRestantes(chutesRestantesRef.current);

    console.log(`Acerto registrado! Pontos: ${pontosRef.current}, Acertos: ${acertosRef.current}, Chutes restantes: ${chutesRestantesRef.current}`);

    if (chutesRestantesRef.current === 0) {
      setTimeout(() => {
        finalizarRodada();
      }, 100);
    }
  };

  const finalizarRodadaManual = () => {
    if (rodadaAtiva && chutesRestantesRef.current > 0) {
      finalizarRodada();
    }
  };

  const adicionarAoRanking = async (dados) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ranking-next-fiap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: dados.userId,
          nome: dados.nome,
          pontos: dados.pontos,
          acertos: dados.acertos
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Pontos salvos no ranking:', data);
        return data;
      } else {
        const errorData = await res.json();
        console.error('Erro ao salvar no ranking:', errorData);
        throw new Error(errorData.detail || 'Erro ao salvar no ranking');
      }
    } catch (error) {
      console.error('Erro ao salvar no ranking:', error);
      throw error;
    }
  };

  const finalizarRodada = async () => {
    setRodadaAtiva(false);
    setMostrarResultado(true);
    setSalvando(true);
    setErro(null);
    
    try {
      const pontosFinais = pontosRef.current;
      const acertosFinais = acertosRef.current;
      
      console.log(`FINALIZANDO RODADA: ${nomeJogador} - ${pontosFinais} pontos, ${acertosFinais} acertos`);

      const resultado = {
        userId: user?.id,
        nome: nomeJogador,
        pontos: pontosFinais,
        acertos: acertosFinais
      };
      
      await adicionarAoRanking(resultado);
      console.log("Pontos salvos no Supabase com sucesso!");
      
    } catch (error) {
      console.error("Erro ao salvar no Supabase:", error);
      setErro("Erro ao salvar no ranking. Tente novamente.");
      
      if (isClient) {
        try {
          const rankingAtual = JSON.parse(localStorage.getItem('ranking-next-fiap') || '[]');
          rankingAtual.push({
            userId: user?.id,
            nome: nomeJogador,
            pontos: pontosRef.current,
            acertos: acertosRef.current,
            data: new Date().toISOString()
          });
          localStorage.setItem('ranking-next-fiap', JSON.stringify(rankingAtual));
          console.log("Pontos salvos no localStorage (fallback)");
        } catch (storageError) {
          console.error("Erro ao salvar no localStorage:", storageError);
        }
      }
    } finally {
      setSalvando(false);
      
      setTimeout(() => {
        router.push("/events/next-fiap/ranking");
      }, 3000);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === ' ' && rodadaAtiva && chutesRestantesRef.current > 0) {
        e.preventDefault();
        registrarAcerto();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [rodadaAtiva]);

  // Loading enquanto não está no cliente
  if (!isClient) {
    return (
      <div className="bg-[#f5f6f8] min-h-screen">
        <Header name="NEXT Passa a Bola" />
        <div className="pt-20 max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f6f8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando usuário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f6f8] min-h-screen">
      <Header name="NEXT Passa a Bola" />
      
      <main className="pt-20 max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-6 text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">NEXT Passa a Bola</h1>
          <p className="text-lg">Desafio do Mini Gol - 5 chutes para o ranking!</p>
          <p className="text-sm mt-2">Cada acerto = 10 pontos • Máximo: 50 pontos</p>
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{erro}</p>
          </div>
        )}

        {mostrarInputNome && (
          <div className="fixed inset-0 bg-[#00000075] bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
              <h3 className="text-2xl font-bold text-purple-800 mb-4 text-center">
                Qual é o seu nome?
              </h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Digite seu nome para o ranking:
                </label>
                <input
                  type="text"
                  value={nomeJogador}
                  onChange={(e) => setNomeJogador(e.target.value)}
                  placeholder="Ex: Maria Silva"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={50}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este nome aparecerá no ranking público
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelarRodada}
                  className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarNomeEIniciar}
                  disabled={!nomeJogador.trim()}
                  className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Começar Rodada
                </button>
              </div>
            </div>
          </div>
        )}

        {!rodadaAtiva && !mostrarResultado && !mostrarInputNome ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold mb-4">Pronto para o Desafio?</h2>
            <p className="text-gray-600 mb-2">Você tem <strong>5 chutes</strong> para fazer o máximo de pontos</p>
            <p className="text-gray-600 mb-6">Cada acerto = <strong>10 pontos</strong> • <strong>Máximo: 50 pontos</strong></p>
            
            <button
              onClick={iniciarRodada}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition transform hover:scale-105"
            >
              INICIAR MINHA RODADA
            </button>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">
                <strong>Como jogar:</strong> Pressione ESPAÇO para registrar cada acerto
              </p>
              <p className="text-xs text-blue-500 mt-1">
                <strong>Dica:</strong> 5 acertos = 50 pontos perfeitos!
              </p>
            </div>

            <div className="mt-6">
              <button
                onClick={() => router.push("/events/next-fiap/ranking")}
                className="text-purple-600 hover:text-purple-800 font-semibold text-lg"
              >
                Ver Ranking
              </button>
            </div>
          </div>
        ) : rodadaAtiva ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">SUA RODADA!</h2>
            <p className="text-gray-600 mb-6">Jogando como: <strong className="text-purple-600">{nomeJogador}</strong></p>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Chutes Restantes</p>
                <p className="text-2xl font-bold">{chutesRestantes}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Pontos</p>
                <p className="text-2xl font-bold">{pontos}</p>
                <p className="text-xs text-green-600 mt-1">
                  {pontos === 50 ? "PERFEITO!" : `${50 - pontos} pts para o máximo`}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600">Acertos</p>
                <p className="text-2xl font-bold">{acertos}/5</p>
              </div>
            </div>

            <div className="bg-gray-100 p-6 rounded-lg mb-4">
              <p className="text-lg font-semibold mb-2">Controle Manual dos Acertos</p>
              <p className="text-sm text-gray-600 mb-4">
                Pressione ESPAÇO para registrar cada acerto
              </p>
              <div className="animate-pulse text-purple-600 font-bold text-lg">
                AGUARDANDO SEUS CHUTES...
              </div>
              
              <div className="mt-4 bg-white p-3 rounded-lg border">
                <p className="text-sm font-semibold mb-2">Progresso:</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${(pontos / 50) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {pontos}/50 pontos • {acertos}/5 acertos
                </p>
              </div>
            </div>

            <div className="flex gap-4 justify-center mt-6">
              <button
                onClick={finalizarRodadaManual}
                disabled={chutesRestantes === 5 && acertos === 0}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 disabled:scale-100"
              >
                Finalizar Rodada
              </button>
            </div>

            <div className="text-center text-sm text-gray-500 mt-4">
              <p>Ou aguarde automaticamente após {chutesRestantes} chute(s) restante(s)</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {pontos === 50 ? "PERFEITO!" : "RODADA CONCLUÍDA!"}
            </h2>
            <p className="text-gray-600 mb-6">Jogador: <strong className="text-purple-600">{nomeJogador}</strong></p>
            
            <div className="grid grid-cols-2 gap-4 mb-6 max-w-md mx-auto">
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <p className="text-sm text-green-600">Pontuação Final</p>
                <p className="text-3xl font-bold text-green-700">{pontos} pts</p>
                {pontos === 50 && (
                  <p className="text-xs text-green-600 font-bold mt-1">PERFEITO!</p>
                )}
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <p className="text-sm text-blue-600">Acertos</p>
                <p className="text-3xl font-bold text-blue-700">{acertos}/5</p>
                {acertos === 5 && (
                  <p className="text-xs text-blue-600 font-bold mt-1">100% DE ACERTO!</p>
                )}
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg mb-6 border-2 border-purple-200">
              <p className="text-lg font-semibold text-purple-800">
                {salvando ? "Salvando no ranking..." : "Pontos salvos no ranking!"}
              </p>
              <p className="text-sm text-purple-600 mt-2">
                {salvando ? "Aguarde..." : "Redirecionando para o ranking em 3 segundos..."}
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push("/events/next-fiap/ranking")}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105"
              >
                Ver Ranking Agora
              </button>
              <button
                onClick={iniciarRodada}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105"
              >
                Nova Rodada
              </button>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="font-bold text-yellow-800 mb-2">Como Jogar (Modo Manual):</h3>
          <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
            <li>Clique em "Iniciar Minha Rodada"</li>
            <li>Digite seu nome para aparecer no ranking</li>
            <li>Use a tecla ESPAÇO para registrar cada acerto</li>
            <li>Você tem <strong>5 chutes</strong> no total</li>
            <li>Cada acerto = <strong>10 pontos</strong></li>
            <li><strong>Máximo: 50 pontos</strong> (5 acertos perfeitos)</li>
            <li>Finalize manualmente ou aguarde os 5 chutes</li>
            <li>Seus pontos serão salvos automaticamente no ranking!</li>
          </ol>
        </div>
      </main>
    </div>
  );
}