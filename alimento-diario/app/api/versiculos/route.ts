import { NextResponse } from 'next/server';

const livros = [
    { nome: 'Matthew', capitulos: 28 },
    { nome: 'Mark', capitulos: 16 },
    { nome: 'Luke', capitulos: 24 },
    { nome: 'John', capitulos: 21 },
    { nome: 'Acts', capitulos: 28 },
    { nome: 'Romans', capitulos: 16 },
    { nome: '1 Corinthians', capitulos: 16 },
    { nome: '2 Corinthians', capitulos: 13 },
    { nome: 'Galatians', capitulos: 6 },
    { nome: 'Ephesians', capitulos: 6 },
    { nome: 'Philippians', capitulos: 4 },
    { nome: 'Colossians', capitulos: 4 },
    { nome: '1 Thessalonians', capitulos: 5 },
    { nome: '2 Thessalonians', capitulos: 3 },
    { nome: '1 Timothy', capitulos: 6 },
    { nome: '2 Timothy', capitulos: 4 },
    { nome: 'Titus', capitulos: 3 },
    { nome: 'Philemon', capitulos: 1 },
    { nome: 'Hebrews', capitulos: 13 },
    { nome: 'James', capitulos: 5 },
    { nome: '1 Peter', capitulos: 5 },
    { nome: '2 Peter', capitulos: 3 },
    { nome: '1 John', capitulos: 5 },
    { nome: '2 John', capitulos: 1 },
    { nome: '3 John', capitulos: 1 },
    { nome: 'Jude', capitulos: 1 },
    { nome: 'Revelation', capitulos: 22 },
];

function gerarCronograma() {
    const plano: { livro: string; capitulo: number }[] = [];

    livros.forEach((livro) => {
        for (let i = 1; i <= livro.capitulos; i++) {
            plano.push({
                livro: livro.nome,
                capitulo: i,
            });
        }
    });

    return plano;
}

const cronograma = gerarCronograma();

function getRandomSeed() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth() + 1; // 1-12
    const dia = hoje.getDate(); // 1-31

    // Criar uma seed única para o dia usando ano+mes+dia
    return ano * 10000 + mes * 100 + dia;
}

function randomWithSeed(seed: number, max: number) {
    const x = Math.sin(seed) * 10000;
    return Math.floor((x - Math.floor(x)) * max);
}

export async function GET() {
    try {
        const seed = getRandomSeed();

        // Selecionar livro/capítulo aleatório baseado na seed do dia
        const indiceAleatorio = randomWithSeed(seed, cronograma.length);
        const leitura = cronograma[indiceAleatorio];

        // Gerar versículo aleatório (1 até 20) com seed diferente
        const versiculo = randomWithSeed(seed + 1, 20) + 1;

        const referencia = `${leitura.livro} ${leitura.capitulo}:${versiculo}`;

        const url = `https://bible-api.com/${encodeURIComponent(referencia)}?translation=almeida`;

        const response = await fetch(url, {
            next: { revalidate: 86400 }, // cache 24h
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Erro ao buscar versículo' },
                { status: response.status }
            );
        }

        const data = await response.json();

        return NextResponse.json({
            referencia: data.reference,
            texto: data.text.trim(),
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}