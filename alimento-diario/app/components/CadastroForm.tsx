// app/components/RegisterForm.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type RegisterFormProps = {
    onToggleForm: () => void;
};

export default function CadastroForm({ onToggleForm }: RegisterFormProps) {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('error');

    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // Validações
        if (senha !== confirmarSenha) {
            setMessage('As senhas não coincidem');
            setMessageType('error');
            setLoading(false);
            return;
        }

        if (senha.length < 6) {
            setMessage('A senha deve ter pelo menos 6 caracteres');
            setMessageType('error');
            setLoading(false);
            return;
        }

        const result = await register(nome, email, senha);

        setMessage(result.message);
        setMessageType(result.success ? 'success' : 'error');

        if (result.success) {
            // Limpar formulário e ir para login após 2 segundos
            setTimeout(() => {
                setNome('');
                setEmail('');
                setSenha('');
                setConfirmarSenha('');
                onToggleForm();
            }, 2000);
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
                    <h2 className="text-3xl font-bold text-gray-800">Cadastrar</h2>
                    <p className="text-gray-600 mt-2">Crie sua conta</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Campo Nome */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Nome
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="Seu nome"
                                required
                            />
                        </div>
                    </div>

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
                                placeholder="Mínimo 6 caracteres"
                                required
                                minLength={6}
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

                    {/* Campo Confirmar Senha */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Confirmar Senha
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="password"
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="Digite a senha novamente"
                                required
                            />
                        </div>
                    </div>

                    {message && (
                        <div className={`text-sm text-center p-3 rounded-lg ${messageType === 'success'
                                ? 'text-green-500 bg-green-50'
                                : 'text-red-500 bg-red-50'
                            }`}>
                            {message}
                        </div>
                    )}

                    {/* Botão Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </button>

                    {/* Link para Login */}
                    <div className="text-center">
                        <p className="text-gray-600">
                            Já tem uma conta?{' '}
                            <button
                                type="button"
                                onClick={onToggleForm}
                                className="text-blue-500 hover:text-blue-600 font-semibold"
                            >
                                Entre
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}