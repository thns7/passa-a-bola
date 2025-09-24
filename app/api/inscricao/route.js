import nodemailer from "nodemailer";

export async function POST(req) {
  const data = await req.json();
  const { email, nome, evento } = data;

  // Configuração do e-mail
  let transporter = nodemailer.createTransport({
    host: "smtp.seuprovedor.com", // coloque seu host SMTP
    port: 587,
    auth: { user: "seuemail@dominio.com", pass: "senha" }, // coloque seu e-mail e senha
  });

  try {
    await transporter.sendMail({
      from: '"App Futebol" <seuemail@dominio.com>',
      to: email,
      subject: "Confirmação de Inscrição",
      text: `Olá ${nome}, sua inscrição para o evento "${evento}" foi confirmada!`,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("Erro ao enviar e-mail:", err);
    return new Response(JSON.stringify({ ok: false, erro: err.message }), { status: 500 });
  }
}