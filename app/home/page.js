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

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState(0); 
  const [noticias, setNoticias] = useState([]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState({ live: 'mock', upcoming: 'mock' });
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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        Carregando...
      </div>
    );
  }

  return (
    <div className="bg-[#F0F0F0] min-h-screen">
      <Header name={user.name || "Usuário"} />

      {/* Mobile */}
      <div className="md:hidden px-4">
        <TituloAlt titulo="Ao vivo" />

        {/* Indicador da fonte dos dados */}
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

        <TituloAlt titulo="Principais Notícias" />

        {/* Lista de notícias */}
        <div className="space-y-8 mb-20">
          {noticias.map(noticia => (
            <Link key={noticia.id} href={noticia.link}>
              <div className="cursor-pointer mb-5 flex flex-col bg-white p-6 rounded-lg shadow hover:shadow-md transition">
                <h2 className="font-bold text-xl mb-2">{noticia.titulo}</h2>
                <p className="text-gray-600 mb-4">{noticia.resumo}</p>
                <img
                  src={noticia.imagem}
                  alt={noticia.titulo}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            </Link>
          ))}
        </div>
        
        <div className="fixed bottom-0 left-0 right-0 md:hidden">
          <BottomNav activeIndex={active} onChange={setActive} userRole={user?.role}/>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex md:pt-24 bottom- md:gap-6 md:p-12 relative">
        {/* Coluna esquerda fixa */}
        <div className="fixed top-20 left-12 w-[25%] space-y-6">
          <TituloAlt titulo="Ao vivo" />
          
          {/* Indicador da fonte dos dados */}
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
                <div className="cursor-pointer">
                  <MatchCard {...formatMatchData(match)} />
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              Nenhum jogo ao vivo
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
            upcomingMatches.slice(0, 2).map(match => (
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
              Nenhum jogo agendado
            </div>
          )}
        </div>

        {/* Coluna de notícias */}
        <div className="ml-[30%] w-[65%] bg-white p-8 rounded-2xl shadow-lg space-y-6">
          <h1 className="text-3xl font-bold">Bem-vindo, {user.name}</h1>
          <p className="text-gray-600">
            Aqui você encontra tudo sobre o futebol feminino: partidas, resultados e notícias.
          </p>

          <TituloAlt titulo="Principais Notícias" />

          <div className="space-y-8">
            {noticias.map(noticia => (
              <Link key={noticia.id} href={noticia.link}>
                <div className="cursor-pointer mb-5 flex flex-col bg-gray-100 p-6 rounded-lg hover:shadow-md transition">
                  <h2 className="font-bold text-xl mb-2">{noticia.titulo}</h2>
                  <p className="text-gray-600 mb-4">{noticia.resumo}</p>
                  <img
                    src={noticia.imagem}
                    alt={noticia.titulo}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}