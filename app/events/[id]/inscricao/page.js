"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function InscricaoPage() {
  const { id } = useParams(); // ex: "encontro-pab" ou "copa-passa-bola"
  const router = useRouter();

  const eventos = {
    "encontro-pab": "Encontro PAB",
    "copa-passa-bola": "Copa Passa Bola",
  };
  const eventoNome = eventos[id] || "Evento Desconhecido";

  const [tipo, setTipo] = useState("solo");
  const [membros, setMembros] = useState([""]);
  const [form, setForm] = useState({ email: "", telefone: "", idade: "", altura: "" });
  const [loading, setLoading] = useState(false);

  return (
    <Elements stripe={stripePromise}>
      <FormularioStripe
        tipo={tipo}
        setTipo={setTipo}
        membros={membros}
        setMembros={setMembros}
        form={form}
        setForm={setForm}
        eventoNome={eventoNome}
        eventoId={id}
        router={router}
        loading={loading}
        setLoading={setLoading}
      />
    </Elements>
  );
}

function FormularioStripe({ tipo, setTipo, membros, setMembros, form, setForm, eventoNome, eventoId, router, loading, setLoading }) {
  const stripe = useStripe();
  const elements = useElements();

  const enviarEmail = async (email, nome, evento) => {
    const res = await fetch("/api/sendEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, nome, evento }),
    });
    const data = await res.json();
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ Cria PaymentIntent
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 2500 }), // R$25 em centavos
      });
      const { clientSecret } = await res.json();

      // 2️⃣ Pega cartão
      const card = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card }
      });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      // 3️⃣ Pagamento aprovado → enviar email
      const dataEmail = await enviarEmail(form.email, "Jogador(a)", eventoNome);
      if (dataEmail.ok) {
        alert(`Pagamento aprovado! Inscrição enviada para ${eventoNome}.`);
      } else {
        alert(`Pagamento aprovado, mas houve erro no email: ${dataEmail.message}`);
      }

      // 4️⃣ Redireciona
      router.push("/events");

    } catch (err) {
      console.error(err);
      alert("Ocorreu um erro no pagamento ou inscrição.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-xl font-bold mb-4">Inscrição - {eventoNome}</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow max-w-md mx-auto">
        <input type="email" placeholder="Email" className="w-full border p-2 rounded" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input type="tel" placeholder="Telefone" className="w-full border p-2 rounded" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} required />

        <div>
          <label className="mr-4">
            <input type="radio" value="solo" checked={tipo === "solo"} onChange={() => setTipo("solo")} /> Jogador Solo
          </label>
          <label>
            <input type="radio" value="equipe" checked={tipo === "equipe"} onChange={() => setTipo("equipe")} /> Equipe
          </label>
        </div>

        <input type="number" placeholder="Idade" className="w-full border p-2 rounded" value={form.idade} onChange={e => setForm({ ...form, idade: e.target.value })} required />
        <input type="text" placeholder="Altura (ex: 1.70m)" className="w-full border p-2 rounded" value={form.altura} onChange={e => setForm({ ...form, altura: e.target.value })} required />

        {tipo === "equipe" && (
          <div className="space-y-2">
            <h2 className="font-medium">Membros da equipe</h2>
            {membros.map((m, i) => (
              <input key={i} type="text" placeholder={`Membro ${i + 1}`} className="w-full border p-2 rounded" value={m} onChange={e => { const novo = [...membros]; novo[i] = e.target.value; setMembros(novo); }} />
            ))}
            <button type="button" className="bg-gray-200 px-3 py-1 rounded" onClick={() => setMembros([...membros, ""])}>+ Adicionar Membro</button>
          </div>
        )}

        <div className="border p-2 rounded">
          <CardElement />
        </div>

        <button type="submit" disabled={loading || !stripe} className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700 transition">
          {loading ? "Processando..." : "Pagar R$25 e Enviar Inscrição"}
        </button>
      </form>
    </div>
  );
}