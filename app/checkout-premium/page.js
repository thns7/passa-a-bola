'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Crown, Check, Shield, CreditCard, Smartphone, QrCode, Lock, X } from "lucide-react";

export default function CheckoutPremium() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("pix");
  const router = useRouter();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleSubscribe = async () => {
    setLoading(true);
    
    // Simular processamento de pagamento
    setTimeout(() => {
      // Mock - usuário vira premium
      const updatedUser = { ...user, isPremium: true };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      
      alert("🎉 Parabéns! Você agora é um Torcedor Elite!");
      router.push("/perfil");
    }, 2000);
  };

  const benefits = [
    "IA Personalizada Ilimitada",
    "Lembretes Inteligentes",
    "Arquivo Histórico Completo",
    "Notícias Antecipadas",
    "Descontos Exclusivos",
    "Portfólio Profissional",
    "Perfil Verificado"
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Voltar</span>
          </button>
          
          {/* BOTÃO X PARA FECHAR */}
          <button 
            onClick={() => router.push("/perfil")}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 rounded-2xl">
              <Crown className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Torcedor Elite
          </h1>
          <p className="text-gray-600">
            Upgrade para a experiência completa do Passa Bola
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Coluna 1: Benefícios e Preço */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Seus Benefícios
              </h2>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Valor do Investimento
              </h2>
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-4xl font-bold text-gray-900">R$ 19,90</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <p className="text-gray-600 mb-4">
                  ou R$ 167,90/ano (economize 30%)
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm font-medium">
                    💰 Cancele a qualquer momento
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 2: Forma de Pagamento */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Forma de Pagamento
            </h2>

            {/* Opções de Pagamento */}
            <div className="space-y-4 mb-6">
              <div 
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  selectedPayment === "pix" 
                    ? "border-purple-500 bg-purple-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedPayment("pix")}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                    <QrCode className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">PIX</p>
                    <p className="text-sm text-gray-600">Pagamento instantâneo</p>
                  </div>
                  {selectedPayment === "pix" && (
                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </div>

              <div 
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  selectedPayment === "credit" 
                    ? "border-purple-500 bg-purple-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedPayment("credit")}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Cartão de Crédito</p>
                    <p className="text-sm text-gray-600">Parcelado em até 12x</p>
                  </div>
                  {selectedPayment === "credit" && (
                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botão de Assinatura */}
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processando...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  Finalizar Assinatura
                </>
              )}
            </button>

            {/* Segurança */}
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Pagamento 100% seguro</span>
            </div>

            {/* Termos */}
            <div className="text-center mt-6">
              <p className="text-xs text-gray-500">
                Ao assinar, você concorda com nossos{" "}
                <a href="#" className="text-purple-600 hover:underline">
                  Termos de Uso
                </a>{" "}
                e{" "}
                <a href="#" className="text-purple-600 hover:underline">
                  Política de Privacidade
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Garantia */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-2">
              ✅ Garantia de 7 Dias
            </h3>
            <p className="text-gray-600 text-sm">
              Se não gostar, devolvemos seu dinheiro em até 7 dias
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}