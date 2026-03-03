// lib/userManager.ts
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { User, UserSession } from '../types/user';
import bcrypt from 'bcryptjs';

const USUARIOS_PATH = join(process.cwd(), 'data', 'usuarios.json');

// Função para garantir que o arquivo existe
function ensureUsersFileExists() {
  if (!existsSync(USUARIOS_PATH)) {
    const initialData = { usuarios: [] };
    writeFileSync(USUARIOS_PATH, JSON.stringify(initialData, null, 2), 'utf8');
  }
}

// Ler todos os usuários
export function readUsers(): { usuarios: User[] } {
  ensureUsersFileExists();
  const data = readFileSync(USUARIOS_PATH, 'utf8');
  return JSON.parse(data);
}

// Salvar usuários
export function saveUsers(data: { usuarios: User[] }) {
  writeFileSync(USUARIOS_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// Encontrar usuário por email
export function findUserByEmail(email: string): User | null {
  const data = readUsers();
  return data.usuarios.find(user => user.email === email) || null;
}

// Encontrar usuário por ID
export function findUserById(id: string): User | null {
  const data = readUsers();
  return data.usuarios.find(user => user.id === id) || null;
}

// Criar novo usuário
export async function createUser(nome: string, email: string, senha: string): Promise<User> {
  const data = readUsers();
  
  // Verificar se email já existe
  if (findUserByEmail(email)) {
    throw new Error('Email já cadastrado');
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(senha, 10);

  // Gerar ID único
  const id = Date.now().toString();

  const newUser: User = {
    id,
    nome,
    email,
    senha: hashedPassword,
    diasLidos: 0,
    diasLidosEspecificos: [],
    fotoPerfil: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.usuarios.push(newUser);
  saveUsers(data);

  return newUser;
}

// Validar login
export async function validateLogin(email: string, senha: string): Promise<UserSession | null> {
  const user = findUserByEmail(email);
  
  if (!user) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(senha, user.senha);
  
  if (!isValidPassword) {
    return null;
  }

  // Retornar dados da sessão (sem senha)
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    fotoPerfil: user.fotoPerfil,
  };
}

// Atualizar usuário
export function updateUser(id: string, updates: Partial<User>): User | null {
  const data = readUsers();
  const userIndex = data.usuarios.findIndex(user => user.id === id);

  if (userIndex === -1) {
    return null;
  }

  data.usuarios[userIndex] = {
    ...data.usuarios[userIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveUsers(data);
  return data.usuarios[userIndex];
}