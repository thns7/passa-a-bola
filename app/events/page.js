"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState(0);
  const [eventos, setEventos] = useState([]);
  const [copas, setCopas] = useState([]);
  const [peneiras, setPeneiras] = useState([]);
  const router = useRouter();

  // Carrega usuário do localStorage
  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    } else {
      router.push("/login");
    }
  }, [router]);

  // Carrega dados da API fake
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/data/db.json");
        const db = await res.json();
        setEventos(db.eventos);
        setCopas(db.copas);
        setPeneiras(db.peneiras);
      } catch (err) {
        console.error("Erro ao carregar dados", err);
      }
    }
    load();
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-700">
        Carregando...
      </div>
    );
  }

  return (
    <div className="bg-[#F0F0F0] min-h-screen flex flex-col">
      {/* Header */}
      <Header name={user.name || "Usuário"} />

      {/* Conteúdo principal */}
      <main className="flex-1 max-w-[24rem] mx-auto px-4 py-4 space-y-6 pb-24">
        {/* Eventos */}
        <section>
          <h2 className="text-xl font-bold mb-2">Eventos</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {eventos.map((ev) => (
              <div
                key={ev.id}
                className="min-w-[180px] bg-white shadow-md rounded-xl overflow-hidden flex-shrink-0"
              >
                <img
                  src={ev.img}
                  alt={ev.titulo}
                  className="h-28 w-full object-cover rounded-t-xl"
                />
                <div className="p-2">
                  <h3 className="font-semibold text-gray-800">{ev.titulo}</h3>
                  <p className="text-sm text-gray-600">{ev.local}</p>
                  <p className="text-xs text-gray-500">
                    {ev.data} • {ev.hora}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Copas */}
        <section>
          <h2 className="text-xl font-bold mb-2">Copas</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {copas.map((c) => (
              <div
                key={c.id}
                className="min-w-[240px] bg-white shadow-md rounded-xl overflow-hidden flex-shrink-0"
              >
                <img
                  src={c.img}
                  alt={c.titulo}
                  className="h-36 w-full object-cover rounded-t-xl"
                />
                <div className="p-2">
                  <h3 className="font-semibold text-gray-800">{c.titulo}</h3>
                  <p className="text-sm text-gray-600">
                    {c.local} • {c.hora}
                  </p>
                  <p className="text-xs text-gray-500">{c.data}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Peneiras */}
        <section className="w-">
          <h2 className="text-xl font-bold mb-2">Peneiras</h2>
          <table className="w-full bg-white shadow-md rounded-xl overflow-hidden text-sm">
            <thead className="bg-purple-700 text-white">
              <tr>
                <th className="p-2 text-left">Clube</th>
                <th className="p-2 text-left">Data</th>
                <th className="p-2 text-left">Idade</th>
                <th className="p-2 text-left">Local</th>
                <th className="p-2 text-left">Valor</th>
              </tr>
            </thead>
            <tbody>
              {peneiras.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">{p.clube}</td>
                  <td className="p-2">{p.data}</td>
                  <td className="p-2">{p.idade}</td>
                  <td className="p-2">{p.local}</td>
                  <td className="p-2">{p.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        
      </main>

      {/* BottomNav fixo */}
      <div className="fixed bottom-0 left-0 w-full z-50">
        <BottomNav activeIndex={active} onChange={setActive} />
      </div>
    </div>
  );
}
