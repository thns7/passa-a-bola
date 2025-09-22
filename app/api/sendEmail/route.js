import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const data = await req.json();
    const { email, nome, evento } = data;

    if (!email || !nome) {
      return new Response(JSON.stringify({ ok: false, message: "Email e nome são obrigatórios" }), { status: 400 });
    }

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",  // troque para seu provedor real
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // app password do Gmail
        },
      });
      

    await transporter.sendMail({
      from: `"Passa Bola" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Confirmação de Inscrição",
      text: `Olá ${nome}, sua inscrição para o evento "${evento}" foi confirmada!`,
      html: `<p>Olá <strong>${nome}</strong>, sua inscrição para o evento "${evento}" foi confirmada!</p>`,
    });

    return new Response(JSON.stringify({ ok: true, message: "Email enviado com sucesso!" }), { status: 200 });
  } catch (err) {
    console.error("Erro ao enviar email:", err);
    return new Response(JSON.stringify({ ok: false, message: err.message }), { status: 500 });
  }
}
