"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  Star, 
  Crown,
  Target,
  TrendingUp,
  Clock,
  Building,
  Award,
  Zap,
  ArrowRight,
  Swords
} from "lucide-react";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState(1);
  const [eventos, setEventos] = useState([]);
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
        
        const API_BASE_URL = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:8000' 
          : 'https://passa-a-bola.onrender.com';
        
        const response = await fetch(`${API_BASE_URL}/api/events`);
        
        if (!response.ok) {
          throw new Error('Erro ao carregar eventos da API');
        }
        
        const eventosData = await response.json();
        
        // Filtra os eventos por tipo
        const torneios = eventosData.filter(e => e.tipo === 'torneio');
        const copasData = eventosData.filter(e => e.tipo === 'copa');
        const peneirasData = eventosData.filter(e => e.tipo === 'peneira');
        
        setEventos(torneios);
        setCopas(copasData);
        setPeneiras(peneirasData);
        
      } catch (err) {
        console.error("Erro ao carregar eventos da API:", err);
        // Fallback para dados do db.json se a API falhar
        await loadMockData();
      } finally {
        setLoading(false);
      }
    }

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

  // Função para lidar com clique nos eventos
  const handleEventClick = (evento) => {
    if (evento.id === "next-fiap") {
      // Evento NEXT FIAP vai direto para o desafio
      router.push("/events/next-fiap");
    } else {
      // Outros eventos vão para inscrição normal
      router.push(`/events/${evento.id}/inscricao`);
    }
  };

  // Função para formatar data do Supabase
  const formatarData = (dataISO) => {
    if (!dataISO) return '';
    try {
      const data = new Date(dataISO);
      return data.toLocaleDateString('pt-BR');
    } catch {
      return dataISO; // Retorna original se não for ISO
    }
  };

  const formatarHora = (horaISO) => {
    if (!horaISO) return '';
    
    if (horaISO.includes(':')) {
      return horaISO.substring(0, 5);
    }
    return horaISO; 
  };

  const getEventoData = (evento) => {
    return {
      id: evento.id,
      titulo: evento.titulo,
      local: evento.local,
      data: evento.data_evento ? formatarData(evento.data_evento) : evento.data,
      hora: evento.hora ? formatarHora(evento.hora) : evento.hora,
      valor: evento.valor,
      categoria: evento.categoria,
      imagem: evento.imagem_url || evento.img
    };
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

  const eventoNextFiap = eventos.find(ev => ev.id === "next-fiap") || 
                        { 
                          id: "next-fiap", 
                          titulo: "NEXT Passa a Bola - Desafio do Mini Gol", 
                          local: "FIAP - São Paulo/SP", 
                          data: "08/11/2025", 
                          hora: "12:00 - 15:00", 
                          valor: "R$ Gratuito", 
                          categoria: "DESAFIO ESPECIAL",
                          img: "/next-fiap-banner.jpg"
                        };

  const outrosEventos = eventos.filter(ev => ev.id !== "next-fiap");

  return (
    <div className="bg-[#f5f6f8] min-h-screen flex flex-col">
      {/* Header */}
      <Header name={user.name || "Usuário"} />

      <main className="md:mt-24 flex-1 w-full max-w-[24rem] md:max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-8 pb-28">
        
        {/* EVENTO NEXT FIAP EM DESTAQUE ESPECIAL */}
        <section className="relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
              <span className="w-3 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mr-3"></span>
              Evento em Destaque
            </h2>
            <span className="text-gray-500 text-sm bg-white px-3 py-1 rounded-full border flex items-center gap-1">
              <Zap size={14} />
              ESPECIAL
            </span>
          </div>
          
          {/* Card Destaque NEXT FIAP */}
          <div
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl overflow-hidden border-2 border-white shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] group relative"
          >
            {/* Efeitos de fundo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10 p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Imagem */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                    <Trophy size={40} className="text-white" />
                  </div>
                </div>
                
                {/* Conteúdo */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                    <span className="bg-yellow-400 text-purple-800 px-4 py-1 rounded-full text-sm font-bold animate-pulse flex items-center gap-1">
                      <Target size={14} />
                      DESAFIO EXCLUSIVO
                    </span>
                    <span className="bg-white/30 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                      <TrendingUp size={12} />
                      NEXT FIAP 2025
                    </span>
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-3 group-hover:scale-105 transition-transform">
                    {eventoNextFiap.titulo}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center justify-center md:justify-start text-white/90">
                      <MapPin size={18} className="mr-2" />
                      <span>{eventoNextFiap.local}</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start text-white/90">
                      <Calendar size={18} className="mr-2" />
                      <span>{eventoNextFiap.data} • {eventoNextFiap.hora}</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start text-white/90">
                      <DollarSign size={18} className="mr-2" />
                      <span className="font-bold text-yellow-300">{eventoNextFiap.valor}</span>
                    </div>
                  </div>

                  {/* Botões Especiais para NEXT FIAP */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <button
                      onClick={() => handleEventClick(eventoNextFiap)}
                      className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 shadow-lg flex items-center justify-center group/btn"
                    >
                      <span>Começar Desafio</span>
                      <ArrowRight size={20} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    
                    <button
                      onClick={() => router.push("/events/next-fiap/ranking")}
                      className="bg-white/20 text-white border-2 border-white/30 px-6 py-4 rounded-xl font-bold text-lg hover:bg-white/30 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group/btn2"
                    >
                      <Trophy size={20} className="mr-2" />
                      <span>Ver Ranking</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Demais Eventos */}
        <section className="relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
              <span className="w-3 h-8 bg-[var(--primary-color)] rounded-full mr-3"></span>
              Outros Eventos
            </h2>
            <span className="text-gray-500 text-sm bg-white px-3 py-1 rounded-full border flex items-center gap-1">
              <Calendar size={14} />
              {outrosEventos.length} Eventos
            </span>
          </div>
          
          {outrosEventos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {outrosEventos.map((ev, index) => {
                const evento = getEventoData(ev);
                return (
                  <div
                    key={ev.id}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-[var(--primary-color)] transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={evento.imagem || "/encontropab.png"}
                        alt={evento.titulo}
                        className="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-[var(--primary-color)] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star size={12} />
                        {evento.categoria || "EVENTO"}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    <div className="p-5">
                      <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">{evento.titulo}</h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin size={16} className="mr-2" />
                          <span className="line-clamp-1">{evento.local}</span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Calendar size={16} className="mr-2" />
                          <span>{evento.data} • {evento.hora}</span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <DollarSign size={16} className="mr-2" />
                          <span className="font-semibold text-green-600">{evento.valor}</span>
                        </div>
                        {/* Mostra vagas disponíveis se vier da API */}
                        {ev.max_inscricoes && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <Users size={16} className="mr-2" />
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
                        <ArrowRight size={18} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center">
              <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum evento disponível</h3>
              <p className="text-gray-500">Novos eventos em breve!</p>
            </div>
          )}
        </section>

        {/* Copa Única */}
        <section className="relative mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
              <span className="w-3 h-8 bg-yellow-500 rounded-full mr-3"></span>
              Copa Premium
            </h2>
            <span className="text-gray-500 text-sm bg-white px-3 py-1 rounded-full border flex items-center gap-1">
              <Crown size={14} />
              {copas.length > 0 ? 'Exclusiva' : 'Em Breve'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {copas.slice(0, 1).map((c) => {
              const copa = getEventoData(c);
              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl overflow-hidden border-2 border-yellow-400 hover:border-yellow-500 transition-all duration-300 hover:scale-105 group relative shadow-lg"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-100 rounded-full -translate-y-12 translate-x-12"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-100 rounded-full translate-y-10 -translate-x-10"></div>
                  
                  <div className="relative z-10 p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                        <Trophy size={32} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-2xl">{copa.titulo}</h3>
                        <p className="text-yellow-600 text-sm font-semibold">COPA PREMIUM - PREMIAÇÃO EM DINHEIRO</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-700">
                        <MapPin size={16} className="mr-2 text-gray-500" />
                        <span className="text-sm">{copa.local}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Calendar size={16} className="mr-2 text-gray-500" />
                        <span className="text-sm">{copa.data} • {copa.hora}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <DollarSign size={16} className="mr-2 text-gray-500" />
                        <span className="text-sm font-bold text-green-600">{copa.valor}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Award size={16} className="mr-2 text-gray-500" />
                        <span className="text-sm">Premiação: R$ 2.000 para o campeão</span>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/events/${c.id}/inscricao`)}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 group/btn shadow-md text-lg flex items-center justify-center"
                    >
                      <span>Participar da Copa</span>
                      <Swords size={20} className="ml-2 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {copas.length === 0 && (
              <div className="bg-white rounded-2xl border-2 border-dashed border-yellow-300 p-8 text-center">
                <Trophy size={48} className="mx-auto mb-4 text-yellow-400" />
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
            <span className="text-gray-500 text-sm bg-white px-3 py-1 rounded-full border flex items-center gap-1">
              <Star size={14} />
              {peneiras.length} Oportunidades
            </span>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {peneiras.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-[var(--primary-color)] to-purple-600">
                      <th className="p-4 md:p-6 text-left text-white font-bold text-sm md:text-base">
                        <div className="flex items-center">
                          <Building size={16} className="mr-2" />
                          Clube
                        </div>
                      </th>
                      <th className="p-4 md:p-6 text-left text-white font-bold text-sm md:text-base">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2" />
                          Data
                        </div>
                      </th>
                      <th className="p-4 md:p-6 text-left text-white font-bold text-sm md:text-base">
                        <div className="flex items-center">
                          <Users size={16} className="mr-2" />
                          Idade
                        </div>
                      </th>
                      <th className="p-4 md:p-6 text-left text-white font-bold text-sm md:text-base">
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-2" />
                          Local
                        </div>
                      </th>
                      <th className="p-4 md:p-6 text-left text-white font-bold text-sm md:text-base">
                        <div className="flex items-center">
                          <DollarSign size={16} className="mr-2" />
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
                              <Trophy size={14} className="text-white" />
                            </div>
                            {p.clube}
                          </div>
                        </td>
                        <td className="p-4 md:p-6 text-gray-700">
                          {formatarData(p.data_evento) || p.data}
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
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Nenhuma peneira disponível no momento</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
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
              <button 
                onClick={() => router.push("/events")}
                className="bg-white text-[var(--primary-color)] px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 shadow-lg flex items-center justify-center mx-auto"
              >
                Explorar Todos os Eventos
                <ArrowRight size={20} className="ml-2" />
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