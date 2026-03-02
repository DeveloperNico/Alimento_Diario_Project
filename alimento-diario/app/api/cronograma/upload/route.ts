import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync } from 'fs';
import { join } from 'path';

const CRONOGRAMA_PATH = join(process.cwd(), 'data', 'cronograma.json');

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ erro: 'Nenhum arquivo enviado' }, { status: 400 });
        }

        console.log( Processando arquivo:  ( bytes, tipo: ));
        
        const buffer = Buffer.from(await file.arrayBuffer());
        let textoExtraido = '';

        // Suportar PDF e TXT
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            try {
                textoExtraido = await extrairTextoPDF(buffer);
                console.log( PDF processado:  caracteres);
            } catch (error) {
                console.error(' Erro no PDF:', error);
                return NextResponse.json({
                    erro: 'Não foi possível processar o PDF.',
                    detalhes: String(error),
                    sugestao: 'Tente converter o PDF para texto (.txt) ou verifique se não está protegido.'
                }, { status: 400 });
            }
        } else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
            textoExtraido = buffer.toString('utf-8');
            console.log( Arquivo texto processado:  caracteres);
        } else {
            return NextResponse.json({
                erro: 'Formato não suportado. Use PDF ou TXT.',
                formatosAceitos: ['PDF (.pdf)', 'Texto (.txt)']
            }, { status: 400 });
        }

        if (textoExtraido.length < 50) {
            return NextResponse.json({
                erro: 'Arquivo muito pequeno ou vazio.',
                caracteresEncontrados: textoExtraido.length
            }, { status: 400 });
        }

        // Analisar cronograma
        const cronogramaDetectado = analisarCronogramaBiblico(textoExtraido);

        if (cronogramaDetectado.diasEncontrados === 0) {
            return NextResponse.json({
                erro: 'Nenhum cronograma de leitura foi detectado.',
                amostraTexto: textoExtraido.substring(0, 500),
                sugestao: 'Verifique se o arquivo contém referências bíblicas no formato: Dia 1: Gênesis 1, Mateus 1...'
            }, { status: 400 });
        }

        // Salvar cronograma
        const dadosCronograma = {
            personalizado: true,
            leituras: cronogramaDetectado.leituras,
            uploadedAt: new Date().toISOString(),
            nomeArquivo: file.name,
            tipoArquivo: file.type || 'text/plain',
            estatisticas: cronogramaDetectado
        };

        writeFileSync(CRONOGRAMA_PATH, JSON.stringify(dadosCronograma, null, 2));

        return NextResponse.json({
            sucesso: true,
            mensagem: 'Cronograma importado com sucesso!',
            totalDias: cronogramaDetectado.diasEncontrados,
            formatoDetectado: cronogramaDetectado.formatoDetectado,
            resumo: {
                antigoTestamento: cronogramaDetectado.temAT,
                novoTestamento: cronogramaDetectado.temNT,
                salmos: cronogramaDetectado.temSalmos,
                proverbios: cronogramaDetectado.temProverbios
            },
            preview: Object.fromEntries(
                Object.entries(cronogramaDetectado.leituras).slice(0, 3)
            )
        });

    } catch (erro) {
        console.error(' Erro crítico:', erro);
        return NextResponse.json({
            erro: 'Erro interno do servidor.',
            detalhes: String(erro)
        }, { status: 500 });
    }
}

// Função corrigida para extrair PDF usando apenas pdf-parse
async function extrairTextoPDF(buffer: Buffer): Promise<string> {
    try {
        console.log(' Extraindo texto usando pdf-parse...');
        
        // Importar pdf-parse dinamicamente
        const pdfParse = require('pdf-parse');
        const dados = await pdfParse(buffer);

        if (!dados.text || dados.text.length < 20) {
            throw new Error('PDF parece estar vazio ou conter apenas imagens');
        }

        console.log( Sucesso:  páginas,  caracteres);
        return dados.text;

    } catch (erro) {
        console.error(' Falha na extração:', erro);
        throw new Error(Erro ao processar PDF: );
    }
}

// Parser inteligente melhorado
function analisarCronogramaBiblico(textoCompleto: string) {
    console.log(' Analisando cronograma bíblico...');

    const textoLimpo = textoCompleto
        .replace(/\r\n/g, '\n')
        .replace(/\s+/g, ' ')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

    const linhas = textoLimpo.split(/[\n\.;]/)
        .map(linha => linha.trim())
        .filter(linha => linha.length > 5);

    const cronograma: Record<number, any> = {};
    let formatoDetectado = 'Formato detectado automaticamente';
    let diaAtual = 0;
    let contadorSequencial = 1;
    let temAT = false, temNT = false, temSalmos = false, temProverbios = false;

    for (const linha of linhas) {
        // Detectar indicadores de dia com múltiplos padrões
        const padroesDia = [
            /(?:dia|day)\s*(\d+)/i,
            /^(\d+)\s*[-:\.]?\s*/,
            /(\d+)(?:º|°|th|st|nd|rd)\s*(?:dia|day)?/i,
            /(?:janeiro|jan|january)\s*(\d+)/i,
            /(?:fevereiro|fev|february)\s*(\d+)/i,
            /(?:março|mar|march)\s*(\d+)/i,
            /(?:abril|abr|april)\s*(\d+)/i,
            /(?:maio|may)\s*(\d+)/i,
            /(?:junho|jun|june)\s*(\d+)/i
        ];

        let diaDetectado = null;
        for (const padrao of padroesDia) {
            const match = linha.match(padrao);
            if (match) {
                const numero = parseInt(match[1]);
                if (numero >= 1 && numero <= 365) {
                    diaDetectado = numero;
                    formatoDetectado = 'Padrão numérico detectado';
                    break;
                }
            }
        }

        if (diaDetectado) {
            diaAtual = diaDetectado;
            contadorSequencial = diaDetectado + 1;
        } else if (diaAtual === 0) {
            diaAtual = contadorSequencial;
        }

        // Buscar referências bíblicas
        const referencias = detectarReferenciasBiblicas(linha);

        if (referencias.length > 0 && diaAtual <= 365) {
            if (!cronograma[diaAtual]) {
                cronograma[diaAtual] = { at: '', nt: '', salmo: '', proverbios: '' };
            }

            for (const ref of referencias) {
                const categoria = categorizarReferencia(ref);
                
                if (categoria === 'AT' && !cronograma[diaAtual].at) {
                    cronograma[diaAtual].at = ref;
                    temAT = true;
                } else if (categoria === 'NT' && !cronograma[diaAtual].nt) {
                    cronograma[diaAtual].nt = ref;
                    temNT = true;
                } else if (categoria === 'SALMO' && !cronograma[diaAtual].salmo) {
                    cronograma[diaAtual].salmo = ref;
                    temSalmos = true;
                } else if (categoria === 'PROVERBIOS' && !cronograma[diaAtual].proverbios) {
                    cronograma[diaAtual].proverbios = ref;
                    temProverbios = true;
                }
            }

            if (cronograma[diaAtual].at || cronograma[diaAtual].nt) {
                console.log( Dia :, cronograma[diaAtual]);
                
                if (!diaDetectado) {
                    diaAtual++;
                    contadorSequencial++;
                } else {
                    diaAtual = 0;
                }
            }
        }
    }

    const diasEncontrados = Object.keys(cronograma).length;
    console.log( Resultado:  dias detectados);

    return {
        leituras: cronograma,
        diasEncontrados,
        formatoDetectado,
        temAT, temNT, temSalmos, temProverbios
    };
}

function detectarReferenciasBiblicas(texto: string): string[] {
    const referencias: string[] = [];
    
    const padroes = [
        /\b([A-Za-zÀ-ÿ]+(?:\s+[IVX\d]+)?)\s+(\d+)(?:[-:](\d+))?(?:[-:](\d+))?\b/g,
        /\b([A-Z][a-z]{1,3})\s+(\d+)(?:[-:](\d+))?(?:[-:](\d+))?\b/g,
        /\b(?:Salmos?|Sl)\s+(\d+)(?:[-:](\d+))?\b/gi,
        /\b(?:Provérbios?|Prov|Pv)\s+(\d+)(?:[-:](\d+))?\b/gi
    ];

    for (const padrao of padroes) {
        let match;
        while ((match = padrao.exec(texto)) !== null) {
            const ref = match[0].trim();
            if (ref.length > 2 && /[A-Za-z]/.test(ref)) {
                referencias.push(ref);
            }
        }
    }

    return [...new Set(referencias)];
}

function categorizarReferencia(referencia: string): string {
    const ref = referencia.toLowerCase();
    
    if (/\b(?:salmo|salmos|sl|psalm)\b/.test(ref)) return 'SALMO';
    if (/\b(?:provérb|proverbio|prov|pv|proverb)\b/.test(ref)) return 'PROVERBIOS';
    
    const livrosNT = ['mateus', 'mt', 'marcos', 'mc', 'lucas', 'lc', 'joão', 'joao', 'jo', 'john', 'atos', 'at', 'acts', 'romanos', 'rm', 'romans', 'coríntios', 'corintios', 'co', 'corinthians', 'gálatas', 'galatas', 'gl', 'galatians', 'efésios', 'efesios', 'ef', 'ephesians', 'filipenses', 'fp', 'philippians', 'colossenses', 'cl', 'colossians', 'tessalonicenses', 'ts', 'thessalonians', 'timóteo', 'timoteo', 'tm', 'timothy', 'tito', 'tt', 'titus', 'filemom', 'filemon', 'fm', 'philemon', 'hebreus', 'hb', 'hebrews', 'tiago', 'tg', 'james', 'pedro', 'pe', 'peter', 'judas', 'jd', 'jude', 'apocalipse', 'ap', 'revelation'];
    
    if (livrosNT.some(livro => ref.includes(livro))) return 'NT';
    
    return 'AT';
}
