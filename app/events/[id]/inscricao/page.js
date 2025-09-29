"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function InscricaoPage() {
  const { id } = useParams();
  const router = useRouter();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [tipo, setTipo] = useState("solo");
  const [membros, setMembros] = useState([""]);
  const [form, setForm] = useState({ 
    nome: "", 
    email: "", 
    telefone: "", 
    idade: "", 
    altura: "" 
  });
  const [enviando, setEnviando] = useState(false);

  // Carregar dados do evento - VERSÃO SIMPLIFICADA
  useEffect(() => {
    async function carregarEvento() {
      try {
        const res = await fetch("/data/db.json");
        const db = await res.json();
        
        // Buscar em eventos
        let eventoEncontrado = null;
        
        if (db.eventos) {
          eventoEncontrado = db.eventos.find(ev => ev.id == id);
        }
        
        if (!eventoEncontrado && db.copas) {
          eventoEncontrado = db.copas.find(copa => copa.id == id);
        }
        
        if (!eventoEncontrado && db.peneiras) {
          eventoEncontrado = db.peneiras.find(peneira => peneira.id == id);
        }
        
        setEvento(eventoEncontrado || null);
        
      } catch (err) {
        console.error("Erro ao carregar evento:", err);
        setEvento(null);
      } finally {
        setLoading(false);
      }
    }
    
    carregarEvento();
  }, [id]);

  // Função para enviar email
  const enviarEmail = async (email, nome, eventoNome) => {
    try {
      const res = await fetch("/api/sendEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nome, evento: eventoNome }),
      });
      
      const data = await res.json();
      return data;
      
    } catch (error) {
      return { ok: false, message: "Erro de conexão" };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      if (!evento || !evento.titulo) {
        alert("Erro: Evento não carregado corretamente");
        return;
      }

      // Enviar email de confirmação
      const dataEmail = await enviarEmail(form.email, form.nome, evento.titulo);
      
      if (dataEmail.ok) {
        alert(`✅ Inscrição confirmada! Email enviado para ${form.email}`);
        router.push("/events");
      } else {
        alert(`✅ Inscrição recebida, mas email não enviado: ${dataEmail.message}`);
      }

    } catch (err) {
      alert("Ocorreu um erro na inscrição.");
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Carregando evento...</p>
        </div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="mb-4">
          <Link 
            href="/events" 
            className="flex items-center text-purple-600 hover:text-purple-800"
          >
            <span className="mr-2">←</span>
            Voltar para Eventos
          </Link>
        </div>
        <div className="bg-white p-6 rounded shadow max-w-md mx-auto text-center">
          <h1 className="text-xl font-bold text-red-600 mb-4">Evento não encontrado</h1>
          <p className="text-gray-600 mb-4">ID: {id}</p>
          <button 
            onClick={() => router.push("/events")}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
          >
            Voltar para Eventos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* BOTÃO VOLTAR */}
      <div className="mb-4">
        <Link 
          href="/events" 
          className="flex items-center text-purple-600 hover:text-purple-800"
        >
          <span className="mr-2">←</span>
          Voltar para Eventos
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-2 text-center">Inscrição</h1>
      
      {/* DETALHES DO EVENTO */}
      <div className="bg-white p-4 rounded shadow mb-6 max-w-md mx-auto">
        <h2 className="font-semibold text-lg text-purple-700">{evento.titulo}</h2>
        <p className="text-gray-600 mt-1">{evento.local}</p>
        <p className="text-gray-600">{evento.data} · {evento.hora}</p>
        {evento.valor && (
          <p className="text-green-600 font-semibold mt-2">Valor: {evento.valor}</p>
        )}
      </div>

      {/* FORMULÁRIO DE INSCRIÇÃO */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow max-w-md mx-auto">
        
        {/* Campo NOME */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
          <input 
            type="text" 
            placeholder="Seu nome completo" 
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" 
            value={form.nome} 
            onChange={e => setForm({ ...form, nome: e.target.value })} 
            required 
          />
        </div>
        
        {/* Campo EMAIL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            placeholder="seu@email.com" 
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" 
            value={form.email} 
            onChange={e => setForm({ ...form, email: e.target.value })} 
            required 
          />
        </div>
        
        {/* Campo TELEFONE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
          <input 
            type="tel" 
            placeholder="(11) 99999-9999" 
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" 
            value={form.telefone} 
            onChange={e => setForm({ ...form, telefone: e.target.value })} 
            required 
          />
        </div>

        {/* Tipo de Inscrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Inscrição</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input 
                type="radio" 
                value="solo" 
                checked={tipo === "solo"} 
                onChange={() => setTipo("solo")} 
                className="mr-2"
              /> 
              Jogador Solo
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                value="equipe" 
                checked={tipo === "equipe"} 
                onChange={() => setTipo("equipe")} 
                className="mr-2"
              /> 
              Equipe
            </label>
          </div>
        </div>

        {/* Campo IDADE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
          <input 
            type="number" 
            placeholder="Sua idade" 
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" 
            value={form.idade} 
            onChange={e => setForm({ ...form, idade: e.target.value })} 
            required 
          />
        </div>
        
        {/* Campo ALTURA */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Altura</label>
          <input 
            type="text" 
            placeholder="Ex: 1.70m" 
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" 
            value={form.altura} 
            onChange={e => setForm({ ...form, altura: e.target.value })} 
            required 
          />
        </div>

        {/* MEMBROS DA EQUIPE (se for equipe) */}
        {tipo === "equipe" && (
          <div className="space-y-3 p-4 bg-gray-50 rounded border">
            <h2 className="font-medium text-gray-700">Membros da equipe</h2>
            {membros.map((m, i) => (
              <input 
                key={i} 
                type="text" 
                placeholder={`Nome do membro ${i + 1}`} 
                className="w-full border border-gray-300 p-2 rounded" 
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
              className="bg-gray-200 px-3 py-2 rounded text-sm hover:bg-gray-300 transition"
              onClick={() => setMembros([...membros, ""])}
            >
              + Adicionar Membro
            </button>
          </div>
        )}

        {/* BOTÃO DE CONFIRMAR */}
        <button 
          type="submit" 
          disabled={enviando} 
          className="w-full bg-purple-600 text-white p-3 rounded font-semibold hover:bg-purple-700 transition disabled:bg-purple-400 disabled:cursor-not-allowed"
        >
          {enviando ? "Enviando Inscrição..." : "Confirmar Inscrição"}
        </button>
      </form>
    </div>
  );
}