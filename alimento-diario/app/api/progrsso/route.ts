import { PrismaClient } from "@prisma/client/extension";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        // Para começar, pegamos o usuário com ID 1
        // Depois você autentica o usuário
        const usuario = await prisma.usuario.findUnique({
            where: { id: 1 },
        });

        if (!usuario) {
            return Response.json(
                { erro: 'Usuário não encontrado' },
                { status: 404 }
            );
        }

        const totalDias = 365;
        const diasRestantes = totalDias - usuario.diasLidos;
        const percentual = Math.round((usuario.diasLidos / totalDias) * 100);

        return Response.json({
            diasLidos: usuario.diasLidos,
            diaAtual: usuario.diasLidos + 1,
            diasRestantes,
            percentual,
            totalDias,
        });
    } catch (error) {
        return Response.json(
            { erro: 'Erro ao buscar progresso' },
            { status: 500 }
        );
    }
}