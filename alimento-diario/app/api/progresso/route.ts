import { NextRequest, NextResponse } from 'next/server';
import { findUserById } from '../../lib/userManager';

export async function GET(request: NextRequest) {
    try {
        // Obter ID do usuário dos headers ou query params
        const userId = request.headers.get('x-user-id') || request.nextUrl.searchParams.get('userId');
        
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

        // Inicializar array se não existir
        if (!usuario.diasLidosEspecificos) {
            usuario.diasLidosEspecificos = [];
        }

        const totalDias = 365;
        const diasLidos = usuario.diasLidosEspecificos.length;
        const diasRestantes = totalDias - diasLidos;
        const percentual = Math.round((diasLidos / totalDias) * 100);

        // Calcular o dia atual do ano
        const hoje = new Date();
        const inicioAno = new Date(hoje.getFullYear(), 0, 1);
        const diffTime = hoje.getTime() - inicioAno.getTime();
        const diaAtualDoAno = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

        return NextResponse.json({
            diasLidos,
            diaAtual: diaAtualDoAno,
            diasRestantes,
            percentual,
            totalDias,
            diasLidosEspecificos: usuario.diasLidosEspecificos,
        });
    } catch (error) {
        console.error('Erro ao buscar progresso:', error);
        return NextResponse.json(
            { erro: 'Erro ao buscar progresso' },
            { status: 500 }
        );
    }
}