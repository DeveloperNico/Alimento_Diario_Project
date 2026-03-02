const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        const usuario = await prisma.usuario.create({
            data: {
                nome: 'João',
                email: 'joao@example.com',
                diasLidos: 0,
            },
        });

        console.log('Usuário criado:', usuario);
    } catch (error) {
        console.error('Erro:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });