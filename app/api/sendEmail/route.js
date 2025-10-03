import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { email, nome, evento, telefone, idade, altura, tipo, membros = [] } = await request.json();

    console.log('📧 Recebendo solicitação de email:', { email, nome, evento });

    // Validar campos obrigatórios
    if (!email || !nome || !evento) {
      return NextResponse.json(
        { success: false, message: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Configurar transporter do Gmail - CORREÇÃO AQUI!
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Senha de app do Gmail
      },
    });

    // Formatar membros da equipe
    const membrosTexto = membros.length > 0 
      ? `Membros da Equipe:\n${membros.map((m, i) => `  ${i + 1}. ${m}`).join('\n')}`
      : 'Inscrição Individual';

    // Corpo do email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `🎉 Confirmação de Inscrição - ${evento}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">🎯 INSCRIÇÃO CONFIRMADA!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Passa a Bola - Futebol Society</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Olá, <strong>${nome}</strong>!</h2>
            
            <p style="color: #555; line-height: 1.6;">
              Sua inscrição no evento <strong>"${evento}"</strong> foi confirmada com sucesso!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">📋 Seus Dados:</h3>
              <ul style="color: #555; line-height: 1.8;">
                <li><strong>Nome:</strong> ${nome}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Telefone:</strong> ${telefone}</li>
                <li><strong>Idade:</strong> ${idade} anos</li>
                <li><strong>Altura:</strong> ${altura}</li>
                <li><strong>Tipo:</strong> ${tipo === 'equipe' ? 'Equipe' : 'Jogador Solo'}</li>
              </ul>
            </div>

            ${tipo === 'equipe' && membros.length > 0 ? `
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #764ba2;">
              <h3 style="color: #333; margin-top: 0;">👥 Membros da Equipe:</h3>
              <ul style="color: #555; line-height: 1.8;">
                ${membros.map((membro, index) => `<li><strong>${index + 1}.</strong> ${membro}</li>`).join('')}
              </ul>
            </div>
            ` : ''}

            <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #2c5282;">
                <strong>📞 Dúvidas?</strong> Entre em contato conosco pelo WhatsApp.
              </p>
            </div>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center; color: white;">
            <p style="margin: 0; font-size: 14px;">
              Passa a Bola - Organização de Eventos Esportivos<br/>
              © 2024 Todos os direitos reservados
            </p>
          </div>
        </div>
      `,
    };

    // Enviar email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado com sucesso:', info.messageId);

    return NextResponse.json({
      success: true,
      message: 'Email enviado com sucesso',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor: ' + error.message 
      },
      { status: 500 }
    );
  }
}