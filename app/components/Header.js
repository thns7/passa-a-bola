"use client";

export default function Header({ name }) {
  return (
    <div className="relative h-50 md:h-35">
      
      <img
        src="/svgs/header.svg"
        alt="Header background"
        className="absolute top-0 left-0 w-full h-full object-cover md:hidden"
      />

      
      <div className="hidden md:block absolute top-0 left-0 w-full h-full bg-[var(--primary-color)]"></div>

      
      <div className="absolute top-12 md:top-16 left-6 right-6 flex justify-between items-center text-white md:px-12">
        <h1 className="text-[2rem]">Olá, {name}</h1>
        <button className="p-2 rounded-full hover:bg-opacity-30 transition">
          <img src="/search_logo.png" alt="Lupa de Pesquisa" className="h-7" />
        </button>
      </div>
    </div>
  );
}
