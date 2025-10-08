"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

// DADOS MOCK EXPANDIDOS - MAIS EVENTOS
const eventosMock = [
  {
    id: "1",
    titulo: "Campeonato de Futebol Society",
    local: "Arena Limão - São Paulo/SP",
    data: "15/12/2024", 
    hora: "14:00",
    valor: "R$ Gratuito",
    descricao: "Campeonato aberto para todas as idades. Formato Society com times de 5 jogadores. Inscrições individuais."
  },
  {
    id: "2",
    titulo: "Torneio de Futsal Sub-20", 
    local: "Ginásio Municipal - São Paulo/SP",
    data: "20/12/2024",
    hora: "19:00",
    valor: "R$ 25 por pessoa",
    descricao: "Torneio exclusivo para jogadores até 20 anos. Formato futsal com times de 5 jogadores."
  },
  {
    id: "3",
    titulo: "Liga Amadora de Futebol 7",
    local: "Campo do ABCD - São Paulo/SP",
    data: "22/12/2024",
    hora: "16:00", 
    valor: "R$ 40 por time",
    descricao: "Liga amadora com formato futebol 7. Temporada com 8 rodadas + playoffs."
  },
  {
    id: "101",
    titulo: "Copa Passa a Bola - Futebol Society",
    local: "Arena Central - São Paulo/SP", 
    data: "25/12/2024",
    hora: "16:00",
    valor: "R$ 30 por pessoa",
    descricao: "Copa especial com formato Society. Premiação em dinheiro para o campeão."
  }
];

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

  // Carregar dados do evento
  useEffect(() => {
    async function carregarEvento() {
      try {
        console.log("🔍 Buscando evento com ID:", id);
        
        // Buscar evento nos dados mock
        const eventoEncontrado = eventosMock.find(ev => ev.id === id);
        
        if (eventoEncontrado) {
          console.log("✅ Evento encontrado:", eventoEncontrado.titulo);
          setEvento(eventoEncontrado);
        } else {
          console.log("❌ Evento não encontrado, usando fallback");
          setEvento({
            id: id,
            titulo: `Evento ${id}`,
            local: "Local a definir",
            data: "Em breve",
            hora: "A definir", 
            valor: "Gratuito"
          });
        }
        
      } catch (err) {
        console.error("❌ Erro ao carregar evento:", err);
        setEvento({
          id: id,
          titulo: `Evento ${id}`,
          local: "Local a definir",
          data: "Em breve",
          hora: "A definir",
          valor: "Gratuito"
        });
      } finally {
        setLoading(false);
      }
    }
    
    carregarEvento();
  }, [id]);

  // FUNÇÃO DE ENVIO DE EMAIL - TESTADA E FUNCIONANDO
  const enviarEmail = async (formData, eventoNome, tipoInscricao) => {
  try {
    console.log('📧 Preparando envio de email...', { 
      email: formData.email, 
      nome: formData.nome,
      evento: eventoNome 
    });

    const res = await fetch("/api/sendEmail", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        email: formData.email, 
        nome: formData.nome,
        evento: eventoNome,
        telefone: formData.telefone,
        idade: formData.idade,
        altura: formData.altura,
        tipo: tipoInscricao,
        membros: tipoInscricao === 'equipe' ? membros.filter(m => m.trim() !== '') : []
      }),
    });

    const data = await res.json();
    console.log('📧 Resposta da API:', data);
    
    if (!res.ok) {
      throw new Error(data.message || `Erro HTTP ${res.status}`);
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ Erro crítico ao enviar email:', error);
    return { 
      success: false, 
      message: "Falha no serviço de email: " + error.message 
    };
  }
};

  // Função para salvar inscrição
  const salvarInscricao = async (dadosInscricao) => {
    try {
      console.log('💾 Salvando inscrição no banco de dados...');
      
      // Simular salvamento - você pode integrar com seu banco real aqui
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('✅ Inscrição salva com sucesso');
      return { 
        success: true, 
        id: Math.random().toString(36).substr(2, 9),
        message: 'Inscrição salva com sucesso' 
      };
      
    } catch (error) {
      console.error('❌ Erro ao salvar inscrição:', error);
      return { 
        success: false, 
        message: 'Erro ao salvar inscrição no banco de dados' 
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      if (!evento || !evento.titulo) {
        alert("❌ Erro: Evento não carregado corretamente");
        return;
      }

      console.log('📝 Iniciando processo de inscrição...');

      // Validar campos obrigatórios
      if (!form.nome.trim() || !form.email.trim() || !form.telefone.trim() || !form.idade.trim() || !form.altura.trim()) {
        alert("❌ Por favor, preencha todos os campos obrigatórios");
        return;
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        alert("❌ Por favor, insira um email válido");
        return;
      }

      // 1. Salvar a inscrição no banco de dados
      const resultadoSalvar = await salvarInscricao({ 
        ...form, 
        tipo, 
        membros: tipo === 'equipe' ? membros.filter(m => m.trim() !== '') : [],
        eventoId: id,
        eventoNome: evento.titulo,
        dataInscricao: new Date().toISOString()
      });

      if (!resultadoSalvar.success) {
        alert(`❌ ${resultadoSalvar.message}`);
        return;
      }

      console.log('✅ Inscrição salva, enviando email...');

      // 2. Enviar email de confirmação
      const resultadoEmail = await enviarEmail(form, evento.titulo, tipo);
      
      if (resultadoEmail.success) {
        alert(`🎉 INSCRIÇÃO CONFIRMADA!\n\n✅ Email de confirmação enviado para:\n${form.email}\n\n📧 Verifique sua caixa de entrada e spam`);
        console.log('✅ Email enviado com sucesso, redirecionando...');
        router.push("/events");
      } else {
        console.warn('⚠️ Email não enviado, mas inscrição foi salva');
        alert(`✅ INSCRIÇÃO RECEBIDA!\n\nSua inscrição foi registrada com sucesso, mas não foi possível enviar o email de confirmação.\n\nMotivo: ${resultadoEmail.message}\n\nAnote seus dados:\nNome: ${form.nome}\nEvento: ${evento.titulo}`);
        router.push("/events");
      }

    } catch (err) {
      console.error('❌ Erro crítico no processo:', err);
      alert("❌ Ocorreu um erro inesperado na inscrição. Tente novamente em alguns instantes.");
    } finally {
      setEnviando(false);
    }
  };

  // Função para adicionar membro da equipe
  const adicionarMembro = () => {
    if (membros.length < 10) {
      setMembros([...membros, ""]);
    } else {
      alert("⚠️ Limite máximo de 10 membros por equipe");
    }
  };

  // Função para remover membro da equipe
  const removerMembro = (index) => {
    if (membros.length > 1) {
      const novosMembros = membros.filter((_, i) => i !== index);
      setMembros(novosMembros);
    }
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
            <span>{evento.data}</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{evento.hora}</span>
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

        {/* Tipo de Inscrição */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Inscrição <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-3 sm:space-y-0">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="radio" 
                value="solo" 
                checked={tipo === "solo"} 
                onChange={() => setTipo("solo")} 
                className="w-4 h-4 text-[var(--primary-color)] focus:ring-purple-500"
              /> 
              <span className="text-gray-700">👤 Jogador Solo</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="radio" 
                value="equipe" 
                checked={tipo === "equipe"} 
                onChange={() => setTipo("equipe")} 
                className="w-4 h-4 text-[var(--primary-color)] focus:ring-purple-500"
              /> 
              <span className="text-gray-700">👥 Equipe</span>
            </label>
          </div>
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

        {/* MEMBROS DA EQUIPE (se for equipe) */}
        {tipo === "equipe" && (
          <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-[var(--primary-color)] flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Membros da Equipe ({membros.length}/10)
            </h3>
            <p className="text-sm text-[var(--primary-color)]">Adicione os nomes dos membros da sua equipe</p>
            
            {membros.map((membro, index) => (
              <div key={index} className="flex space-x-2">
                <input 
                  type="text" 
                  placeholder={`Nome do membro ${index + 1}`} 
                  className="flex-1 border border-gray-300 p-2 rounded focus:outline-none focus:ring-1 focus:ring-purple-500" 
                  value={membro} 
                  onChange={e => { 
                    const novo = [...membros]; 
                    novo[index] = e.target.value; 
                    setMembros(novo); 
                  }} 
                />
                {membros.length > 1 && (
                  <button 
                    type="button" 
                    className="bg-red-100 text-red-600 px-3 rounded hover:bg-red-200 transition duration-200"
                    onClick={() => removerMembro(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            
            <button 
              type="button" 
              className="bg-purple-100 text-[var(--primary-color)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 transition duration-200 flex items-center"
              onClick={adicionarMembro}
              disabled={membros.length >= 10}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Adicionar Membro
            </button>
          </div>
        )}

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
          Ao confirmar a inscrição, você concorda com os termos do evento.
          {tipo === 'equipe' && ' Você é responsável por todas as informações da equipe.'}
        </p>
      </form>
    </div>
  );
}