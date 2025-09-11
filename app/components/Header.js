"use client";


export default function Header({ name }) {
  return (
    <div className="relative h-50">
      <img
        src="/svgs/header.svg"
        alt="Header background"
        className="absolute top-0 left-0 w-full h-full object-cover"
      />

      
      <div className="absolute top-20 left-6 right-6 flex justify-between items-center text-white">
        <h1 className="text-[2rem]">Olá, {name}</h1>
        <button>
          <img src="/search_logo.png" alt="Lupa de Pesquisa" className="h-7" />
        </button>
      </div>
    </div>
  );
}