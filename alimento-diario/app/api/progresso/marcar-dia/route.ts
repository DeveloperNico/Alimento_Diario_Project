import { NextRequest, NextResponse } from 'next/server';
import { findUserById, updateUser } from '../../../lib/userManager';

export async function POST(request: NextRequest) {
    try {
        // Obter ID do usuário dos headers ou body
        const body = await request.json();
        const userId = request.headers.get('x-user-id') || body.userId;
        const diaEspecifico = body.diaEspecifico; // Novo parâmetro opcional
        
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

        let diaParaMarcar: number;

        if (diaEspecifico && typeof diaEspecifico === 'number') {
            // Usar o dia específico fornecido
            diaParaMarcar = diaEspecifico;
        } else {
            // Usar o dia atual do ano (comportamento original)
            const hoje = new Date();
            const inicioAno = new Date(hoje.getFullYear(), 0, 1);
            const diffTime = hoje.getTime() - inicioAno.getTime();
            diaParaMarcar = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }

        // Validar se o dia está dentro do range válido (1-365)
        if (diaParaMarcar < 1 || diaParaMarcar > 365) {
            return NextResponse.json(
                { erro: 'Dia inválido. Deve estar entre 1 e 365.' },
                { status: 400 }
            );
        }

        // Inicializar array se não existir
        if (!usuario.diasLidosEspecificos) {
            usuario.diasLidosEspecificos = [];
        }

        // Verificar se o dia já foi marcado como lido
        if (!usuario.diasLidosEspecificos.includes(diaParaMarcar)) {
            // Adicionar o dia aos dias lidos
            usuario.diasLidosEspecificos.push(diaParaMarcar);
            // Ordenar o array para manter organização
            usuario.diasLidosEspecificos.sort((a, b) => a - b);
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
            diaMarcado: diaParaMarcar,
            mensagem: `Dia ${diaParaMarcar} marcado como lido com sucesso!`,
        });
    } catch (error) {
        console.error('Erro ao marcar dia:', error);
        return NextResponse.json(
            { erro: 'Erro ao atualizar progresso' },
            { status: 500 }
        );
    }
}