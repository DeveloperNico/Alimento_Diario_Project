import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const postsPath = path.join(process.cwd(), 'data/posts.json');
// PUT - Editar post
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = request.headers.get('x-user-id');
        const { conteudo, referencia } = await request.json();
        const { id: postId } = await params;

        if (!userId || !conteudo || !referencia) {
            return NextResponse.json({ error: 'Dados obrigatórios' }, { status: 400 });
        }

        const postsData = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
        const postIndex = postsData.findIndex((p: any) => p.id === postId);

        if (postIndex === -1) {
            return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
        }

        // Verificar se é o dono do post
        if (postsData[postIndex].userId !== userId) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        // Atualizar post
        postsData[postIndex] = {
            ...postsData[postIndex],
            conteudo,
            referencia,
            dataEdicao: new Date().toISOString()
        };

        fs.writeFileSync(postsPath, JSON.stringify(postsData, null, 2));

        return NextResponse.json({
            conteudo,
            referencia,
            dataEdicao: postsData[postIndex].dataEdicao
        });

    } catch (error) {
        console.error('Erro ao editar post: ', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}

// DELETE - Excluir post
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = request.headers.get('x-user-id');
        const { id: postId } = await params;

        if (!userId) {
            return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
        }

        const postsData = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
        const postIndex = postsData.findIndex((p: any) => p.id === postId);

        if (postIndex === -1) {
            return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
        }

        // Verificar se é o dono do post
        if (postsData[postIndex].userId !== userId) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        // Remover post
        postsData.splice(postIndex, 1);
        fs.writeFileSync(postsPath, JSON.stringify(postsData, null, 2));

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Erro ao excluir post: ', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}