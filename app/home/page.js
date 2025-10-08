"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import MatchCard from "../components/MatchCard";
import NextMatchCard from "../components/NextMatch";
import TextLink from "../components/TextLink";
import TituloAlt from "../components/TituloAlt";
import { Play, Youtube, Calendar, Eye, Clock, ExternalLink } from "lucide-react";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState(0); 
  const [noticias, setNoticias] = useState([]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState({ live: 'mock', upcoming: 'mock' });
  const [visibleNews, setVisibleNews] = useState(3);
  const router = useRouter();

  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      const isProduction = window.location.hostname !== 'localhost';
      return isProduction 
        ? 'https://passa-a-bola.onrender.com' 
        : 'http://localhost:8000';
    }
    return process.env.NEXT_PUBLIC_API_URL || 'https://passa-a-bola.onrender.com';
  };

  // Busca usuário
  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) setUser(JSON.parse(currentUser));
    else router.push("/login");
  }, [router]);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const API_BASE_URL = getApiBaseUrl(); 
        
        const [liveResponse, upcomingResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/matches/live`),
          fetch(`${API_BASE_URL}/api/matches/upcoming`)
        ]);
        
        const [liveData, upcomingData] = await Promise.all([
          liveResponse.json(),
          upcomingResponse.json()
        ]);
        
        if (liveData.success) {
          setLiveMatches(liveData.data || []);
          setDataSource(prev => ({...prev, live: liveData.source || 'mock'}));
        }
        
        if (upcomingData.success) {
          setUpcomingMatches(upcomingData.data || []);
          setDataSource(prev => ({...prev, upcoming: upcomingData.source || 'mock'}));
        }
        
      } catch (error) {
        console.error('Erro ao buscar partidas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [user]);

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const API_BASE_URL = getApiBaseUrl();
        console.log("Buscando notícias de:", `${API_BASE_URL}/api/noticias`);
        
        const response = await fetch(`${API_BASE_URL}/api/noticias`);
        const data = await response.json();
        
        console.log("Notícias recebidas:", data);
        setNoticias(data.noticias || []);
      } catch (err) {
        console.error("Erro ao buscar notícias:", err);
      }
    };

    fetchNoticias();
  }, []);

  const formatMatchData = (match) => {
    const fixture = match.fixture;
    const teams = match.teams;
    const league = match.league;
    const goals = match.goals;

    return {
      id: fixture.id,
      campeonato: league.name,
      timeCasa: teams.home.name,
      timeVisitante: teams.away.name,
      logoCasa: teams.home.logo,
      logoVisitante: teams.away.logo,
      placarCasa: goals.home ?? 0,
      placarVisitante: goals.away ?? 0,
      tempo: fixture.status.elapsed ? `${fixture.status.elapsed}′` : "0′",
      data: new Date(fixture.date).toLocaleDateString('pt-BR'),
      hora: new Date(fixture.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const loadMoreNews = () => {
    setVisibleNews(prev => prev + 3);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        Carregando...
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <Header name={user.name || "Usuário"} />

      {/* Mobile */}
      <div className="md:hidden px-4">
        <TituloAlt titulo="Ao vivo" />

        {!loading && liveMatches.length > 0 && (
          <div className={`text-xs px-2 py-1 rounded mb-2 ${
            dataSource.live === 'api' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {dataSource.live === 'api' ? 'Dados em tempo real' : 'Dados de exemplo'}
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">Carregando jogos...</div>
        ) : liveMatches.length > 0 ? (
          liveMatches.map(match => (
            <Link key={match.fixture.id} href={`/match/${match.fixture.id}`}>
              <div className="cursor-pointer mb-4">
                <MatchCard {...formatMatchData(match)} />
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            Nenhum jogo ao vivo no momento
          </div>
        )}

        <div className="flex justify-between mt-6">
          <TituloAlt titulo="Próximas Partidas" />
          <TextLink>
            <p className="my-3">Ver todos</p>
          </TextLink>
        </div>

        {loading ? (
          <div className="text-center py-4">Carregando...</div>
        ) : upcomingMatches.length > 0 ? (
          upcomingMatches.slice(0, 3).map(match => (
            <NextMatchCard
              key={match.fixture.id}
              timeCasa={match.teams.home.name}
              timeVisitante={match.teams.away.name}
              logoCasa={match.teams.home.logo}
              logoVisitante={match.teams.away.logo}
              hora={new Date(match.fixture.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              data={new Date(match.fixture.date).toLocaleDateString('pt-BR')}
            />
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            Nenhum jogo agendado para os próximos dias
          </div>
        )}

        {/* Canal YouTube - Agora embaixo das Próximas Partidas */}
        <div className="my-6">
          <div className="bg-gradient-to-br from-[#5E2E8C] to-[#7E3EB4] rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Youtube size={24} className="text-red-500" />
              <h3 className="text-lg font-bold">Canal YouTube</h3>
            </div>
            <p className="text-white/90 text-sm mb-4">
              Confira os melhores momentos, entrevistas e análises do futebol feminino
            </p>
            <a 
              href="https://www.youtube.com/@passabola" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[#5E2E8C] px-4 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors w-full justify-center"
            >
              <Play size={18} />
              Acessar Canal
            </a>
          </div>
        </div>

        <TituloAlt titulo="Principais Notícias" />

        <div className="space-y-6 mb-20">
          {noticias.slice(0, visibleNews).map(noticia => (
            <Link key={noticia.id} href={noticia.link}>
              <div className="cursor-pointer flex flex-col bg-white p-6 rounded-lg shadow hover:shadow-md transition">
                <h2 className="font-bold text-xl mb-2">{noticia.titulo}</h2>
                <p className="text-gray-600 mb-4">{noticia.resumo}</p>
                <img
                  src={noticia.imagem}
                  alt={noticia.titulo}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{new Date().toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye size={14} />
                    <span>Ler mais</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
          {noticias.length > visibleNews && (
            <div className="text-center pt-4">
              <button
                onClick={loadMoreNews}
                className="bg-[#5E2E8C] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#4A2370] transition-colors"
              >
                Carregar mais notícias
              </button>
            </div>
          )}
        </div>
        
        <div className="fixed bottom-0 left-0 right-0 md:hidden">
          <BottomNav activeIndex={active} onChange={setActive} userRole={user?.role}/>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block pt-20">
        <div className="max-w-8xl mx-auto px-12 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Olá, {user.name}!
            </h1>
            <p className="text-gray-600 text-lg">
              Tudo sobre futebol feminino em um só lugar
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Coluna Esquerda - Partidas e YouTube */}
            <div className="space-y-6">
              {/* Ao Vivo */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Ao Vivo</h2>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <Clock size={16} className="text-gray-500" />
                  </div>
                </div>
                
                {!loading && liveMatches.length > 0 && (
                  <div className={`text-xs px-2 py-1 rounded mb-3 ${
                    dataSource.live === 'api' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {dataSource.live === 'api' ? 'Dados em tempo real' : 'Dados de exemplo'}
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-4 text-gray-500">Carregando jogos...</div>
                ) : liveMatches.length > 0 ? (
                  <div className="space-y-4">
                    {liveMatches.map(match => (
                      <Link key={match.fixture.id} href={`/match/${match.fixture.id}`}>
                        <div className="cursor-pointer hover:scale-105 transition-transform duration-200">
                          <MatchCard {...formatMatchData(match)} />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                    Nenhum jogo ao vivo
                  </div>
                )}
              </div>

              {/* Próximas Partidas */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Próximas Partidas</h2>
                  <Calendar size={20} className="text-[#5E2E8C]" />
                </div>

                {loading ? (
                  <div className="text-center py-4 text-gray-500">Carregando...</div>
                ) : upcomingMatches.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingMatches.slice(0, 3).map(match => (
                      <NextMatchCard
                        key={match.fixture.id}
                        timeCasa={match.teams.home.name}
                        timeVisitante={match.teams.away.name}
                        logoCasa={match.teams.home.logo}
                        logoVisitante={match.teams.away.logo}
                        hora={new Date(match.fixture.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        data={new Date(match.fixture.date).toLocaleDateString('pt-BR')}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                    Nenhum jogo agendado
                  </div>
                )}
              </div>

              {/* Canal YouTube */}
              <div className="bg-gradient-to-br from-[#5E2E8C] to-[#7E3EB4] rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Youtube size={24} className="text-red-500" />
                  <h3 className="text-lg font-bold">Canal YouTube</h3>
                </div>
                <p className="text-white/90 text-sm mb-4">
                  Confira os melhores momentos, entrevistas e análises do futebol feminino
                </p>
                <a 
                  href="https://www.youtube.com/@passabola" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-[#5E2E8C] px-4 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors w-full justify-center"
                >
                  <Play size={18} />
                  Acessar Canal
                </a>
              </div>
            </div>

            {/* Coluna Central - Notícias */}
            <div className="col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Principais Notícias</h2>
                  <div className="text-sm text-gray-500">
                    {noticias.length} notícias disponíveis
                  </div>
                </div>

                <div className="space-y-6">
                  {noticias.slice(0, visibleNews).map(noticia => (
                    <Link key={noticia.id} href={noticia.link}>
                      <div className="cursor-pointer group">
                        <div className="flex gap-6 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200">
                          <div className="flex-1">
                            <h3 className="font-bold text-xl text-gray-900 group-hover:text-[#5E2E8C] transition-colors mb-3">
                              {noticia.titulo}
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-4">
                              {noticia.resumo}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>{new Date().toLocaleDateString('pt-BR')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye size={14} />
                                <span>Ler mais</span>
                              </div>
                            </div>
                          </div>
                          <div className="w-48 h-32 flex-shrink-0">
                            <img
                              src={noticia.imagem}
                              alt={noticia.titulo}
                              className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Botão "Carregar mais" */}
                {noticias.length > visibleNews && (
                  <div className="text-center pt-8">
                    <button
                      onClick={loadMoreNews}
                      className="bg-[#5E2E8C] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#4A2370] transition-colors inline-flex items-center gap-2"
                    >
                      <ExternalLink size={18} />
                      Carregar mais notícias ({noticias.length - visibleNews} restantes)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}