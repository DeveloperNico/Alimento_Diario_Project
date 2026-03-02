import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const CRONOGRAMA_PATH = join(process.cwd(), 'data', 'cronograma.json');

// Cronograma padrão do sistema
const cronogramaPadrao = {
    personalizado: false,
    leituras: {
        1: { at: "Gênesis 1-2", nt: "Mateus 1", salmo: "Salmo 1", proverbios: "Provérbios 1" },
        2: { at: "Gênesis 3-4", nt: "Mateus 2", salmo: "Salmo 2", proverbios: "Provérbios 2" },
        3: { at: "Gênesis 5-6", nt: "Mateus 3", salmo: "Salmo 3", proverbios: "Provérbios 3" },
        4: { at: "Gênesis 7-8", nt: "Mateus 4", salmo: "Salmo 4", proverbios: "Provérbios 4" },
        5: { at: "Gênesis 9-10", nt: "Mateus 5", salmo: "Salmo 5", proverbios: "Provérbios 5" },
        6: { at: "Gênesis 11-12", nt: "Mateus 6", salmo: "Salmo 6", proverbios: "Provérbios 6" },
        7: { at: "Gênesis 13-14", nt: "Mateus 7", salmo: "Salmo 7", proverbios: "Provérbios 7" },
        8: { at: "Gênesis 15-16", nt: "Mateus 8", salmo: "Salmo 8", proverbios: "Provérbios 8" },
        9: { at: "Gênesis 17-18", nt: "Mateus 9", salmo: "Salmo 9", proverbios: "Provérbios 9" },
        10: { at: "Gênesis 19-20", nt: "Mateus 10", salmo: "Salmo 10", proverbios: "Provérbios 10" },
        11: { at: "Gênesis 21-22", nt: "Mateus 11", salmo: "Salmo 11", proverbios: "Provérbios 11" },
        12: { at: "Gênesis 23-24", nt: "Mateus 12", salmo: "Salmo 12", proverbios: "Provérbios 12" },
        13: { at: "Gênesis 25-26", nt: "Mateus 13", salmo: "Salmo 13", proverbios: "Provérbios 13" },
        14: { at: "Gênesis 27-28", nt: "Mateus 14", salmo: "Salmo 14", proverbios: "Provérbios 14" },
        15: { at: "Gênesis 29-30", nt: "Mateus 15", salmo: "Salmo 15", proverbios: "Provérbios 15" },
        16: { at: "Gênesis 31-32", nt: "Mateus 16", salmo: "Salmo 16", proverbios: "Provérbios 16" },
    }
};

export async function GET() {
    try {
        if (existsSync(CRONOGRAMA_PATH)) {
            const cronogramaData = readFileSync(CRONOGRAMA_PATH, 'utf8');
            const cronograma = JSON.parse(cronogramaData);
            return NextResponse.json(cronograma);
        } else {
            return NextResponse.json(cronogramaPadrao);
        }
    } catch (error) {
        console.error('Erro ao buscar cronograma:', error);
        return NextResponse.json(cronogramaPadrao);
    }
}

export async function DELETE() {
    try {
        if (existsSync(CRONOGRAMA_PATH)) {
            const fs = require('fs');
            fs.unlinkSync(CRONOGRAMA_PATH);
        }
        return NextResponse.json({ 
            sucesso: true, 
            mensagem: 'Cronograma personalizado removido. Voltando ao padrão.' 
        });
    } catch (error) {
        return NextResponse.json(
            { erro: 'Erro ao remover cronograma personalizado' },
            { status: 500 }
        );
    }
}