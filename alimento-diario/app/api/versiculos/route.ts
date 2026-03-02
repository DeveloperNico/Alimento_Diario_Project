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
  { nome: '1 Kings', capitulos: 22 },
  { nome: '2 Kings', capitulos: 25 },
  { nome: '1 Chronicles', capitulos: 29 },
  { nome: '2 Chronicles', capitulos: 36 },
  { nome: 'Ezra', capitulos: 10 },
  { nome: 'Nehemiah', capitulos: 13 },
  { nome: 'Esther', capitulos: 10 },
  { nome: 'Job', capitulos: 42 },
  { nome: 'Psalms', capitulos: 150 },
  { nome: 'Proverbs', capitulos: 31 },
  { nome: 'Ecclesiastes', capitulos: 12 },
  { nome: 'Song of Solomon', capitulos: 8 },
  { nome: 'Isaiah', capitulos: 66 },
  { nome: 'Jeremiah', capitulos: 52 },
  { nome: 'Lamentations', capitulos: 5 },
  { nome: 'Ezekiel', capitulos: 48 },
  { nome: 'Daniel', capitulos: 12 },
  { nome: 'Hosea', capitulos: 14 },
  { nome: 'Joel', capitulos: 3 },
  { nome: 'Amos', capitulos: 9 },
  { nome: 'Obadiah', capitulos: 1 },
  { nome: 'Jonah', capitulos: 4 },
  { nome: 'Micah', capitulos: 7 },
  { nome: 'Nahum', capitulos: 3 },
  { nome: 'Habakkuk', capitulos: 3 },
  { nome: 'Zephaniah', capitulos: 3 },
  { nome: 'Haggai', capitulos: 2 },
  { nome: 'Zechariah', capitulos: 14 },
  { nome: 'Malachi', capitulos: 4 },
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