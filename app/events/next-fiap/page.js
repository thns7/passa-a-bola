"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


const adicionarAoRanking = async (dados, supabaseClient) => {
  if (!supabaseClient) {
    throw new Error('Cliente Supabase não inicializado');
  }

  try {
    const { data, error } = await supabaseClient
      .from('ranking_next_fiap')
      .insert([
        {
          user_id: dados.userId,
          nome: dados.nome,
          pontos: dados.pontos,
          acertos: dados.acertos,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Erro ao salvar no ranking:', error);
      throw error;
    }

    console.log('Pontos salvos no ranking:', data);
    return data;
  } catch (error) {
    console.error('Erro ao salvar no ranking:', error);
    throw error;
  }
};

export default function NextFiapEvent() {
  const [user, setUser] = useState(null);
  const [rodadaAtiva, setRodadaAtiva] = useState(false);
  const [chutesRestantes, setChutesRestantes] = useState(3);
  const [pontos, setPontos] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [supabase, setSupabase] = useState(null);
  const router = useRouter();

  // ✅ Inicializar Supabase apenas no cliente
  useEffect(() => {
    if (supabaseUrl && supabaseAnonKey) {
      import('@supabase/supabase-js').then(({ createClient }) => {
        const client = createClient(supabaseUrl, supabaseAnonKey);
        setSupabase(client);
      });
    } else {
      console.error('Variáveis do Supabase não configuradas');
    }
  }, []);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }
  }, []);

  const iniciarRodada = () => {
    setRodadaAtiva(true);
    setChutesRestantes(3);
    setPontos(0);
    setAcertos(0);
    setMostrarResultado(false);
  };

  // Função que será chamada pelo ESP32 quando detectar um acerto
  const registrarAcerto = () => {
    if (!rodadaAtiva || chutesRestantes <= 0) return;

    setPontos(prev => prev + 10);
    setAcertos(prev => prev + 1);
    
    const novosChutes = chutesRestantes - 1;
    setChutesRestantes(novosChutes);

    // Se acabaram os chutes, finaliza a rodada
    if (novosChutes === 0) {
      finalizarRodada();
    }
  };

  const finalizarRodada = async () => {
    setRodadaAtiva(false);
    setMostrarResultado(true);
    setSalvando(true);
    
    try {
      // Salvar os pontos no Supabase
      const resultado = {
        userId: user?.id,
        nome: user?.name,
        pontos: pontos,
        acertos: acertos
      };
      
      if (supabase) {
        await adicionarAoRanking(resultado, supabase);
        console.log("Pontos salvos no Supabase com sucesso!");
      } else {
        throw new Error('Supabase não disponível');
      }
      
    } catch (error) {
      console.error("Erro ao salvar no Supabase:", error);
      // Fallback para localStorage se o Supabase falhar
      const rankingAtual = JSON.parse(localStorage.getItem('ranking-next-fiap') || '[]');
      rankingAtual.push({
        userId: user?.id,
        nome: user?.name,
        pontos: pontos,
        acertos: acertos,
        data: new Date().toISOString()
      });
      localStorage.setItem('ranking-next-fiap', JSON.stringify(rankingAtual));
      console.log("Pontos salvos no localStorage (fallback)");
    } finally {
      setSalvando(false);
      
      // Redireciona automaticamente para o ranking após 3 segundos
      setTimeout(() => {
        router.push("/events/next-fiap/ranking");
      }, 3000);
    }
  };

  // ✅ Simulação de acerto para teste (remova depois)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === ' ' && rodadaAtiva && chutesRestantes > 0) {
        e.preventDefault();
        registrarAcerto();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [rodadaAtiva, chutesRestantes]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f6f8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f6f8] min-h-screen">
      <Header name="NEXT Passa a Bola" />
      
      <main className="pt-20 max-w-4xl mx-auto px-4 py-8">
        {/* Banner do Evento */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-6 text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">⚽ NEXT Passa a Bola</h1>
          <p className="text-lg">Desafio do Mini Gol - 3 chutes para o ranking!</p>
          {!supabaseUrl || !supabaseAnonKey ? (
            <p className="text-yellow-300 text-sm mt-2">
              ⚠️ Configuração do banco de dados pendente
            </p>
          ) : !supabase ? (
            <p className="text-yellow-300 text-sm mt-2">
              🔄 Conectando ao banco de dados...
            </p>
          ) : null}
        </div>

        {!rodadaAtiva && !mostrarResultado ? (
          // Tela de Início
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold mb-4">Pronto para o Desafio?</h2>
            <p className="text-gray-600 mb-2">Você tem <strong>3 chutes</strong> para fazer o máximo de pontos</p>
            <p className="text-gray-600 mb-6">Cada acerto = <strong>10 pontos</strong></p>
            
            <button
              onClick={iniciarRodada}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition transform hover:scale-105"
            >
              🚀 INICIAR MINHA RODADA
            </button>

            {/* ✅ Instrução de teste */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">
                <strong>Para testar:</strong> Pressione <kbd className="px-2 py-1 bg-gray-200 rounded">ESPAÇO</kbd> para simular acertos
              </p>
            </div>

            <div className="mt-6">
              <button
                onClick={() => router.push("/events/next-fiap/ranking")}
                className="text-purple-600 hover:text-purple-800 font-semibold text-lg"
              >
                📊 Ver Ranking
              </button>
            </div>
          </div>
        ) : rodadaAtiva ? (
          // Tela Durante a Rodada
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">SUA RODADA!</h2>
            <p className="text-gray-600 mb-6">Jogando como: <strong>{user.name}</strong></p>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Chutes Restantes</p>
                <p className="text-2xl font-bold">{chutesRestantes}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Pontos</p>
                <p className="text-2xl font-bold">{pontos}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600">Acertos</p>
                <p className="text-2xl font-bold">{acertos}/3</p>
              </div>
            </div>

            <div className="bg-gray-100 p-6 rounded-lg mb-4">
              <p className="text-lg font-semibold mb-2">🎯 Mire nos 4 alvos do mini gol!</p>
              <p className="text-sm text-gray-600 mb-4">Cada acerto = 10 pontos</p>
              <div className="animate-pulse text-purple-600 font-bold text-lg">
                ⚽ PRONTO PARA RECEBER OS CHUTES...
              </div>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Pressione <kbd className="px-2 py-1 bg-gray-200 rounded">ESPAÇO</kbd> para simular acertos (teste)</p>
            </div>
          </div>
        ) : (
          // Tela de Resultado
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold mb-4">RODADA CONCLUÍDA!</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6 max-w-md mx-auto">
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <p className="text-sm text-green-600">Pontuação Final</p>
                <p className="text-3xl font-bold text-green-700">{pontos} pts</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <p className="text-sm text-blue-600">Acertos</p>
                <p className="text-3xl font-bold text-blue-700">{acertos}/3</p>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg mb-6 border-2 border-purple-200">
              <p className="text-lg font-semibold text-purple-800">
                {salvando ? "💾 Salvando no ranking..." : "✅ Pontos salvos no ranking!"}
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
                📊 Ver Ranking Agora
              </button>
              <button
                onClick={iniciarRodada}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105"
              >
                🔄 Nova Rodada
              </button>
            </div>
          </div>
        )}

        {/* Instruções */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="font-bold text-yellow-800 mb-2">📋 Como Jogar:</h3>
          <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
            <li>Clique em "Iniciar Minha Rodada"</li>
            <li>Posicione-se no mini gol</li>
            <li>Faça seus 3 chutes nos alvos</li>
            <li>Os sensores detectarão automaticamente seus acertos</li>
            <li>Ao final, seus pontos irão direto para o ranking!</li>
          </ol>
        </div>
      </main>
    </div>
  );
}


export { adicionarAoRanking };