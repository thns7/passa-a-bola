"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, Home, Trophy, Users, User, X, Shield, Search } from "lucide-react";
import SearchPage from "./SearchPage";

export default function Header({ name }) {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState("");
  const [showSearchPage, setShowSearchPage] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchInputRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname(); 

  const items = [
    { icon: <Home size={24} />, label: "", href: "/home" },
    { icon: <Trophy size={24} />, label: "", href: "/events" },
    { icon: <Users size={24} />, label: "", href: "/comunidade" },
    { icon: <User size={24} />, label: "", href: "/perfil" },
    { icon: <Shield size={24} />, label: "", href: "/admin/dashboard" },
  ];

  useEffect(() => {
    setActivePage(pathname);
  }, [pathname]);

  // Focar no input quando abrir a searchbar mobile
  useEffect(() => {
    if (showMobileSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showMobileSearch]);

  const handleClickOutside = (event) => {
    if (menuOpen && !event.target.closest("#desktop-menu")) {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setShowSearchPage(true);
    }
  };

  const handleMobileSearchClick = () => {
    setShowMobileSearch(true);
  };

  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setShowSearchPage(true);
      setShowMobileSearch(false);
    }
  };

  const handleCloseSearchPage = () => {
    setShowSearchPage(false);
    // Não limpa o search para permitir nova pesquisa
  };

  const handleCloseMobileSearch = () => {
    setShowMobileSearch(false);
    setSearch("");
  };

  const handleSearchInSearchPage = (newSearchTerm) => {
    setSearch(newSearchTerm);
    // Fecha a página atual e abre uma nova com o novo termo
    setShowSearchPage(false);
    setTimeout(() => {
      setShowSearchPage(true);
    }, 100);
  };

  return (
    <>
      <header className="relative z-40">
        {/* Mobile: Header normal */}
        {!showMobileSearch && (
          <div className="md:hidden h-50 relative animate-duration-500 animate-fade-down">
            <img
              src="/svgs/header.svg"
              alt="Header background"
              className="absolute top-0 left-0 w-full h-full object-cover"
            />
            <div className="absolute top-20 left-4 right-4 flex justify-between items-center animate-duration-700 animate-fade-down text-white">
              <h1 className="text-[1.5rem] max-w-[60%] truncate">Olá, {name}</h1>
              <button 
                onClick={handleMobileSearchClick}
                className="p-2 bg-white/20 rounded-full backdrop-blur-sm"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile: Search Bar Overlay */}
        {showMobileSearch && (
          <div className="md:hidden fixed inset-0 bg-white z-50">
            <div className="p-4 border-b border-gray-200">
              <form onSubmit={handleMobileSearchSubmit} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseMobileSearch}
                  className="p-2 text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex-1 flex items-center bg-gray-100 rounded-lg px-3 py-2">
                  <Search className="h-4 w-4 text-gray-500 mr-2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Pesquisar partidas, notícias, eventos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent text-gray-800 focus:outline-none text-base"
                    autoFocus
                  />
                </div>
                {search.trim() && (
                  <button
                    type="submit"
                    className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Buscar
                  </button>
                )}
              </form>
            </div>
            
            {/* Sugestões de pesquisa rápidas */}
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-3">Sugestões:</p>
              <div className="flex flex-wrap gap-2">
                {["Flamengo", "Corinthians", "Campeonato Brasileiro", "Seleção Feminina"].map((sugestao) => (
                  <button
                    key={sugestao}
                    onClick={() => {
                      setSearch(sugestao);
                      setTimeout(() => {
                        handleMobileSearchSubmit(new Event('submit'));
                      }, 100);
                    }}
                    className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    {sugestao}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Desktop */}
        <div className="hidden md:flex fixed top-0 left-0 right-0 animate-duration-500 animate-fade-down justify-between items-center bg-white shadow text-white p-2.5 z-50">
          {/* Barra de pesquisa na esquerda */}
          <form onSubmit={handleSearchSubmit} className="w-80">
            <div className="px-2 py-3 rounded-[10vh] bg-[#F0F0F0] flex items-center">
              <button type="submit">
                <img
                  src="/search_logo_black.png"
                  alt="Lupa de Pesquisa"
                  className="opacity-40 h-3.5 ml-2"
                />
              </button>
              <input
                type="text"
                placeholder="Pesquisar partidas, notícias..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-black focus:outline-none animate-duration-700 animate-fade-down ml-2 truncate overflow-ellipsis whitespace-nowrap"
              />
            </div>
          </form>

          {/* Menu absolutamente centralizado */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-15">
              {items.map((item, index) => {
                const isActive = activePage === item.href;
                
                if (item.href === "/admin/dashboard") {
                  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
                  if (user.role !== "admin") {
                    return null; 
                  }
                }
                
                return (
                  <button
                    key={index}
                    className={`flex flex-col items-center gap-1 px-7 py-2 rounded-lg transition-all duration-200 relative ${
                      isActive 
                        ? 'text-[var(--primary-color)] cursor-default' 
                        : 'text-black hover:bg-gray-100 cursor-pointer'
                    }`}
                    onClick={() => !isActive && router.push(item.href)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    
                    {/* Linha roxa embaixo da página ativa */}
                    {isActive && (
                      <div className="absolute -bottom-3 left-0 right-0 h-1 bg-[var(--primary-color)] rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Espaço vazio na direita para balancear */}
          <div className="w-1/6"></div>
        </div>
      </header>

      {/* Página de Pesquisa */}
      {showSearchPage && (
        <SearchPage 
          searchTerm={search} 
          onClose={handleCloseSearchPage}
          onNewSearch={handleSearchInSearchPage}
        />
      )}
    </>
  );
}