import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '../../../lib/userManager';

export async function POST(request: NextRequest) {
  try {
    const { nome, email, senha } = await request.json();

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { success: false, message: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (senha.length < 6) {
      return NextResponse.json(
        { success: false, message: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Email inválido' },
        { status: 400 }
      );
    }

    const user = await createUser(nome, email, senha);

    return NextResponse.json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
      },
    });

  } catch (error: any) {
    console.error('Erro no cadastro:', error);
    
    if (error.message === 'Email já cadastrado') {
      return NextResponse.json(
        { success: false, message: 'Este email já está cadastrado' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}