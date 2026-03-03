'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, X, Calendar, BookOpen, Target } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type UserStats = {
    diasLidos: number;
    diasRestantes: number;
    percentual: number;
    diasLidosEspecificos: number[];
};

export default function PerfilPage() {
    const { user, updateUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        if (!user) {
            router.push('/pages/auth');
            return;
        }

        setNewName(user.nome);
        fetchStats();
    }, [user, router]);

    const fetchStats = async () => {
        if (!user) return;

        try {
            const res = await fetch(`/api/progresso?userId=${user.id}`);
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('foto', file);
            formData.append('userId', user.id);

            const response = await fetch('/api/user/upload-photo', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                updateUser({ fotoPerfil: data.fotoUrl });
            }
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveName = async () => {
        if (!user || newName.trim() === user.nome) {
            setEditingName(false);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/user/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    nome: newName.trim(),
                }),
            });

            const data = await response.json();

            if (data.success) {
                updateUser({ nome: newName.trim() });
                setEditingName(false);
            }
        } catch (error) {
            console.error('Erro ao atualizar nome:', error);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header da página */}
            <div className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
                    >
                        <X className="w-5 h-5" />
                        <span>Voltar</span>
                    </button>

                    <h1 className="text-3xl font-bold text-gray-800">Meu Perfil</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Card principal do perfil */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
                >
                    {/* Banner do perfil */}
                    <div className="h-48 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 relative">
                        <div className="absolute bottom-6 left-6 flex items-end gap-4">
                            {/* Foto do perfil */}
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                                    {user.fotoPerfil ? (
                                        <Image
                                            src={user.fotoPerfil}
                                            alt={user.nome}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                                            {getInitials(user.nome)}
                                        </div>
                                    )}
                                </div>

                                {/* Botão para trocar foto */}
                                <label className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg transition-colors">
                                    <Camera className="w-4 h-4" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={loading}
                                    />
                                </label>
                            </div>

                            {/* Info do usuário */}
                            <div className="pb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    {editingName ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                className="bg-white/90 backdrop-blur-sm text-gray-800 text-2xl font-bold px-3 py-1 rounded-lg border-2 border-blue-300 focus:outline-none focus:border-blue-500"
                                                onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleSaveName}
                                                disabled={loading}
                                                className="bg-green-500 hover:bg-green-600 text-white p-1 rounded-md disabled:opacity-50"
                                            >
                                                <Save className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingName(false);
                                                    setNewName(user.nome);
                                                }}
                                                className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-md"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setEditingName(true)}
                                            className="bg-white/90 backdrop-blur-sm text-gray-800 text-2xl font-bold px-3 py-1 rounded-lg hover:bg-white transition-colors"
                                        >
                                            {user.nome}
                                        </button>
                                    )}
                                </div>
                                <p className="text-white/90 text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full inline-block">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Estatísticas */}
                    {stats && (
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Meu Progresso</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-green-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="w-8 h-8 text-green-600" />
                                        <div>
                                            <p className="text-2xl font-bold text-green-700">{stats.diasLidos}</p>
                                            <p className="text-green-600 text-sm">Dias lidos</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Target className="w-8 h-8 text-blue-600" />
                                        <div>
                                            <p className="text-2xl font-bold text-blue-700">{stats.percentual}%</p>
                                            <p className="text-blue-600 text-sm">Progresso</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-orange-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-8 h-8 text-orange-600" />
                                        <div>
                                            <p className="text-2xl font-bold text-orange-700">{stats.diasRestantes}</p>
                                            <p className="text-orange-600 text-sm">Dias restantes</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Seção de atividade recente */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                >
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Atividade Recente</h3>

                    {stats?.diasLidosEspecificos && stats.diasLidosEspecificos.length > 0 ? (
                        <div className="space-y-3">
                            {stats.diasLidosEspecificos
                                .slice(-10) // Últimos 10 dias
                                .reverse() // Mais recentes primeiro
                                .map((dia, index) => (
                                    <div key={dia} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <div>
                                            <p className="font-semibold text-gray-800">Dia {dia} concluído</p>
                                            <p className="text-sm text-gray-500">Leitura bíblica finalizada</p>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Nenhuma atividade ainda</p>
                            <p className="text-sm text-gray-400">Comece a marcar seus dias de leitura!</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}