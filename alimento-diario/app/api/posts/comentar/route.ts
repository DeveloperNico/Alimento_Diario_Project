import { NextRequest, NextResponse } from 'next/server';
import { findUserById } from '../../../lib/userManager';
import fs from 'fs';
import path from 'path';

const POSTS_FILE = path.join(process.cwd(), 'data', 'posts.json');
const COMENTARIOS_FILE = path.join(process.cwd(), 'data', 'comentarios.json');

type Comentario = {
    id: string;
    postId: string;
    userId: string;
    userName: string;
    conteudo: string;
    dataPublicacao: string;
};

function carregarComentarios(): Comentario[] {
    try {
        if (fs.existsSync(COMENTARIOS_FILE)) {
            const data = fs.readFileSync(COMENTARIOS_FILE, 'utf8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        return [];
    }
}

function salvarComentarios(comentarios: Comentario[]): void {
    try {
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(COMENTARIOS_FILE, JSON.stringify(comentarios, null, 2));
    } catch (error) {
        throw error;
    }
}

function carregarPosts(): any[] {
    try {
        if (fs.existsSync(POSTS_FILE)) {
            const data = fs.readFileSync(POSTS_FILE, 'utf8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        return [];
    }
}

function salvarPosts(posts: any[]): void {
    try {
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
    } catch (error) {
        throw error;
    }
}

// GET - Buscar comentários de um post
export async function GET(request: NextRequest) {
    try {
        const postId = request.nextUrl.searchParams.get('postId');
        
        if (!postId) {
            return NextResponse.json(
                { error: 'ID do post é obrigatório' },
                { status: 400 }
            );
        }

        const comentarios = carregarComentarios();
        const comentariosDoPost = comentarios
            .filter(c => c.postId === postId)
            .sort((a, b) => new Date(a.dataPublicacao).getTime() - new Date(b.dataPublicacao).getTime());

        return NextResponse.json(comentariosDoPost);
    } catch (error) {
        console.error('Erro ao buscar comentários:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// POST - Criar novo comentário
export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');
        const { postId, conteudo } = await request.json();
        
        if (!userId) {
            return NextResponse.json(
                { error: 'ID do usuário é obrigatório' },
                { status: 400 }
            );
        }

        if (!postId || !conteudo?.trim()) {
            return NextResponse.json(
                { error: 'ID do post e conteúdo são obrigatórios' },
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

        const comentarios = carregarComentarios();
        const posts = carregarPosts();
        
        // Verificar se o post existe
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex === -1) {
            return NextResponse.json(
                { error: 'Post não encontrado' },
                { status: 404 }
            );
        }

        const novoComentario: Comentario = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            postId,
            userId: user.id,
            userName: user.nome,
            conteudo: conteudo.trim(),
            dataPublicacao: new Date().toISOString()
        };

        comentarios.push(novoComentario);
        posts[postIndex].comentarios = (posts[postIndex].comentarios || 0) + 1;

        salvarComentarios(comentarios);
        salvarPosts(posts);

        return NextResponse.json(novoComentario, { status: 201 });

    } catch (error) {
        console.error('Erro ao comentar post:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
