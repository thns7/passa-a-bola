"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function InscricaoPage() {
  const { id } = useParams();
  const router = useRouter();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const [form, setForm] = useState({ 
    nome: "", 
    email: "", 
    telefone: "", 
    idade: "", 
    altura: "",
    posicao: ""
  });
  const [enviando, setEnviando] = useState(false);


  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8000' 
    : "https://passa-a-bola.onrender.com"



  
  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      setUser(userData);
      setForm(prev => ({
        ...prev,
        nome: userData.name || "",
        email: userData.email || ""
      }));
    }
  }, []);

  
  useEffect(() => {
    async function carregarEvento() {
      try {
        console.log("🔍 Buscando evento com ID:", id);
        
        
        const response = await fetch(`${API_BASE_URL}/api/events/${id}`);
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}`);
        }
        
        const eventoData = await response.json();
        
        if (eventoData) {
          console.log("✅ Evento encontrado:", eventoData.titulo);
          setEvento(eventoData);
        } else {
          console.log("❌ Evento não encontrado na API");
          
          setEvento({
            id: id,
            titulo: `Evento ${id}`,
            local: "Local a definir",
            data_evento: "Em breve",
            hora: "A definir", 
            valor: "Gratuito",
            descricao: "Descrição do evento"
          });
        }
        
      } catch (err) {
        console.error("❌ Erro ao carregar evento:", err);
        
        setEvento({
          id: id,
          titulo: `Evento ${id}`,
          local: "Local a definir",
          data_evento: "Em breve",
          hora: "A definir",
          valor: "Gratuito",
          descricao: "Descrição do evento"
        });
      } finally {
        setLoading(false);
      }
    }
    
    carregarEvento();
  }, [id]);

  
  const salvarInscricaoNoSupabase = async (dadosInscricao) => {
    try {
      console.log('💾 Salvando inscrição no Supabase...', dadosInscricao);
      
      const registrationData = {
        user_id: user?.id || "guest",
        user_name: dadosInscricao.nome,
        user_email: dadosInscricao.email,
        user_phone: dadosInscricao.telefone,
        user_position: dadosInscricao.posicao,
        user_age: parseInt(dadosInscricao.idade) || 0
      };

      
      const response = await fetch(`${API_BASE_URL}/api/events/${id}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(registrationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erro HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('Inscrição salva no Supabase:', result);
      
      return { 
        success: true, 
        id: result.id,
        message: 'Inscrição Salva com sucesso' 
      };
      
    } catch (error) {
      console.error('Erro ao salvar inscrição no Supabase:', error);
      return { 
        success: false, 
        message: error.message || 'Erro ao salvar inscrição no banco de dados' 
      };
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

    console.log('Iniciando processo de inscrição...');

    // Validar campos obrigatórios
    if (!form.nome.trim() || !form.email.trim() || !form.telefone.trim() || !form.idade.trim() || !form.altura.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      alert("Por favor, insira um email válido");
      return;
    }

    
    const resultadoSalvar = await salvarInscricaoNoSupabase(form);

    if (!resultadoSalvar.success) {
      if (resultadoSalvar.message.includes("já inscrito") || resultadoSalvar.message.includes("duplicada")) {
        alert("Você já está inscrito neste evento!");
      } else if (resultadoSalvar.message.includes("lotado")) {
        alert("Este evento está lotado. Não há mais vagas disponíveis.");
      } else {
        alert(`${resultadoSalvar.message}`);
      }
      return;
    }

    console.log('✅ Inscrição salva no Supabase');

    
    try {
      const emailResponse = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          nome: form.nome,
          evento: evento.titulo,
          telefone: form.telefone,
          idade: form.idade,
          altura: form.altura,
          posicao: form.posicao,
          tipo: 'solo',
          membros: []
        }),
      });

      const emailResult = await emailResponse.json();

      if (emailResult.success) {
        alert(`🎉 INSCRIÇÃO CONFIRMADA!\n\n✅ Email de confirmação enviado para:\n${form.email}\n\n📧 Verifique sua caixa de entrada e spam`);
      } else {
        console.warn('⚠️ Email não enviado:', emailResult.message);
        alert(`✅ INSCRIÇÃO CONFIRMADA!\n\nSua inscrição foi registrada com sucesso!\n\n⚠️ O email não pôde ser enviado: ${emailResult.message}`);
      }
    } catch (emailError) {
      console.warn('⚠️ Erro ao enviar email:', emailError);
      alert(`✅ INSCRIÇÃO CONFIRMADA!\n\nSua inscrição foi registrada no sistema!\n\n📋 Anote seus dados:\nNome: ${form.nome}\nEvento: ${evento.titulo}\nData: ${formatarData(evento.data_evento)}\nLocal: ${evento.local}`);
    }

    router.push("/events");

  } catch (err) {
    console.error('Erro crítico no processo:', err);
    alert("Ocorreu um erro inesperado na inscrição. Tente novamente em alguns instantes.");
  } finally {
    setEnviando(false);
  }
};

 
  const formatarData = (dataISO) => {
    if (!dataISO) return 'Data a definir';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando evento...</p>
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
            className="flex items-center text-[var(--primary-color)] hover:text-purple-800 font-medium"
          >
            <span className="mr-2">←</span>
            Voltar para Eventos
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto text-center">
          <h1 className="text-xl font-bold text-red-600 mb-4">Evento não encontrado</h1>
          <p className="text-gray-600 mb-4">O evento com ID <strong>{id}</strong> não foi encontrado.</p>
          <button 
            onClick={() => router.push("/events")}
            className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition duration-200"
          >
            Voltar para Eventos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      {/* BOTÃO VOLTAR */}
      <div className="mb-6">
        <Link 
          href="/events" 
          className="inline-flex items-center text-[var(--primary-color)] hover:text-purple-800 font-medium transition duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para Eventos
        </Link>
      </div>

      {/* TÍTULO */}
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Inscrição no Evento</h1>
      <p className="text-gray-600 text-center mb-8">Preencha seus dados para confirmar a inscrição</p>
      
      {/* DETALHES DO EVENTO */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl mx-auto border-l-4 border-purple-500">
        <h2 className="font-bold text-xl text-[var(--primary-color)] mb-3">{evento.titulo}</h2>
        <p className="text-gray-600 mb-4">{evento.descricao}</p>
        
        {/* Informações específicas por tipo de evento */}
        {evento.tipo === 'peneira' && evento.clube && (
          <div className="mb-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-800 font-semibold">
              🏛️ {evento.clube} • {evento.idade}
            </p>
          </div>
        )}
        
        {evento.tipo === 'copa' && (
          <div className="mb-3 p-3 bg-yellow-50 rounded-lg">
            <p className="text-yellow-800 font-semibold">
              🏆 Copa com Premiação
            </p>
          </div>
        )}

        {/* Vagas disponíveis */}
        {evento.max_inscricoes && (
          <div className="mb-3 p-3 bg-green-50 rounded-lg">
            <p className="text-green-800 font-semibold">
              ✅ {evento.inscricoes_atuais || 0}/{evento.max_inscricoes} vagas preenchidas
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{evento.local}</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {/* ✅ USANDO DATA DO SUPABASE FORMATADA */}
            <span>{formatarData(evento.data_evento)}</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {/* ✅ USANDO HORA DO SUPABASE */}
            <span>{evento.hora ? evento.hora.substring(0, 5) : 'A definir'}</span>
          </div>
          {evento.valor && (
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span className="font-semibold text-green-600">{evento.valor}</span>
            </div>
          )}
        </div>
      </div>

      {/* FORMULÁRIO DE INSCRIÇÃO */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Seus Dados</h2>
        <p className="text-gray-600 mb-6">Preencha as informações abaixo para finalizar sua inscrição</p>
        
        {/* Campo NOME */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            placeholder="Digite seu nome completo" 
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200" 
            value={form.nome} 
            onChange={e => setForm({ ...form, nome: e.target.value })} 
            required 
          />
        </div>
        
        {/* Campo EMAIL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input 
            type="email" 
            placeholder="seu@email.com" 
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200" 
            value={form.email} 
            onChange={e => setForm({ ...form, email: e.target.value })} 
            required 
          />
        </div>
        
        {/* Campo TELEFONE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone/WhatsApp <span className="text-red-500">*</span>
          </label>
          <input 
            type="tel" 
            placeholder="(11) 99999-9999" 
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200" 
            value={form.telefone} 
            onChange={e => setForm({ ...form, telefone: e.target.value })} 
            required 
          />
        </div>

        {/* Campo POSIÇÃO */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Posição em Campo
          </label>
          <select 
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
            value={form.posicao} 
            onChange={e => setForm({ ...form, posicao: e.target.value })}
          >
            <option value="">Selecione sua posição</option>
            <option value="Goleira">Goleira</option>
            <option value="Zagueira">Zagueira</option>
            <option value="Lateral">Lateral</option>
            <option value="Volante">Volante</option>
            <option value="Meia">Meia</option>
            <option value="Atacante">Atacante</option>
            <option value="Outra">Outra</option>
          </select>
        </div>

        {/* Campo IDADE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Idade <span className="text-red-500">*</span>
          </label>
          <input 
            type="number" 
            min="10"
            max="70"
            placeholder="Sua idade" 
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200" 
            value={form.idade} 
            onChange={e => setForm({ ...form, idade: e.target.value })} 
            required 
          />
        </div>
        
        {/* Campo ALTURA */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Altura <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            placeholder="Ex: 1.70m ou 170cm" 
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200" 
            value={form.altura} 
            onChange={e => setForm({ ...form, altura: e.target.value })} 
            required 
          />
        </div>

        {/* BOTÃO DE CONFIRMAR */}
        <button 
          type="submit" 
          disabled={enviando} 
          className="w-full bg-[var(--primary-color)] text-white p-4 rounded-lg font-semibold hover:bg-purple-700 transition duration-200 disabled:bg-purple-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {enviando ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Enviando Inscrição...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Confirmar Inscrição
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          ✅ Sua inscrição será salva no sistema e você poderá acompanhar no seu perfil.
        </p>
      </form>
    </div>
  );
}