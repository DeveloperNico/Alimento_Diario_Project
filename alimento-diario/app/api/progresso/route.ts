import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const USUARIO_PATH = join(process.cwd(), 'data', 'usuario.json');

export async function GET() {
    try {
        const usuarioData = readFileSync(USUARIO_PATH, 'utf8');
        const usuario = JSON.parse(usuarioData);

        const totalDias = 365;
        const diasRestantes = totalDias - usuario.diasLidos;
        const percentual = Math.round((usuario.diasLidos / totalDias) * 100);

        return NextResponse.json({
            diasLidos: usuario.diasLidos,
            diaAtual: usuario.diasLidos + 1,
            diasRestantes,
            percentual,
            totalDias,
        });
    } catch (error) {
        console.error('Erro ao buscar progresso:', error);
        return NextResponse.json(
            { erro: 'Erro ao buscar progresso' },
            { status: 500 }
        );
    }
}