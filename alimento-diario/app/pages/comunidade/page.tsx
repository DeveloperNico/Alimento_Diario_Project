'use client';

import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { Send, Heart, MessageCircle, Repeat2, Edit, Trash2 } from "lucide-react";
import { useAuth } from '../../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/app/components/Header';

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

type Comentario = {
    id: string;
    postId: string;
    userId: string;
    userName: string;
    conteudo: string;
    dataPublicacao: string;
};

export default function ComunidadePage() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [publicando, setPublicando] = useState(false);

    // Form state
    const [referencia, setReferencia] = useState('');
    const [conteudo, setConteudo] = useState('');

    // Comentários
    const [comentariosVisiveis, setComentariosVisiveis] = useState<{ [postId: string]: boolean }>({});
    const [comentarios, setComentarios] = useState<{ [postId: string]: Comentario[] }>({});
    const [novoComentario, setNovoComentario] = useState<{ [postId: string]: string }>({});
    const [comentando, setComentando] = useState<{ [postId: string]: boolean }>({});

    // Curtidas
    const [curtidas, setCurtidas] = useState<{ [postId: string]: boolean }>({});
    const [curtindo, setCurtindo] = useState<{ [postId: string]: boolean }>({});

    // Estados para edição
    const [editandoPost, setEditandoPost] = useState<string | null>(null);
    const [textoEditado, setTextoEditado] = useState('');
    const [referenciaEditada, setReferenciaEditada] = useState('');
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);
    const [excluindoPost, setExcluindoPost] = useState<{ [postId: string]: boolean }>({});

    // Verificar se veio de compartilhamento (versículo do dia ou leitura)
    useEffect(() => {
        const refParam = searchParams?.get('ref');
        if (refParam) {
            setReferencia(decodeURIComponent(refParam));
        }
    }, [searchParams]);

    // Buscar posts
    useEffect(() => {
        buscarPosts();
    }, []);

    const buscarPosts = async () => {
        try {
            const response = await fetch('/api/posts');
            if (response.ok) {
                const data = await response.json();
                setPosts(data);
            }
        } catch (error) {
            console.error('Erro ao buscar posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const publicarPost = async () => {
        if (!user || !referencia.trim() || !conteudo.trim()) {
            alert('Preencha todos os campos!');
            return;
        }

        setPublicando(true);
        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id,
                },
                body: JSON.stringify({
                    referencia: referencia.trim(),
                    conteudo: conteudo.trim(),
                }),
            });

            if (response.ok) {
                setReferencia('');
                setConteudo('');
                buscarPosts(); // Atualizar lista
            } else {
                alert('Erro ao publicar post');
            }
        } catch (error) {
            console.error('Erro ao publicar:', error);
            alert('Erro ao publicar post');
        } finally {
            setPublicando(false);
        }
    };

    const curtirPost = async (postId: string) => {
        if (!user || curtindo[postId]) return;

        setCurtindo(prev => ({ ...prev, [postId]: true }));

        try {
            const response = await fetch('/api/posts/curtir', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id,
                },
                body: JSON.stringify({ postId }),
            });

            if (response.ok) {
                const data = await response.json();
                setCurtidas(prev => ({ ...prev, [postId]: data.curtido }));

                // Atualizar contador no post
                setPosts(prev => prev.map(post =>
                    post.id === postId
                        ? { ...post, curtidas: data.totalCurtidas }
                        : post
                ));
            }
        } catch (error) {
            console.error('Erro ao curtir post:', error);
        } finally {
            setCurtindo(prev => ({ ...prev, [postId]: false }));
        }
    };

    const toggleComentarios = async (postId: string) => {
        if (!comentariosVisiveis[postId]) {
            // Buscar comentários se ainda não foram carregados
            if (!comentarios[postId]) {
                try {
                    const response = await fetch(`/api/posts/comentar?postId=${postId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setComentarios(prev => ({ ...prev, [postId]: data }));
                    }
                } catch (error) {
                    console.error('Erro ao buscar comentários:', error);
                }
            }
        }

        setComentariosVisiveis(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    const comentarPost = async (postId: string) => {
        if (!user || !novoComentario[postId]?.trim() || comentando[postId]) return;

        setComentando(prev => ({ ...prev, [postId]: true }));

        try {
            const response = await fetch('/api/posts/comentar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id,
                },
                body: JSON.stringify({
                    postId,
                    conteudo: novoComentario[postId].trim()
                }),
            });

            if (response.ok) {
                const data = await response.json();

                // Adicionar comentário à lista
                setComentarios(prev => ({
                    ...prev,
                    [postId]: [...(prev[postId] || []), data]
                }));

                // Limpar input
                setNovoComentario(prev => ({ ...prev, [postId]: '' }));

                // Atualizar contador no post
                setPosts(prev => prev.map(post =>
                    post.id === postId
                        ? { ...post, comentarios: post.comentarios + 1 }
                        : post
                ));
            }
        } catch (error) {
            console.error('Erro ao comentar post:', error);
        } finally {
            setComentando(prev => ({ ...prev, [postId]: false }));
        }
    };

    const republicarPost = (post: Post) => {
        // Preencher formulário com dados do post para republicar
        setReferencia(post.referencia);
        setConteudo(`Republicando: ${post.conteudo}`);

        // Scroll para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const formatarData = (dataString: string) => {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const iniciarEdicao = (post: Post) => {
        setEditandoPost(post.id);
        setTextoEditado(post.conteudo);
        setReferenciaEditada(post.referencia);
    };

    const cancelarEdicao = () => {
        setEditandoPost(null);
        setTextoEditado('');
        setReferenciaEditada('');
    };

    const salvarEdicao = async (postId: string) => {
        if (!user || !textoEditado.trim() || !referenciaEditada.trim() || salvandoEdicao) {
            alert('Preencha todos os campos!');
            return;
        }

        if (!textoEditado.trim() || !referenciaEditada.trim()) {
            alert('Preencha todos os campos!');
            return;
        }

        setSalvandoEdicao(true);
        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id,
                },
                body: JSON.stringify({
                    conteudo: textoEditado.trim(),
                    referencia: referenciaEditada.trim(),
                }),
            });

            if (response.ok) {
                const postAtualizado = await response.json();
                setPosts(prev => prev.map(post =>
                    post.id === postId ? { ...post, ...postAtualizado } : post
                ));
                cancelarEdicao();
            } else {
                alert('Erro ao salvar alterações');
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar alterações');
        } finally {
            setSalvandoEdicao(false);
        }
    };

    const excluirPost = async (postId: string) => {
        if (!user) return;

        if (!confirm('Tem certeza que deseja excluir este post?')) {
            return;
        }

        setExcluindoPost(prev => ({ ...prev, [postId]: true }));
        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'x-user-id': user.id,
                },
            });

            if (response.ok) {
                setPosts(prev => prev.filter(post => post.id !== postId));
            } else {
                alert('Erro ao excluir post');
            }
        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir post');
        } finally {
            setExcluindoPost(prev => ({ ...prev, [postId]: false }));
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Faça login para acessar a comunidade
                    </h2>
                    <button
                        onClick={() => router.push('/pages/auth')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Fazer Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Header />

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Comunidade</h1>
                    <p className="text-gray-600">Compartilhe reflexões sobre a palavra de Deus</p>
                </motion.div>

                {/* Formulário de Post */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg p-6 mb-8"
                >
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Compartilhar Reflexão</h2>

                    {/* Referência Bíblica */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Referência Bíblica
                        </label>
                        <input
                            type="text"
                            value={referencia}
                            onChange={(e) => setReferencia(e.target.value)}
                            placeholder="Ex: João 3:16 ou Gênesis 1:1-3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Conteúdo do Post */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sua Reflexão
                        </label>
                        <textarea
                            value={conteudo}
                            onChange={(e) => setConteudo(e.target.value)}
                            placeholder="Compartilhe sua reflexão sobre este versículo..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Botão Publicar */}
                    <button
                        onClick={publicarPost}
                        disabled={publicando || !referencia.trim() || !conteudo.trim()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                    >
                        <Send size={16} />
                        {publicando ? 'Publicando...' : 'Publicar'}
                    </button>
                </motion.div>

                {/* Lista de Posts */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Carregando posts...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Nenhum post ainda. Seja o primeiro a compartilhar!</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl shadow-lg p-6"
                            >
                                {/* Header do Post */}
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{post.userName}</h3>
                                        <p className="text-sm text-gray-500">{formatarData(post.dataPublicacao)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                            {post.referencia}
                                        </div>

                                        {/* Botões de editar/excluir apenas para posts do usuário */}
                                        {post.userId === user?.id && (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => iniciarEdicao(post)}
                                                    className="p-1 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                                                    title="Editar post"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => excluirPost(post.id)}
                                                    disabled={excluindoPost[post.id]}
                                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 cursor-pointer"
                                                    title="Excluir post"
                                                >
                                                    {excluindoPost[post.id] ? (
                                                        <div className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full"></div>
                                                    ) : (
                                                        <Trash2 size={14} />
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Conteúdo do Post */}
                                <div className="mb-4">
                                    {editandoPost === post.id ? (
                                        /* Modo de edição */
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Referência Bíblica
                                                </label>
                                                <input
                                                    type="text"
                                                    value={referenciaEditada}
                                                    onChange={(e) => setReferenciaEditada(e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Conteúdo
                                                </label>
                                                <textarea
                                                    value={textoEditado}
                                                    onChange={(e) => setTextoEditado(e.target.value)}
                                                    rows={3}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => salvarEdicao(post.id)}
                                                    disabled={salvandoEdicao}
                                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400 cursor-pointer"
                                                >
                                                    {salvandoEdicao ? 'Salvando...' : 'Salvar'}
                                                </button>
                                                <button
                                                    onClick={cancelarEdicao}
                                                    className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 cursor-pointer"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Modo de visualização */
                                        <p className="text-gray-700 leading-relaxed">{post.conteudo}</p>
                                    )}
                                </div>

                                {/* Ações do Post */}
                                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => curtirPost(post.id)}
                                        disabled={curtindo[post.id]}
                                        className={`flex items-center gap-2 transition-colors ${curtidas[post.id]
                                            ? 'text-red-500'
                                            : 'text-gray-500 hover:text-red-500 cursor-pointer'
                                            } ${curtindo[post.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <Heart
                                            size={16}
                                            fill={curtidas[post.id] ? 'currentColor' : 'none'}
                                            className={curtindo[post.id] ? 'animate-pulse' : ''}
                                        />
                                        <span className="text-sm">{post.curtidas || 0}</span>
                                    </button>

                                    <button
                                        onClick={() => toggleComentarios(post.id)}
                                        className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors cursor-pointer"
                                    >
                                        <MessageCircle size={16} />
                                        <span className="text-sm">{post.comentarios || 0}</span>
                                    </button>

                                    <button
                                        onClick={() => republicarPost(post)}
                                        className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors ml-auto cursor-pointer"
                                    >
                                        <Repeat2 size={16} />
                                        <span className="text-sm">Republicar</span>
                                    </button>
                                </div>

                                {/* Seção de Comentários */}
                                {comentariosVisiveis[post.id] && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-4 pt-4 border-t border-gray-100"
                                    >
                                        {/* Lista de Comentários */}
                                        <div className="space-y-3 mb-4">
                                            {comentarios[post.id]?.map((comentario) => (
                                                <div key={comentario.id} className="bg-gray-50 rounded-lg p-3">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-medium text-gray-800">
                                                            {comentario.userName}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {formatarData(comentario.dataPublicacao)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">{comentario.conteudo}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Form para Novo Comentário */}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={novoComentario[post.id] || ''}
                                                onChange={(e) => setNovoComentario(prev => ({
                                                    ...prev,
                                                    [post.id]: e.target.value
                                                }))}
                                                placeholder="Escreva um comentário..."
                                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        comentarPost(post.id);
                                                    }
                                                }}
                                                disabled={comentando[post.id]}
                                            />
                                            <button
                                                onClick={() => comentarPost(post.id)}
                                                disabled={!novoComentario[post.id]?.trim() || comentando[post.id]}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                                            >
                                                {comentando[post.id] ? (
                                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                                ) : (
                                                    <Send size={14} />
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </div>
        </div>
    );
}