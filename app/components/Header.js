"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, Home, Trophy, Users, User, X } from "lucide-react";

export default function Header({ name }) {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const items = [
    { icon: <Home size={24} />, label: "Home", href: "/home" },
    { icon: <Trophy size={24} />, label: "Torneios", href: "/events" },
    { icon: <Users size={24} />, label: "Comunidade", href: "/comunidade" },
    { icon: <User size={24} />, label: "Perfil", href: "/perfil" },
  ];

  // Fecha o menu ao clicar fora do menu lateral
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
    <header className="relative">
      {/* Mobile: imagem de fundo */}
      <div className="md:hidden h-50 relative">
        <img
          src="/svgs/header.svg"
          alt="Header background"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        <div className="absolute top-20 left-6 right-6 flex justify-between items-center text-white">
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
      <div className="hidden md:flex items-center justify-between bg-[var(--primary-color)] text-white p-6 relative">

        <input
          type="text"
          placeholder="Pesquisar partidas, notícias..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/2 px-5 py-2 rounded-lg bg-white text-black focus:outline-none"
        />

        {/* Menu hamburguer */}
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* Overlay menu full height */}
          {menuOpen && (
            <div className="fixed inset-0 flex bg-[var(--black-opacity)]">
              
                onClick={() => setMenuOpen(false)}
              

              {/* Menu lateral */}
              <div
                id="desktop-menu"
                className="relative ml-auto w-64 bg-white h-full shadow-lg flex flex-col p-6 space-y-4"
              >
                {items.map((item, index) => (
                  <button
                    key={index}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-100 rounded-lg text-black"
                    onClick={() => {
                      router.push(item.href);
                      setMenuOpen(false);
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
