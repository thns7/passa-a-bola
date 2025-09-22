"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function InscricaoPage() {
  const { id } = useParams(); // pega o id do evento
  const router = useRouter();
  
  const [tipo, setTipo] = useState("solo"); // solo ou equipe
  const [membros, setMembros] = useState([""]);
  const [form, setForm] = useState({ email: "", telefone: "", idade: "", altura: "" });
  const [loading, setLoading] = useState(false);

  // ✅ Função para chamar a API que envia email
  const enviarEmail = async (email, nome, evento) => {
    const res = await fetch("/api/sendEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, nome, evento }),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error("Não foi possível processar a resposta da API");
    }
    return data;
  };

  // ✅ Função handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const dados = {
      eventoId: id,
      tipo,
      email: form.email,
      telefone: form.telefone,
      idade: form.idade,
      altura: form.altura,
      membros: tipo === "equipe" ? membros.filter(m => m.trim() !== "") : [],
    };

    try {
      // 1️⃣ Enviar email de confirmação
      const data = await enviarEmail(form.email, "Jogador(a)", `Evento ${id}`);

      if (data.ok) {
        alert("Inscrição enviada com sucesso! Confirmação enviada por email.");
      } else {
        alert(`Inscrição enviada, mas houve erro no email: ${data.message}`);
      }

      console.log("Inscrição enviada:", dados);

      // 2️⃣ Redireciona para página de eventos
      router.push("/events");
    } catch (error) {
      console.error(error);
      alert("Ocorreu um erro ao enviar a inscrição.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-xl font-bold mb-4">Inscrição no Evento {id}</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow max-w-md mx-auto">
        {/* Email e Telefone */}
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          type="tel"
          placeholder="Telefone"
          className="w-full border p-2 rounded"
          value={form.telefone}
          onChange={e => setForm({ ...form, telefone: e.target.value })}
          required
        />

        {/* Tipo Solo ou Equipe */}
        <div>
          <label className="mr-4">
            <input
              type="radio"
              value="solo"
              checked={tipo === "solo"}
              onChange={() => setTipo("solo")}
            />{" "}
            Jogador Solo
          </label>
          <label>
            <input
              type="radio"
              value="equipe"
              checked={tipo === "equipe"}
              onChange={() => setTipo("equipe")}
            />{" "}
            Equipe
          </label>
        </div>

        {/* Campos Idade e Altura */}
        <input
          type="number"
          placeholder="Idade"
          className="w-full border p-2 rounded"
          value={form.idade}
          onChange={e => setForm({ ...form, idade: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Altura (ex: 1.70m)"
          className="w-full border p-2 rounded"
          value={form.altura}
          onChange={e => setForm({ ...form, altura: e.target.value })}
          required
        />

        {/* Membros da equipe */}
        {tipo === "equipe" && (
          <div className="space-y-2">
            <h2 className="font-medium">Membros da equipe</h2>
            {membros.map((m, i) => (
              <input
                key={i}
                type="text"
                placeholder={`Membro ${i + 1}`}
                className="w-full border p-2 rounded"
                value={m}
                onChange={e => {
                  const novo = [...membros];
                  novo[i] = e.target.value;
                  setMembros(novo);
                }}
              />
            ))}
            <button
              type="button"
              className="bg-gray-200 px-3 py-1 rounded"
              onClick={() => setMembros([...membros, ""])}
            >
              + Adicionar Membro
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700 transition"
        >
          {loading ? "Enviando..." : "Enviar Inscrição"}
        </button>
      </form>
    </div>
  );
}
