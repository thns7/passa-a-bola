"use client";

import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";

export default function HomePage() {
    const [active, setActive] = useState(2);
    const [activeSection, setActiveSection] = useState("feed");

  return (
    <div className="bg-[#F0F0F0] min-h-screen flex flex-col">
    {/* Header */}
    <header className="flex justify-between mt-[5vh] ml-[6vw] mr-[4vh]">
        <h1 className="flex  text-[6vw] ">Comunidade</h1>
        <img src="/svgs/tabler_plus.svg" alt="+" className="h-6 mt-2" />
    </header>

    {/* Pesquisa */}
    <section className="flex bg-[#E5E5E5] rounded-[3vh] h-9.5 mt-4 mr-8 ml-9 items-center">
        <input
            type="text"
            placeholder="Pesquise por usuários, ou clubes"
            className="flex ml-3 w-[150%] pl-7 border-0 bg-no-repeat bg-left bg-[url('/svgs/Pesquisa.svg')] focus:outline-none focus:none"
            />
    </section>

    {/* Telas Feed/Amigos */}
    <section className=" mt-3 p-4 w-[100% ] ">
      {/* Botões de navegação */}
      <div className="flex mb-4">
        <button
          onClick={() => setActiveSection("feed")}
          className={`m-auto w-40 h-10 ${
            activeSection === "feed" ? "border-b text-[#5E2E8C]" : ""
          }`}
        >
          Feed
        </button>

        <button
          onClick={() => setActiveSection("amigos")}
          className={`m-auto w-40 h-10 ${
            activeSection === "amigos" ? "border-b text-[#5E2E8C]" : ""
          }`}
        >
          Amigos
        </button>
      </div>
      <div className=" rounded p-5 bg-gray-50">
        {activeSection === "feed" && (
          <div>
            <h2 className="text-xl font-bold mb-2">Feed</h2>
            <p>Conteúdo do feed vai aqui...</p>
          </div>
        )}

        {activeSection === "amigos" && (
          <div>
            <h2 className="text-xl font-bold mb-2">Amigos</h2>
            <p>Lista de amigos aparece aqui...</p>
          </div>
        )}
      </div>

    </section>
        {/* Footer */}
      <div className="fixed bottom-0 left-0 w-full z-50">
        <BottomNav activeIndex={active} onChange={setActive} />
      </div>
    </div>
  );
}