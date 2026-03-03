import { NextRequest, NextResponse } from 'next/server';
import { findUserById, updateUser } from '../../../lib/userManager';

export async function POST(request: NextRequest) {
    try {
        // Obter ID do usuário dos headers ou body
        const body = await request.json();
        const userId = request.headers.get('x-user-id') || body.userId;
        
        if (!userId) {
            return NextResponse.json(
                { erro: 'ID do usuário é obrigatório' },
                { status: 400 }
            );
        }

        const usuario = findUserById(userId);
        
        if (!usuario) {
            return NextResponse.json(
                { erro: 'Usuário não encontrado' },
                { status: 404 }
            );
        }

        // Calcular o dia atual do ano
        const hoje = new Date();
        const inicioAno = new Date(hoje.getFullYear(), 0, 1);
        const diffTime = hoje.getTime() - inicioAno.getTime();
        const diaAtualDoAno = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Inicializar array se não existir
        if (!usuario.diasLidosEspecificos) {
            usuario.diasLidosEspecificos = [];
        }

        // Verificar se o dia já foi marcado como lido
        if (!usuario.diasLidosEspecificos.includes(diaAtualDoAno)) {
            // Adicionar o dia atual aos dias lidos
            usuario.diasLidosEspecificos.push(diaAtualDoAno);
            usuario.diasLidos = usuario.diasLidosEspecificos.length;
        }

        // Atualizar usuário
        const updatedUser = updateUser(userId, {
            diasLidos: usuario.diasLidos,
            diasLidosEspecificos: usuario.diasLidosEspecificos,
        });

        if (!updatedUser) {
            return NextResponse.json(
                { erro: 'Erro ao atualizar usuário' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            sucesso: true,
            diasLidos: updatedUser.diasLidos,
            diaAtualMarcado: diaAtualDoAno,
            mensagem: 'Dia marcado como lido com sucesso!',
        });
    } catch (error) {
        console.error('Erro ao marcar dia:', error);
        return NextResponse.json(
            { erro: 'Erro ao atualizar progresso' },
            { status: 500 }
        );
    }
}