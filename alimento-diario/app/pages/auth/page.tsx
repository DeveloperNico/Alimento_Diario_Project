// app/auth/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoginForm from '@/app/components/LoginForm';
import CadastroForm from '@/app/components/CadastroForm';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Alimento Diário</h1>
                    <p className="text-gray-600">Sua jornada pela Bíblia em 365 dias</p>
                </div>

                {isLogin ? (
                    <LoginForm onToggleForm={() => setIsLogin(false)} />
                ) : (
                    <CadastroForm onToggleForm={() => setIsLogin(true)} />
                )}
            </div>
        </div>
    );
}