"use client";

import React, { useState, useEffect, useRef } from 'react';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentImage, setCurrentImage] = useState('/passinhaPronto.png'); // Imagem padrão
    const messagesEndRef = useRef(null);

    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    
    useEffect(() => {
        if (isLoading) {
            setCurrentImage('/passinhaPensando.png');
        } else {
            setCurrentImage('/passinhaPronto.png');
        }
    }, [isLoading]);

    
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setTimeout(() => {
                handleInitialMessage();
            }, 500);
        }
    }, [isOpen]);

    const handleInitialMessage = async () => {
        setIsLoading(true);
        
        setTimeout(() => {
                setMessages([{ 
                    sender: 'bot', 
                    text: "Olá! Sou a Passinha, sua guia de performance aqui no Passa Bola! 🎯\n\nPosso te ajudar com:\n\n💪 Exemplos de rotinas de treino\n🍳 Receitas práticas para atletas  \n📊 Dicas de nutrição esportiva\n📱 Como usar a plataforma\n\nO que você precisa hoje?" 
                }]);
            setIsLoading(false);
        }, 1000);
    };

    
    const handleSendMessage = async () => {
        if (inputValue.trim() === '' || isLoading) return;

        const userMessage = { sender: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const botResponse = await callGeminiAPI(inputValue, messages);
            
            
            setCurrentImage('/passinhaFalando.png');
            
            setTimeout(() => {
                setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
                setIsLoading(false);
                
                setTimeout(() => setCurrentImage('/passinhaPronto.png'), 1000);
            }, 500);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { 
                sender: 'bot', 
                text: '⚡ Estou com problemas técnicos agora. Pode tentar novamente?' 
            }]);
            setIsLoading(false);
            setCurrentImage('/passinhaPronto.png');
        }
    };

    const callGeminiAPI = async (userInput, currentHistory = []) => {
        const BACKEND_URL = 'https://passa-a-bola.onrender.com';
        
        try {
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
            
            if (!response.ok) {
                throw new Error(`Erro: ${response.status}`);
            }
            
            const data = await response.json();
            
            // ✅ ACEITA QUALQUER RESPOSTA DA API
            if (data.response) {
                return data.response;
            } else {
                return "Olá! Sou a Passinha 🎯 Como posso te ajudar com performance no futebol feminino?";
            }
        } catch (error) {
            console.error("Erro de conexão:", error);
            // 🔥 FALLBACK NEUTRO - não bloqueia planos
            return "🔧 Estou ajustando meus sistemas! Normalmente crio planos de treino e nutrição completos. Tente novamente em instantes! 💪";
        }
};



    return (
        <div className="fixed bottom-25 right-4 z-50 md:bottom-6 md:right-6">
            {/* JANELA DO CHAT */}
            <div className={`absolute bottom-16 right-0 w-[90vw] max-w-96 transition-all duration-300 ${
                isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}>
                
                {/* MASCOTE */}
                <div className="relative z-20 flex justify-start ml-50 -mb-15">
                    <div className="w-40 h-40 transform transition-transform duration-300 hover:scale-110">
                        <img 
                            src={currentImage}
                            alt="Passinha" 
                            className="w-full h-full drop-shadow-2xl"
                        />
                    </div>
                </div>

                {/* JANELA DO CHAT */}
                <div className="w-full h-[60vh] max-h-[500px] min-h-[300px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200/50 backdrop-blur-sm ml-2">
                    <div className="bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] text-white p-3 rounded-t-2xl">
                        <div className="flex items-center justify-end">
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white transition p-1"
                            >
                               
                            </button>
                        </div>
                    </div>

                    {/* MENSAGENS */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-4 rounded-2xl max-w-[85%] break-words shadow-sm ${
                                    msg.sender === 'user' 
                                        ? 'bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] text-white' 
                                        : 'bg-white text-gray-800 border border-gray-100 shadow-md'
                                }`}>
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start mb-4">
                                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-md">
                                    <div className="flex space-x-2 items-center">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                        <span className="text-xs text-gray-500 ml-2">Passinha está digitando...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* INPUT */}
                    <div className="p-4 border-t border-[#d6d6d6] bg-white/80 backdrop-blur-sm rounded-b-2xl">
                        <div className="flex items-center space-x-3">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Pergunte sobre futebol feminino..."
                                className="flex-1 p-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E2E8C] focus:border-transparent transition bg-white"
                                disabled={isLoading}
                            />
                            <button 
                                onClick={handleSendMessage} 
                                disabled={isLoading || inputValue.trim() === ''} 
                                className="bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] text-white p-3 rounded-xl hover:from-[#4A2370] hover:to-[#6B3299] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTÃO FLUTUANTE ESTILIZADO */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] text-white p-3 rounded-full shadow-2xl hover:from-[#4A2370] hover:to-[#6B3299] transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#5E2E8C]/30 relative z-50 group md:p-4"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <div className="relative">
                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                        </svg>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                )}
            </button>
        </div>
    );
}