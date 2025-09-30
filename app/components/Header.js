"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, Home, Trophy, Users, User, X, Settings } from "lucide-react";

export default function Header({ name }) {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState("");
  const router = useRouter();
  const pathname = usePathname(); 

  const items = [
    { icon: <Home size={24} />, label: "", href: "/home" },
    { icon: <Trophy size={24} />, label: "", href: "/events" },
    { icon: <Users size={24} />, label: "", href: "/comunidade" },
    { icon: <User size={24} />, label: "", href: "/perfil" },
    { icon: <Settings size={24} />, label: "", href: "/admin/dashboard" },
  ];

  
  useEffect(() => {
    setActivePage(pathname);
  }, [pathname]);

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

  return (
    <header className="relative z-10 ">
      {/* Mobile: imagem de fundo */}
      <div className="md:hidden h-50 relative animate-duration-500 animate-fade-down">
        <img
          src="/svgs/header.svg"
          alt="Header background"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        <div className="absolute top-20 left-6 right-6 flex justify-between items-center animate-duration-700 animate-fade-down text-white">
          <h1 className="text-[2rem]">Olá, {name}</h1>
          <button>
            <img
              src="/search_logo.png"
              alt="Lupa de Pesquisa"
              className="h-7"
            />
          </button>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex fixed top-0 left-0 right-0 animate-duration-500 animate-fade-down justify-between items-center bg-white shadow text-white p-2.5 z-50">

        {/* Barra de pesquisa na esquerda */}
        <div className="w-80 px-2 py-3 rounded-[10vh] bg-[#F0F0F0] flex items-center">
          <img
            src="/search_logo_black.png"
            alt="Lupa de Pesquisa"
            className="opacity-40 h-3.5 ml-2"
          />
          <input
            type="text"
            placeholder="Pesquisar partidas, notícias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-black focus:outline-none animate-duration-700 animate-fade-down ml-2 truncate overflow-ellipsis whitespace-nowrap"
          />
        </div>

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
  );
}