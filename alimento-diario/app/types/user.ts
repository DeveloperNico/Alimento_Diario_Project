export type User = {
    id: string;
    nome: string;
    email: string;
    senha: string;
    diasLidos: number;
    diasLidosEspecificos: number[];
    fotoPerfil?: string;
    createdAt: string;
    updatedAt: string;
};

export type UserSession = {
    id: string;
    nome: string;
    email: string;
    fotoPerfil?: string;
};

export type LoginData = {
    email: string;
    senha: string;
};

export type RegisterData = {
    nome: string;
    email: string;
    senha: string;
};