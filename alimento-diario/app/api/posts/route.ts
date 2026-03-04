import { NextRequest, NextResponse } from 'next/server';
import { findUserById } from '../../lib/userManager';
import fs from 'fs';
import path from 'path';

type Post = {
    id: string;
    userId: string;
    userName: string;
    referencia: string;
    conteudo: string;
    dataPublicacao: string;
    curtidas: number;
    comentarios: number;
};

const POSTS_FILE = path.join(process.cwd(), 'data', 'posts.json');

function carregarPosts(): Post[] {
    try {
        if (fs.existsSync(POSTS_FILE)) {
            const data = fs.readFileSync(POSTS_FILE, 'utf8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error('Erro ao carregar posts:', error);
        return [];
    }
}

function salvarPosts(posts: Post[]): void {
    try {
        // Criar pasta data se não existir
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
    } catch (error) {
        console.error('Erro ao salvar posts:', error);
        throw error;
    }
}

// GET - Buscar todos os posts
export async function GET() {
    try {
        const posts = carregarPosts();
        
        // Ordenar por data mais recente primeiro
        const postsOrdenados = posts.sort((a, b) => 
            new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime()
        );

        return NextResponse.json(postsOrdenados);
    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// POST - Criar novo post
export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');
        
        if (!userId) {
            return NextResponse.json(
                { error: 'ID do usuário é obrigatório' },
                { status: 400 }
            );
        }

        const user = findUserById(userId);
        if (!user) {
            return NextResponse.json(
                { error: 'Usuário não encontrado' },
                { status: 404 }
            );
        }

        const { referencia, conteudo } = await request.json();

        if (!referencia?.trim() || !conteudo?.trim()) {
            return NextResponse.json(
                { error: 'Referência e conteúdo são obrigatórios' },
                { status: 400 }
            );
        }

        const posts = carregarPosts();
        
        const novoPost: Post = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            userId: user.id,
            userName: user.nome,
            referencia: referencia.trim(),
            conteudo: conteudo.trim(),
            dataPublicacao: new Date().toISOString(),
            curtidas: 0,
            comentarios: 0,
        };

        posts.push(novoPost);
        salvarPosts(posts);

        return NextResponse.json(novoPost, { status: 201 });
    } catch (error) {
        console.error('Erro ao criar post:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
