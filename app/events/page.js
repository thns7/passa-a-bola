"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState(1);
  const [eventos, setEventos] = useState([]);
  const [copas, setCopas] = useState([]);
  const [peneiras, setPeneiras] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/data/db.json");
        const db = await res.json();
        setEventos(db.eventos || []);
        setCopas(db.copas || []);
        setPeneiras(db.peneiras || []);
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

      <main className="flex-1 w-full max-w-[24rem] md:max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-10 pb-28 divide-y divide-gray-300">
          {/* Eventos */}
          <section className="pb-6">
            <h2 className="text-xl font-bold mb-2">Eventos</h2>
            <div className="flex gap-4 overflow-x-auto md:overflow-visible md:flex-wrap pb-2">
              {eventos.map((ev) => (
                <div
                  key={ev.id}
                  className="min-w-[180px] md:min-w-[220px] bg-white shadow-md rounded-xl overflow-hidden flex-shrink-0"
                >
                  <img
                    src={ev.img}
                    alt={ev.titulo}
                    className="h-28 md:h-40 w-full object-cover rounded-t-xl"
                  />
                  <div className="p-2 md:p-4">
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
          <section className="pt-6 pb-6">
            <h2 className="text-xl font-bold mb-2">Copas</h2>
            <div className="flex gap-4 overflow-x-auto md:overflow-visible md:flex-wrap pb-2">
              {copas.map((c) => (
                <div
                  key={c.id}
                  className="min-w-[240px] md:min-w-[220px] bg-white shadow-md rounded-xl overflow-hidden flex-shrink-0"
                >
                  <img
                    src={c.img}
                    alt={c.titulo}
                    className="h-36 md:h-48 w-full object-cover rounded-t-xl"
                  />
                  <div className="p-2 md:p-4">
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

          
          <section className="pt-6">
            <h2 className="text-xl font-bold mb-2">Peneiras</h2>
            <div className="overflow-x-auto">
              <table className="w-full bg-white shadow-md rounded-md text-[11px] md:text-sm lg:text-base">
                <thead className="bg-[var(--primary-color)] text-white">
                  <tr>
                    <th className="p-2 md:p-4 text-left">Clube</th>
                    <th className="p-2 md:p-4 text-left">Data</th>
                    <th className="p-2 md:p-4 text-left">Idade</th>
                    <th className="p-2 md:p-4 text-left">Local</th>
                    <th className="p-2 md:p-4 text-left">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {peneiras.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="p-2 md:p-4">{p.clube}</td>
                      <td className="p-2 md:p-4">{p.data}</td>
                      <td className="p-2 md:p-4">{p.idade}</td>
                      <td className="p-2 md:p-4">{p.local}</td>
                      <td className="p-2 md:p-4">{p.valor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
      </main>

      
      <div className="fixed bottom-0 left-0 w-full z-50 md:hidden">
        <BottomNav activeIndex={active} onChange={setActive} />
      </div>
    </div>
  );
}
