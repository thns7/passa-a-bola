import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const data = await req.json();
    const { email, nome, evento } = data;

    // Validações
    if (!email || !nome) {
      return new Response(JSON.stringify({ 
        ok: false, 
        message: "Email e nome são obrigatórios" 
      }), { status: 400 });
    }

    console.log("📧 Tentando enviar email para:", email);

    // CONFIGURAÇÃO CORRIGIDA DO GMAIL
    let transporter = nodemailer.createTransport({
      service: "gmail",  // ← USA SERVICE EM VEZ DE HOST/PORT
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // ← SUA NOVA SENHA DE APP
      },
    });

    // Template de email bonito
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">🎉 Inscrição Confirmada!</h2>
        <p>Olá <strong>${nome}</strong>,</p>
        <p>Sua inscrição para o evento <strong>"${evento}"</strong> foi confirmada com sucesso!</p>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #4F46E5;">📋 Detalhes da Inscrição:</h3>
          <p><strong>Evento:</strong> ${evento}</p>
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>Email:</strong> ${email}</p>
        </div>

        <p>Fique atento(a) ao seu email para mais informações sobre datas e horários do evento.</p>
        
        <p style="color: #666; font-size: 14px;">
          Atenciosamente,<br>
          <strong>Equipe Passa a Bola</strong>
        </p>
      </div>
    `;

    // Enviar email
    await transporter.sendMail({
      from: `"Passa a Bola" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `✅ Confirmação de Inscrição - ${evento}`,
      text: `Olá ${nome}, sua inscrição para o evento "${evento}" foi confirmada com sucesso!`,
      html: emailHtml,
    });

    console.log("✅ Email enviado com sucesso para:", email);

    return new Response(JSON.stringify({ 
      ok: true, 
      message: "Email de confirmação enviado com sucesso!" 
    }), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (err) {
    console.error("❌ Erro ao enviar email:", err);
    return new Response(JSON.stringify({ 
      ok: false, 
      message: "Erro interno ao enviar email: " + err.message 
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}