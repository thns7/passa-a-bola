import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  console.log('🔍 DEBUG - Variáveis de ambiente no servidor:', {
    EMAIL_USER: process.env.EMAIL_USER ? '✅ Existe' : '❌ Não existe',
    EMAIL_PASS: process.env.EMAIL_PASS ? '✅ Existe' : '❌ Não existe'
  });

  try {
    const { email, nome, evento, telefone, idade, altura, posicao } = await request.json();

    // ✅ VERIFICA SE AS VARIÁVEIS EXISTEM
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Variáveis de email não configuradas no servidor');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Serviço de email não configurado no servidor'
        },
        { status: 500 }
      );
    }

    console.log('✅ Credenciais encontradas no servidor, configurando email...');

      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

    const mailOptions = {
      from: `"Passa a Bola" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `✅ Confirmação de Inscrição - ${evento}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">🎉 INSCRIÇÃO CONFIRMADA!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Passa a Bola - Futebol Feminino</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Olá, <strong>${nome}</strong>!</h2>
            
            <p style="color: #555; line-height: 1.6;">
              Sua inscrição no evento <strong>"${evento}"</strong> foi confirmada com sucesso!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">📋 Seus Dados:</h3>
              <ul style="color: #555; line-height: 1.8; list-style: none; padding: 0;">
                <li><strong>Nome:</strong> ${nome}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Telefone:</strong> ${telefone}</li>
                <li><strong>Idade:</strong> ${idade} anos</li>
                <li><strong>Altura:</strong> ${altura}</li>
                <li><strong>Posição:</strong> ${posicao || 'Não informada'}</li>
              </ul>
            </div>

            <p style="color: #555; line-height: 1.6;">
              Te esperamos no evento! ⚽
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado com sucesso para:', email);

    return NextResponse.json({
      success: true,
      message: 'Email de confirmação enviado com sucesso!'
    });

  } catch (error) {
    console.error('❌ Erro no servidor ao enviar email:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro no servidor: ' + error.message
      },
      { status: 500 }
    );
  }
}