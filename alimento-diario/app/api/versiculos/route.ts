import { NextResponse } from 'next/server';

const livros = [
  { nome: 'Genesis', capitulos: 50 },
  { nome: 'Exodus', capitulos: 40 },
  { nome: 'Leviticus', capitulos: 27 },
  { nome: 'Numbers', capitulos: 36 },
  { nome: 'Deuteronomy', capitulos: 34 },
  { nome: 'Joshua', capitulos: 24 },
  { nome: 'Judges', capitulos: 21 },
  { nome: 'Ruth', capitulos: 4 },
  { nome: '1 Samuel', capitulos: 31 },
  { nome: '2 Samuel', capitulos: 24 },
  { nome: 'Matthew', capitulos: 28 },
  { nome: 'Mark', capitulos: 16 },
  { nome: 'Luke', capitulos: 24 },
  { nome: 'John', capitulos: 21 },
  { nome: 'Acts', capitulos: 28 },
  { nome: 'Romans', capitulos: 16 },
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

function getDiaDoAno() {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), 0, 1);
  const diff = hoje.getTime() - inicio.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

export async function GET() {
  try {
    const dia = getDiaDoAno();
    const leitura = cronograma[(dia - 1) % cronograma.length];

    // 🔥 gera um versículo baseado no dia (1 até 20)
    const versiculo = (dia % 20) + 1;

    const referencia = `${leitura.livro} ${leitura.capitulo}:${versiculo}`;

    const url = `https://bible-api.com/${encodeURIComponent(referencia)}`;

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