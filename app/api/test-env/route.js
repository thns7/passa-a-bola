import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🔍 Testando variáveis do .env:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ NÃO ENCONTRADO');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ EXISTE' : '❌ NÃO ENCONTRADO');
  
  return NextResponse.json({
    emailUser: process.env.EMAIL_USER || 'NÃO ENCONTRADO',
    emailPass: process.env.EMAIL_PASS ? 'EXISTE' : 'NÃO ENCONTRADO',
    allEnvVars: Object.keys(process.env).filter(key => 
      key.includes('EMAIL') || key.includes('MAIL')
    )
  });
}