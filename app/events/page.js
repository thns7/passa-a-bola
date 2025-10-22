"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState(1);
  const [eventos, setEventos] = useState([]);5
  const [copas, setCopas] = useState([]);
  const [peneiras, setPeneiras] = useState([]);
  const [loading, setLoading] = useState(true);
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
    async function loadEventos() {
      try {
        setLoading(true);
        
        
        const response = await fetch('http://localhost:8000/api/events');
        const eventosData = await response.json();
        
        
        const torneios = eventosData.filter(e => e.tipo === 'torneio');
        const copasData = eventosData.filter(e => e.tipo === 'copa');
        const peneirasData = eventosData.filter(e => e.tipo === 'peneira');
        
        setEventos(torneios);
        setCopas(copasData);
        setPeneiras(peneirasData);
        
      } catch (err) {
        console.error("Erro ao carregar eventos:", err);
        // Fallback para dados mockados se a API falhar
        await loadMockData();
      } finally {
        setLoading(false);
      }
    }

    // Fallback com dados mockados
    async function loadMockData() {
      try {
        const res = await fetch("/data/db.json");
        const db = await res.json();
        setEventos(db.eventos || []);
        setCopas(db.copas || []);
        setPeneiras(db.peneiras || []);
      } catch (err) {
        console.error("Erro ao carregar dados mockados", err);
      }
    }

    loadEventos();
  }, []);

  // Função para formatar data do Supabase
  const formatarData = (dataISO) => {
    if (!dataISO) return '';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR');
  };

  // Função para formatar hora do Supabase
  const formatarHora = (horaISO) => {
    if (!horaISO) return '';
    return horaISO.substring(0, 5); // Extrai HH:MM
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f5f6f8] text-gray-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
          <p className="text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-[#f5f6f8] min-h-screen flex flex-col">
        <Header name={user.name || "Usuário"} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando eventos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f6f8] min-h-screen flex flex-col">
      {/* Header */}
      <Header name={user.name || "Usuário"} />

      <main className="md:mt-24 flex-1 w-full max-w-[24rem] md:max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-8 pb-28">
        
        {/* Eventos */}
        <section className="relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
              <span className="w-3 h-8 bg-[var(--primary-color)] rounded-full mr-3"></span>
              Outros Eventos
            </h2>
            <span className="text-gray-500 text-sm bg-white px-3 py-1 rounded-full border">
              🔥 {eventos.length} Eventos
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {eventos.filter(ev => ev.id !== "next-fiap").map((ev, index) => (
              <div
                key={ev.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-[var(--primary-color)] transition-all duration-300 hover:scale-105 hover:shadow-xl group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={ev.imagem_url || "/encontropab.png"}
                    alt={ev.titulo}
                    className="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[var(--primary-color)] text-white px-3 py-1 rounded-full text-xs font-bold">
                    {ev.categoria || "EVENTO"}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-5">
                  <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">{ev.titulo}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <span className="w-4 h-4 mr-2">📍</span>
                      <span className="line-clamp-1">{ev.local}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <span className="w-4 h-4 mr-2">📅</span>
                      {/* 🔄 MUDANÇA: Formata data do Supabase */}
                      <span>{formatarData(ev.data_evento)} • {formatarHora(ev.hora)}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <span className="w-4 h-4 mr-2">💰</span>
                      <span className="font-semibold text-green-600">{ev.valor}</span>
                    </div>
                    {/* 🔄 NOVO: Mostra vagas disponíveis */}
                    {ev.max_inscricoes && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <span className="w-4 h-4 mr-2">👥</span>
                        <span>
                          {ev.inscricoes_atuais || 0}/{ev.max_inscricoes} vagas
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleEventClick(ev)}
                    className="w-full bg-gradient-to-r from-[var(--primary-color)] to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group/btn"
                  >
                    <span>Inscreva-se</span>
                    <span className="ml-2 group-hover/btn:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Copa Única */}
        <section className="relative mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
              <span className="w-3 h-8 bg-yellow-500 rounded-full mr-3"></span>
              Copa Premium
            </h2>
            <span className="text-gray-500 text-sm bg-white px-3 py-1 rounded-full border">
              🏆 {copas.length > 0 ? 'Exclusiva' : 'Em Breve'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {copas.slice(0, 1).map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl overflow-hidden border-2 border-yellow-400 hover:border-yellow-500 transition-all duration-300 hover:scale-105 group relative shadow-lg"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-100 rounded-full -translate-y-12 translate-x-12"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-100 rounded-full translate-y-10 -translate-x-10"></div>
                
                <div className="relative z-10 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-3xl">🏆</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-2xl">{c.titulo}</h3>
                      <p className="text-yellow-600 text-sm font-semibold">COPA PREMIUM - PREMIAÇÃO EM DINHEIRO</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-700">
                      <span className="w-5 h-5 mr-2 text-gray-500">📍</span>
                      <span className="text-sm">{c.local}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="w-5 h-5 mr-2 text-gray-500">📅</span>
                      {/* 🔄 MUDANÇA: Formata data do Supabase */}
                      <span className="text-sm">{formatarData(c.data_evento)} • {formatarHora(c.hora)}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="w-5 h-5 mr-2 text-gray-500">💰</span>
                      <span className="text-sm font-bold text-green-600">{c.valor}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="w-5 h-5 mr-2 text-gray-500">⭐</span>
                      <span className="text-sm">Premiação: R$ 2.000 para o campeão</span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/events/${c.id}/inscricao`)}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 group/btn shadow-md text-lg"
                  >
                    <span>Participar da Copa</span>
                    <span className="ml-2 group-hover/btn:scale-110 transition-transform">⚔️</span>
                  </button>
                </div>
              </div>
            ))}
            
            {copas.length === 0 && (
              <div className="bg-white rounded-2xl border-2 border-dashed border-yellow-300 p-8 text-center">
                <div className="text-6xl mb-4 text-yellow-400">🏆</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Nova Copa em Breve</h3>
                <p className="text-gray-500">Estamos preparando uma copa especial para você!</p>
              </div>
            )}
          </div>
        </section>

        {/* Peneiras */}
        <section className="relative mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
              <span className="w-3 h-8 bg-[var(--primary-color)] rounded-full mr-3"></span>
              Peneiras Profissionais
            </h2>
            <span className="text-gray-500 text-sm bg-white px-3 py-1 rounded-full border">
              ⭐ {peneiras.length} Oportunidades
            </span>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[var(--primary-color)] to-purple-600">
                    <th className="p-4 md:p-6 text-left text-white font-bold text-sm md:text-base">
                      <div className="flex items-center">
                        <span className="mr-2">🏛️</span>
                        Clube
                      </div>
                    </th>
                    <th className="p-4 md:p-6 text-left text-white font-bold text-sm md:text-base">
                      <div className="flex items-center">
                        <span className="mr-2">📅</span>
                        Data
                      </div>
                    </th>
                    <th className="p-4 md:p-6 text-left text-white font-bold text-sm md:text-base">
                      <div className="flex items-center">
                        <span className="mr-2">👥</span>
                        Idade
                      </div>
                    </th>
                    <th className="p-4 md:p-6 text-left text-white font-bold text-sm md:text-base">
                      <div className="flex items-center">
                        <span className="mr-2">📍</span>
                        Local
                      </div>
                    </th>
                    <th className="p-4 md:p-6 text-left text-white font-bold text-sm md:text-base">
                      <div className="flex items-center">
                        <span className="mr-2">💰</span>
                        Valor
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {peneiras.map((p, index) => (
                    <tr 
                      key={p.id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
                      }`}
                    >
                      <td className="p-4 md:p-6 text-gray-800 font-semibold">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-[var(--primary-color)] to-purple-500 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                            <span className="text-xs text-white">⚽</span>
                          </div>
                          {p.clube}
                        </div>
                      </td>
                      <td className="p-4 md:p-6 text-gray-700">
                        {/* 🔄 MUDANÇA: Formata data do Supabase */}
                        {formatarData(p.data_evento)}
                      </td>
                      <td className="p-4 md:p-6">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                          {p.idade}
                        </span>
                      </td>
                      <td className="p-4 md:p-6 text-gray-700 max-w-[150px] truncate">{p.local}</td>
                      <td className="p-4 md:p-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          p.valor === 'Gratuito' 
                            ? 'bg-green-100 text-green-700 border-green-200' 
                            : 'bg-blue-100 text-blue-700 border-blue-200'
                        }`}>
                          {p.valor}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {peneiras.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 text-gray-300">🔍</div>
                <p className="text-gray-500 text-lg">Nenhuma peneira disponível no momento</p>
              </div>
            )}
          </div>
        </section>

        {/* Resto do código permanece igual */}
        <section className="text-center mt-12 mb-8">
          <div className="bg-gradient-to-r from-[var(--primary-color)] to-purple-600 rounded-2xl p-8 md:p-12 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
                Pronto para o Próximo Nível?
              </h2>
              <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
                Junte-se a milhares de atletas e descubra oportunidades únicas no mundo do futebol
              </p>
              <button className="bg-white text-[var(--primary-color)] px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 shadow-lg">
                Explorar Todos os Eventos
              </button>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 w-full z-50 md:hidden">
        <BottomNav activeIndex={active} onChange={setActive} />
      </div>
    </div>
  );
}