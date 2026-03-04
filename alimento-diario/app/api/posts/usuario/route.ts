import { NextRequest, NextResponse } from 'next/server';
import { findUserById } from '../../../lib/userManager';
import fs from 'fs';
import path from 'path';

const POSTS_FILE = path.join(process.cwd(), 'data', 'posts.json');

function carregarPosts(): any[] {
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

// GET - Buscar posts de um usuário específico
export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get('userId');
        
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

        const todosOsPosts = carregarPosts();
        
        // Filtrar posts do usuário e ordenar por data mais recente
        const postsDoUsuario = todosOsPosts
            .filter(post => post.userId === userId)
            .sort((a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime());

        return NextResponse.json(postsDoUsuario);
    } catch (error) {
        console.error('Erro ao buscar posts do usuário:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
