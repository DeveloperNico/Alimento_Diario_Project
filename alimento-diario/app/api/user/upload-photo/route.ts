import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { updateUser } from '../../../lib/userManager';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('foto') as File;
        const userId = formData.get('userId') as string;

        if (!file || !userId) {
            return NextResponse.json(
                { success: false, message: 'Arquivo e userId são obrigatórios' },
                { status: 400 }
            );
        }

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, message: 'Apenas imagens são permitidas' },
                { status: 400 }
            );
        }

        // Validar tamanho (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, message: 'Imagem deve ter no máximo 5MB' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Criar pasta uploads se não existir
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profiles');
        await mkdir(uploadsDir, { recursive: true });

        // Gerar nome único para o arquivo
        const fileExtension = file.name.split('.').pop();
        const fileName = `${userId}_${Date.now()}.${fileExtension}`;
        const filePath = join(uploadsDir, fileName);

        // Salvar arquivo
        await writeFile(filePath, buffer);

        // URL da foto
        const fotoUrl = `/uploads/profiles/${fileName}`;

        // Atualizar usuário no banco
        const updatedUser = updateUser(userId, { fotoPerfil: fotoUrl });

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: 'Erro ao atualizar usuário' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            fotoUrl,
            message: 'Foto atualizada com sucesso',
        });

    } catch (error) {
        console.error('Erro no upload:', error);
        return NextResponse.json(
            { success: false, message: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}