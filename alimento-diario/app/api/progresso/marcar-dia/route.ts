import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const USUARIO_PATH = join(process.cwd(), 'data', 'usuario.json');

export async function POST() {
    try {
        const usuarioData = readFileSync(USUARIO_PATH, 'utf8');
        const usuario = JSON.parse(usuarioData);

        // Incrementar dias lidos
        usuario.diasLidos += 1;
        usuario.updatedAt = new Date().toISOString();

        // Salvar de volta
        writeFileSync(USUARIO_PATH, JSON.stringify(usuario, null, 2), 'utf8');

        return NextResponse.json({
            sucesso: true,
            diasLidos: usuario.diasLidos,
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