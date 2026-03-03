import { NextRequest, NextResponse } from 'next/server';
import { updateUser } from '../../../lib/userManager';

export async function POST(request: NextRequest) {
    try {
        const { userId, nome } = await request.json();

        if (!userId || !nome) {
            return NextResponse.json(
                { success: false, message: 'UserId e nome são obrigatórios' },
                { status: 400 }
            );
        }

        if (nome.trim().length < 2) {
            return NextResponse.json(
                { success: false, message: 'Nome deve ter pelo menos 2 caracteres' },
                { status: 400 }
            );
        }

        const updatedUser = updateUser(userId, { nome: nome.trim() });

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: 'Usuário não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                nome: updatedUser.nome,
                email: updatedUser.email,
                fotoPerfil: updatedUser.fotoPerfil,
            },
            message: 'Perfil atualizado com sucesso',
        });

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        return NextResponse.json(
            { success: false, message: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}