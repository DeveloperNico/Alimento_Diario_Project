// app/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSession } from '../types/user';

type AuthContextType = {
    user: UserSession | null;
    login: (email: string, senha: string) => Promise<{ success: boolean; message: string }>;
    register: (nome: string, email: string, senha: string) => Promise<{ success: boolean; message: string }>;
    logout: () => void;
    loading: boolean;
    updateUser: (userData: Partial<UserSession>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserSession | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar se existe sessão no localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, senha: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha }),
            });

            const data = await response.json();

            if (data.success) {
                const userData = data.user;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return { success: true, message: 'Login realizado com sucesso!' };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: 'Erro ao fazer login' };
        }
    };

    const register = async (nome: string, email: string, senha: string) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha }),
            });

            const data = await response.json();

            if (data.success) {
                return { success: true, message: 'Cadastro realizado com sucesso!' };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: 'Erro ao fazer cadastro' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const updateUser = (userData: Partial<UserSession>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}