// app/components/Chatbot.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [mascotState, setMascotState] = useState('greeting');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Efeito para rolar para a última mensagem
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Saudação automática quando abre
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMascotState('greeting');
            setTimeout(() => {
                handleInitialMessage();
            }, 500);
        }
    }, [isOpen]);

    const handleInitialMessage = async () => {
        setIsLoading(true);
        setMascotState('thinking');
        
        setTimeout(() => {
            setMascotState('talking');
            setMessages([{ 
                sender: 'bot', 
                text: "Olá! Sou a Passinha, sua assistente de performance aqui no Passa Bola! 🎯\n\nComo posso te ajudar hoje?\n\n1. Tirar dúvidas sobre a plataforma\n2. Montar um plano de nutrição e treinos\n3. Aprender uma receita prática" 
            }]);
            setTimeout(() => {
                setMascotState('greeting');
                setIsLoading(false);
            }, 1000);
        }, 1500);
    };

    // Função para enviar uma mensagem
    const handleSendMessage = async () => {
        if (inputValue.trim() === '' || isLoading) return;

        const userMessage = { sender: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        setMascotState('thinking');

        try {
            const botResponse = await callGeminiAPI(inputValue, messages);
            setMascotState('talking');

            setTimeout(() => {
                setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
                setMascotState('greeting');
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { 
                sender: 'bot', 
                text: '⚡ Estou com problemas técnicos agora. Pode tentar novamente?' 
            }]);
            setMascotState('greeting');
            setIsLoading(false);
        }
    };

 
const callGeminiAPI = async (userInput, currentHistory = []) => {
    // ✅ URL CORRETA DO SEU BACKEND NO RENDER
    const BACKEND_URL = 'http://localhost:8000';
    
    try {
        console.log("🔄 Enviando para o backend...");
        
        const response = await fetch(`${BACKEND_URL}/api/chat`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userInput,
                history: currentHistory
            })
        });
        
        console.log("📡 Status da resposta:", response.status);
        
        if (!response.ok) {
            // Se ainda der 404, significa que o deploy não foi feito ainda
            if (response.status === 404) {
                return "🔧 O chatbot está em manutenção. Volte em alguns minutos! 😊";
            }
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("✅ Resposta do backend:", data);
        
        if (data.success && data.response) {
            return data.response;
        } else {
            return "Olá! Sou a Passinha 😊 Como posso te ajudar com o Passa Bola hoje?";
        }
    } catch (error) {
        console.error("💥 Erro:", error);
        return getFallbackResponse(userInput);
    }
};
// Função de fallback mantida igual
const getFallbackResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('post') || input.includes('comunidade') || input.includes('postar')) {
        return "💬 Para fazer um post na comunidade:\n\n1. Vá na aba 'Comunidade' (ícone das pessoas)\n2. Clique no '+' no topo da tela\n3. Escreva seu texto e adicione fotos/vídeos\n4. Clique em 'Publicar'\n\nSeus posts aparecem automaticamente no seu perfil! 🎯";
    }
    else if (input.includes('plano') || input.includes('nutri') || input.includes('treino')) {
        return "💪 Posso te dar dicas gerais! Para planos personalizados, recomendo consultar:\n\n• Nutricionista esportivo\n• Educador físico\n• Preparador físico\n\nPosso te ajudar com informações sobre a plataforma!";
    }
    else if (input.includes('receita') || input.includes('comida') || input.includes('alimentação')) {
        return "🍳 Posso compartilhar que uma alimentação balanceada é essencial para atletas! Para receitas específicas, um nutricionista pode criar um plano ideal para suas necessidades. 😊";
    }
    else if (input.includes('evento') || input.includes('peneira') || input.includes('competição')) {
        return "🏆 Para encontrar eventos e peneiras:\n\n1. Clique no ícone do troféu\n2. Veja o calendário de eventos\n3. Filtre por cidade e data\n4. Clique no evento para detalhes e inscrição\n\nBoa sorte! ⚽";
    }
    else if (input.includes('perfil') || input.includes('editar') || input.includes('bio')) {
        return "👤 Seu perfil é seu portfólio digital!\n\nPara editar:\n1. Clique no ícone de pessoa\n2. Toque em 'Editar Perfil'\n3. Atualize suas informações\n4. Salve as alterações\n\nSeus posts da comunidade aparecem automaticamente no feed do perfil!";
    }
    else if (input.includes('oi') || input.includes('olá') || input.includes('ola')) {
        return "Olá! Sou a Passinha, sua assistente do Passa Bola! 🎯\n\nPosso te ajudar com:\n• Dúvidas sobre o app\n• Informações sobre futebol feminino\n• Navegação na plataforma\n\nEm que posso te ajudar?";
    }
    else {
        return "🤔 Interessante! Posso te ajudar com:\n\n• Funcionalidades do app Passa Bola\n• Informações sobre futebol feminino\n• Dúvidas sobre a plataforma\n\nPode me contar mais sobre o que precisa?";
    }
};
    return (
        <div className="fixed bottom-20 right-4 z-40 md:bottom-5 md:right-5">
            {/* JANELA DO CHAT */}
            <div className={`absolute bottom-16 right-0 w-80 sm:w-96 transition-all duration-300 ${
                isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}>
                
                {/* MASCOTE */}
                <div className="relative z-10 h-24 flex justify-center">
                    <div className="absolute bottom-0 w-28 h-28 transform transition-transform duration-300 hover:scale-110">

                        {/* Estado Greeting */}
                        <img 
                            src="/passinhaPronto.png" 
                            alt="Passinha Pronta" 
                            className={`absolute w-full h-full transition-opacity duration-300 ${mascotState === 'greeting' ? 'opacity-100' : 'opacity-0'}`} 
                        />

                        {/* Estado Thinking */}
                        <img 
                            src="/passinhaPensando.png" 
                            alt="Passinha Pensando" 
                            className={`absolute w-full h-full transition-opacity duration-300 animate-pulse ${mascotState === 'thinking' ? 'opacity-100' : 'opacity-0'}`} 
                        />

                        {/* Estado Talking */}
                        <img 
                            src="/passinhaFalando.png" 
                            alt="Passinha Falando" 
                            className={`absolute w-full h-full transition-opacity duration-300 ${mascotState === 'talking' ? 'opacity-100' : 'opacity-0'}`} 
                        />
                    </div>
                </div>

                {/* JANELA DO CHAT */}
                <div className="w-full h-[400px] bg-white rounded-2xl shadow-2xl flex flex-col -mt-12 border border-gray-200">
                    {/* HEADER */}
                    <div className="bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] text-white p-3 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="font-semibold text-sm">Passinha Assistente</span>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:text-gray-200 transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* MENSAGENS */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 rounded-2xl max-w-[80%] break-words shadow-sm ${
                                    msg.sender === 'user' 
                                        ? 'bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] text-white' 
                                        : 'bg-white text-gray-800 border border-gray-200'
                                }`}>
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start mb-4">
                                <div className="bg-white border border-gray-200 p-3 rounded-2xl shadow-sm">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* INPUT */}
                    <div className="p-3 border-t bg-white rounded-b-2xl">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Pergunte sobre futebol feminino..."
                                className="flex-1 p-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E2E8C] focus:border-transparent transition"
                                disabled={isLoading}
                            />
                            <button 
                                onClick={handleSendMessage} 
                                disabled={isLoading || inputValue.trim() === ''} 
                                className="bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] text-white p-3 rounded-xl hover:from-[#4A2370] hover:to-[#6B3299] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTÃO FLUTUANTE */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] text-white p-4 rounded-full shadow-lg hover:from-[#4A2370] hover:to-[#6B3299] transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5E2E8C] relative z-50"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                )}
            </button>
        </div>
    );
}