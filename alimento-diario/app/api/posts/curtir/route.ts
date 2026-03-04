import { NextRequest, NextResponse } from 'next/server';
import { findUserById } from '../../../lib/userManager';
import fs from 'fs';
import path from 'path';

const POSTS_FILE = path.join(process.cwd(), 'data', 'posts.json');
const CURTIDAS_FILE = path.join(process.cwd(), 'data', 'curtidas.json');

type Curtida = {
    postId: string;
    userId: string;
    dataAtivacao: string;
};

function carregarCurtidas(): Curtida[] {
    try {
        if (fs.existsSync(CURTIDAS_FILE)) {
            const data = fs.readFileSync(CURTIDAS_FILE, 'utf8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        return [];
    }
}

function salvarCurtidas(curtidas: Curtida[]): void {
    try {
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(CURTIDAS_FILE, JSON.stringify(curtidas, null, 2));
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

export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');
        const { postId } = await request.json();
        
        if (!userId) {
            return NextResponse.json(
                { error: 'ID do usuário é obrigatório' },
                { status: 400 }
            );
        }

        if (!postId) {
            return NextResponse.json(
                { error: 'ID do post é obrigatório' },
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

        const curtidas = carregarCurtidas();
        const posts = carregarPosts();
        
        // Verificar se o post existe
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex === -1) {
            return NextResponse.json(
                { error: 'Post não encontrado' },
                { status: 404 }
            );
        }

        // Verificar se já curtiu
        const jaCurtiuIndex = curtidas.findIndex(c => c.postId === postId && c.userId === userId);
        
        if (jaCurtiuIndex >= 0) {
            // Descurtir
            curtidas.splice(jaCurtiuIndex, 1);
            posts[postIndex].curtidas = Math.max(0, (posts[postIndex].curtidas || 0) - 1);
        } else {
            // Curtir
            curtidas.push({
                postId,
                userId,
                dataAtivacao: new Date().toISOString()
            });
            posts[postIndex].curtidas = (posts[postIndex].curtidas || 0) + 1;
        }

        salvarCurtidas(curtidas);
        salvarPosts(posts);

        return NextResponse.json({ 
            curtido: jaCurtiuIndex < 0,
            totalCurtidas: posts[postIndex].curtidas 
        });

    } catch (error) {
        console.error('Erro ao curtir post:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
