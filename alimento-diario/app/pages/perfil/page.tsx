'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, X, Calendar, BookOpen, Target, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/app/components/Header';

type UserStats = {
    diasLidos: number;
    diasRestantes: number;
    percentual: number;
    diasLidosEspecificos: number[];
};

type Post = {
    id: string;
    userId: string;
    userName: string;
    referencia: string;
    conteudo: string;
    dataPublicacao: string;
    curtidas: number;
    comentarios: number;
};

export default function PerfilPage() {
    const { user, updateUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/pages/auth');
            return;
        }

        setNewName(user.nome);
        fetchStats();
        fetchUserPosts();
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

    const fetchUserPosts = async () => {
        if (!user) return;

        try {
            const res = await fetch(`/api/posts/usuario?userId=${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setUserPosts(data);
            }
        } catch (error) {
            console.error('Erro ao buscar posts do usuário:', error);
        } finally {
            setLoadingPosts(false);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        const formData = new FormData();
        formData.append('photo', file);

        setLoading(true);
        try {
            const res = await fetch('/api/user/upload-photo', {
                method: 'POST',
                headers: {
                    'x-user-id': user.id,
                },
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                updateUser({ ...user, fotoPerfil: data.fotoUrl });
            }
        } catch (error) {
            console.error('Erro ao fazer upload da foto:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNameSave = async () => {
        if (!user || newName.trim() === user.nome) {
            setEditingName(false);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/user/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id,
                },
                body: JSON.stringify({ nome: newName.trim() }),
            });

            if (res.ok) {
                updateUser({ ...user, nome: newName.trim() });
                setEditingName(false);
            }
        } catch (error) {
            console.error('Erro ao atualizar nome:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatarData = (dataString: string) => {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Header />
            <div className="container mx-auto px-4 py-8">
                {/* Header do Perfil */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg p-6 mb-8"
                >
                    <div className="flex items-center gap-6">
                        {/* Foto do Perfil */}
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                                {user.fotoPerfil ? (
                                    <Image
                                        src={user.fotoPerfil}
                                        alt="Foto do perfil"
                                        width={96}
                                        height={96}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Camera size={32} />
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                id="photo"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <label
                                htmlFor="photo"
                                className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                            >
                                <Camera size={16} />
                            </label>
                        </div>

                        {/* Informações do Usuário */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                {editingName ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="text-2xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none"
                                        />
                                        <button
                                            onClick={handleNameSave}
                                            disabled={loading}
                                            className="text-green-600 hover:text-green-700"
                                        >
                                            <Save size={20} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingName(false);
                                                setNewName(user.nome);
                                            }}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <h1
                                        onClick={() => setEditingName(true)}
                                        className="text-2xl font-bold text-gray-800 cursor-pointer hover:text-blue-600"
                                    >
                                        {user.nome}
                                    </h1>
                                )}
                            </div>
                            <p className="text-gray-600">Usuário ativo na plataforma</p>
                        </div>
                    </div>
                </motion.div>

                {/* Layout de Duas Colunas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Coluna da Esquerda - Atividades Recentes (1/3 da largura) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Atividades Recentes</h2>
                            
                            {stats && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-gray-800">Dias Lidos</p>
                                            <p className="text-sm text-gray-600">{stats.diasLidos} de 365 dias</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                        <BookOpen className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium text-gray-800">Progresso</p>
                                            <p className="text-sm text-gray-600">{stats.percentual.toFixed(1)}% concluído</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                        <Target className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium text-gray-800">Meta</p>
                                            <p className="text-sm text-gray-600">Ler a Bíblia em 1 ano</p>
                                        </div>
                                    </div>

                                    {/* Posts Publicados */}
                                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                        <MessageCircle className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium text-gray-800">Posts Publicados</p>
                                            <p className="text-sm text-gray-600">{userPosts.length} reflexões compartilhadas</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Coluna da Direita - Meus Posts (2/3 da largura) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Meus Posts</h2>
                            
                            {loadingPosts ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">Carregando seus posts...</p>
                                </div>
                            ) : userPosts.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-600 mb-4">Você ainda não publicou nenhum post.</p>
                                    <button
                                        onClick={() => router.push('/pages/comunidade')}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        Publicar Agora
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {userPosts.map((post) => (
                                        <motion.div
                                            key={post.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                            {/* Header do Post */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                                    {post.referencia}
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {formatarData(post.dataPublicacao)}
                                                </span>
                                            </div>

                                            {/* Conteúdo */}
                                            <p className="text-gray-700 mb-3 leading-relaxed">
                                                {post.conteudo}
                                            </p>

                                            {/* Estatísticas */}
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Heart size={14} />
                                                    <span>{post.curtidas || 0} curtidas</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageCircle size={14} />
                                                    <span>{post.comentarios || 0} comentários</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
