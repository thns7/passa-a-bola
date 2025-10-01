"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Calendar, Trophy, MapPin, Clock, Users, Search } from "lucide-react";

const API_BASE_URL = "https://passa-a-bola.onrender.com";

// Ícone News alternativo já que não existe no lucide-react
const NewsIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9m0 0H5m4 0V4a1 1 0 011-1h4a1 1 0 011 1v1z" />
  </svg>
);

export default function SearchPage({ searchTerm, onClose }) {
  const [results, setResults] = useState({
    jogos: [],
    eventos: [],
    noticias: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("todos");
  const router = useRouter();

  useEffect(() => {
    if (searchTerm.trim()) {
      performSearch(searchTerm);
    } else {
      setResults({ jogos: [], eventos: [], noticias: [] });
    }
  }, [searchTerm]);

  const performSearch = async (term) => {
    setLoading(true);
    try {
      // Buscar dados de todas as fontes
      const [jogosData, eventosData, noticiasData] = await Promise.all([
        fetchJogos(term),
        fetchEventos(term),
        fetchNoticias(term)
      ]);

      setResults({
        jogos: jogosData,
        eventos: eventosData,
        noticias: noticiasData
      });
    } catch (error) {
      console.error("Erro na pesquisa:", error);
    } finally {
      setLoading(false);
    }
  };

  // ... (mantenha as funções fetchJogos, fetchEventos, fetchNoticias iguais)

  const fetchJogos = async (term) => {
    try {
      const API_BASE_URL = window.location.hostname !== 'localhost' 
        ? 'https://passa-a-bola.onrender.com' 
        : 'http://localhost:8000';

      const [liveResponse, upcomingResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/matches/live`),
        fetch(`${API_BASE_URL}/api/matches/upcoming`)
      ]);

      const [liveData, upcomingData] = await Promise.all([
        liveResponse.json(),
        upcomingResponse.json()
      ]);

      const allMatches = [
        ...(liveData.data || []),
        ...(upcomingData.data || [])
      ];

      // Filtrar matches pelo termo de pesquisa
      const filteredMatches = allMatches.filter(match => {
        const searchLower = term.toLowerCase();
        return (
          match.teams?.home?.name?.toLowerCase().includes(searchLower) ||
          match.teams?.away?.name?.toLowerCase().includes(searchLower) ||
          match.league?.name?.toLowerCase().includes(searchLower)
        );
      });

      return filteredMatches.slice(0, 10);
    } catch (error) {
      console.error("Erro ao buscar jogos:", error);
      return [
        {
          fixture: { id: 1, date: new Date().toISOString() },
          teams: {
            home: { name: "Flamengo", logo: "/team-logos/flamengo.png" },
            away: { name: "Corinthians", logo: "/team-logos/corinthians.png" }
          },
          league: { name: "Campeonato Brasileiro" },
          goals: { home: 2, away: 1 }
        }
      ].filter(match => 
        match.teams.home.name.toLowerCase().includes(term.toLowerCase()) ||
        match.teams.away.name.toLowerCase().includes(term.toLowerCase())
      );
    }
  };

  const fetchEventos = async (term) => {
    try {
      const res = await fetch(`${API_BASE_URL}/events`);
      if (res.ok) {
        const eventosData = await res.json();
        return eventosData
          .filter(evento => 
            evento.titulo?.toLowerCase().includes(term.toLowerCase()) ||
            evento.local?.toLowerCase().includes(term.toLowerCase())
          )
          .slice(0, 10);
      }
    } catch (error) {
      console.error("Erro ao buscar eventos da API:", error);
    }

    const eventosExemplo = [
      {
        id: 1,
        titulo: "Campeonato Estadual Feminino",
        local: "Estádio Municipal",
        data: "15/12/2024",
        hora: "14:00",
        img: "/eventos/estadual.jpg",
        tipo: "evento"
      },
      {
        id: 2,
        titulo: "Copa dos Clubes",
        local: "Arena Esportiva",
        data: "20/12/2024",
        hora: "16:00",
        img: "/eventos/copa.jpg",
        tipo: "copa"
      }
    ];

    return eventosExemplo.filter(evento => 
      evento.titulo.toLowerCase().includes(term.toLowerCase()) ||
      evento.local.toLowerCase().includes(term.toLowerCase())
    );
  };

  const fetchNoticias = async (term) => {
    try {
      const API_BASE_URL = window.location.hostname !== 'localhost' 
        ? 'https://passa-a-bola.onrender.com' 
        : 'http://localhost:8000';

      const response = await fetch(`${API_BASE_URL}/api/noticias`);
      if (response.ok) {
        const data = await response.json();
        const noticias = data.noticias || [];
        
        return noticias
          .filter(noticia => 
            noticia.titulo?.toLowerCase().includes(term.toLowerCase()) ||
            noticia.resumo?.toLowerCase().includes(term.toLowerCase())
          )
          .slice(0, 10);
      }
    } catch (error) {
      console.error("Erro ao buscar notícias:", error);
    }

    const noticiasExemplo = [
      {
        id: 1,
        titulo: "Seleção Brasileira Feminina se prepara para amistoso",
        resumo: "A equipe técnica anuncia a lista de convocadas para o próximo amistoso internacional",
        imagem: "/noticias/selecao.jpg",
        link: "/noticia/1",
        data: "2024-12-01"
      }
    ];

    return noticiasExemplo.filter(noticia => 
      noticia.titulo.toLowerCase().includes(term.toLowerCase()) ||
      noticia.resumo.toLowerCase().includes(term.toLowerCase())
    );
  };

  const handleGameClick = (match) => {
    router.push(`/match/${match.fixture.id}`);
    onClose();
  };

  const handleEventClick = (evento) => {
    if (evento.tipo === "peneira") {
      router.push(`/events/${evento.id}/inscricao`);
    } else {
      router.push(`/events/${evento.id}`);
    }
    onClose();
  };

  const handleNewsClick = (noticia) => {
    router.push(noticia.link);
    onClose();
  };

  const totalResults = results.jogos.length + results.eventos.length + results.noticias.length;

  const tabs = [
    { key: "todos", label: "Todos", count: totalResults, icon: <Users className="h-4 w-4" /> },
    { key: "jogos", label: "Jogos", count: results.jogos.length, icon: <Trophy className="h-4 w-4" /> },
    { key: "eventos", label: "Eventos", count: results.eventos.length, icon: <Calendar className="h-4 w-4" /> },
    { key: "noticias", label: "Notícias", count: results.noticias.length, icon: <NewsIcon /> }
  ];

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header da página de pesquisa */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-4xl mx-auto p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={onClose}
              className="flex items-center gap-1 md:gap-2 text-gray-600 hover:text-[var(--primary-color)] transition-colors p-1"
            >
              <X className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">Voltar</span>
            </button>
            
            <div className="flex-1 flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-gray-500 mr-2" />
              <input
                type="text"
                value={searchTerm}
                readOnly
                className="w-full bg-transparent text-gray-800 focus:outline-none text-sm md:text-lg"
                placeholder="Pesquisar..."
              />
            </div>
          </div>

          {/* Tabs - Scroll horizontal para mobile */}
          <div className="flex gap-2 md:gap-4 mt-4 md:mt-4 overflow-x-auto pb-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex mx-auto gap-1 md:gap-2 px-7 py-1.5 md:px-8 md:py-3 rounded-full whitespace-nowrap transition-colors flex-shrink-0 text-xs md:text-sm ${
                  activeTab === tab.key
                    ? "bg-[var(--primary-color)] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo dos resultados */}
      <div className="max-w-4xl mx-auto p-3 md:p-4">
        {loading ? (
          <div className="flex justify-center py-8 md:py-12">
            <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-[var(--primary-color)]"></div>
          </div>
        ) : totalResults === 0 ? (
          <div className="text-center py-8 md:py-12">
            <NewsIcon />
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 mt-2">
              Nenhum resultado encontrado
            </h3>
            <p className="text-sm md:text-base text-gray-600">
              Tente usar outros termos de pesquisa
            </p>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            {/* Seção de Jogos */}
            {(activeTab === "todos" || activeTab === "jogos") && results.jogos.length > 0 && (
              <section>
                <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2">
                  <Trophy className="h-4 w-4 md:h-5 md:w-5 text-[var(--primary-color)]" />
                  Jogos ({results.jogos.length})
                </h2>
                <div className="grid gap-2 md:gap-3">
                  {results.jogos.map(match => (
                    <div
                      key={match.fixture.id}
                      className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleGameClick(match)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="flex items-center justify-between md:justify-start md:gap-3">
                          <div className="flex items-center gap-1 md:gap-2 flex-1">
                            <img
                              src={match.teams.home.logo}
                              alt={match.teams.home.name}
                              className="h-6 w-6 md:h-8 md:w-8 object-cover"
                              onError={(e) => {
                                e.target.src = "/team-logos/default.png";
                              }}
                            />
                            <span className="font-semibold text-sm md:text-base truncate max-w-[80px] md:max-w-none">
                              {match.teams.home.name}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 mx-1 md:mx-2">
                            <span className="text-sm md:text-lg font-bold">
                              {match.goals.home ?? 0} - {match.goals.away ?? 0}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 md:gap-2 flex-1 justify-end">
                            <span className="font-semibold text-sm md:text-base truncate max-w-[80px] md:max-w-none">
                              {match.teams.away.name}
                            </span>
                            <img
                              src={match.teams.away.logo}
                              alt={match.teams.away.name}
                              className="h-6 w-6 md:h-8 md:w-8 object-cover"
                              onError={(e) => {
                                e.target.src = "/team-logos/default.png";
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="text-center md:text-right">
                          <p className="text-xs md:text-sm text-gray-600">{match.league.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(match.fixture.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Seção de Eventos */}
            {(activeTab === "todos" || activeTab === "eventos") && results.eventos.length > 0 && (
              <section>
                <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5 text-[var(--primary-color)]" />
                  Eventos ({results.eventos.length})
                </h2>
                <div className="grid gap-3 md:gap-4 md:grid-cols-2">
                  {results.eventos.map(evento => (
                    <div
                      key={evento.id}
                      className="bg-white border border-gray-200 rounded-lg md:rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleEventClick(evento)}
                    >
                      <img
                        src={evento.img || "/eventos/default.jpg"}
                        alt={evento.titulo}
                        className="h-24 md:h-32 w-full object-cover"
                        onError={(e) => {
                          e.target.src = "/eventos/default.jpg";
                        }}
                      />
                      <div className="p-3 md:p-4">
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-2 line-clamp-2">{evento.titulo}</h3>
                        <div className="space-y-1 text-xs md:text-sm text-gray-600">
                          <div className="flex items-center gap-1 md:gap-2">
                            <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="truncate">{evento.local}</span>
                          </div>
                          <div className="flex items-center gap-1 md:gap-2">
                            <Clock className="h-3 w-3 md:h-4 md:w-4" />
                            <span>{evento.data} • {evento.hora}</span>
                          </div>
                          {evento.clube && (
                            <p className="text-xs text-gray-500">Clube: {evento.clube}</p>
                          )}
                        </div>
                        {evento.tipo === "peneira" && (
                          <button className="mt-2 w-full bg-[var(--primary-color)] text-white py-1.5 md:py-2 rounded-lg text-xs md:text-sm hover:opacity-90 transition-opacity">
                            Inscrever-se
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Seção de Notícias */}
            {(activeTab === "todos" || activeTab === "noticias") && results.noticias.length > 0 && (
              <section>
                <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2">
                  <NewsIcon />
                  Notícias ({results.noticias.length})
                </h2>
                <div className="grid gap-3 md:gap-4">
                  {results.noticias.map(noticia => (
                    <div
                      key={noticia.id}
                      className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleNewsClick(noticia)}
                    >
                      <div className="flex gap-3 md:gap-4">
                        <img
                          src={noticia.imagem || "/noticias/default.jpg"}
                          alt={noticia.titulo}
                          className="h-16 w-16 md:h-20 md:w-20 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            e.target.src = "/noticias/default.jpg";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1 md:mb-2 line-clamp-2">{noticia.titulo}</h3>
                          <p className="text-xs md:text-sm text-gray-600 line-clamp-2 md:line-clamp-3">{noticia.resumo}</p>
                          <p className="text-xs text-gray-500 mt-1 md:mt-2">
                            {new Date(noticia.data).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}