// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateLogin } from '../../../lib/userManager';

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json();

    if (!email || !senha) {
      return NextResponse.json(
        { success: false, message: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const user = await validateLogin(email, senha);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      user,
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}