// app/components/LoginForm.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type LoginFormProps = {
    onToggleForm: () => void;
};

export default function LoginForm({ onToggleForm }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const result = await login(email, senha);

        if (!result.success) {
            setMessage(result.message);
        }

        setLoading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md mx-auto"
        >
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Entrar</h2>
                    <p className="text-gray-600 mt-2">Acesse sua conta</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Campo Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="seu@email.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Campo Senha */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Senha
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="Sua senha"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {message && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                            {message}
                        </div>
                    )}

                    {/* Botão Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>

                    {/* Link para Cadastro */}
                    <div className="text-center">
                        <p className="text-gray-600">
                            Não tem uma conta?{' '}
                            <button
                                type="button"
                                onClick={onToggleForm}
                                className="text-blue-500 hover:text-blue-600 font-semibold"
                            >
                                Cadastre-se
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}