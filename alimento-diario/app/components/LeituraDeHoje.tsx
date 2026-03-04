'use client';

import { motion } from "framer-motion";
import { Calendar, BookOpen, Clock, Share2 } from "lucide-react";
import { plano2026 } from '@/data/plano';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LeituraDeHoje() {
    const { user } = useAuth();
    const router = useRouter();

    // Calcular o dia atual do ano
    const hoje = new Date();
    const inicioAno = new Date(hoje.getFullYear(), 0, 1);
    const diffTime = hoje.getTime() - inicioAno.getTime();
    const diaAtualDoAno = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Buscar a leitura do dia no plano
    const leituraDoDia = plano2026[diaAtualDoAno];

    // Formatar data em português
    const dataFormatada = hoje.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const compartilharLeitura = () => {
        if (leituraDoDia?.leitura) {
            const referenciaEncoded = encodeURIComponent(leituraDoDia.leitura);
            router.push(`/pages/comunidade?ref=${referenciaEncoded}`);
        }
    };

    if (!user) {
        return (
            <div className="flex justify-center py-5">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative overflow-hidden rounded-2xl border border-[#006eb3] bg-white p-6 sm:p-8 w-full max-w-4xl shadow-lg text-center"
                >
                    <h2 className="text-2xl font-bold mb-4">Leitura de Hoje</h2>
                    <p className="text-gray-600">Faça login para ver sua leitura diária</p>
                </motion.div>
            </div>
        );
    }

    if (!leituraDoDia) {
        return (
            <div className="flex justify-center py-5">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative overflow-hidden rounded-2xl border border-[#006eb3] bg-white p-6 sm:p-8 w-full max-w-4xl shadow-lg text-center"
                >
                    <h2 className="text-2xl font-bold mb-4">Leitura de Hoje</h2>
                    <p className="text-gray-600">Plano de leitura não encontrado para hoje</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex justify-center py-5">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-2xl border border-[#006eb3] bg-white p-6 sm:p-8 w-full max-w-4xl shadow-lg"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-6 w-6 text-[#006eb3]" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Leitura de Hoje</h2>
                            <p className="text-sm text-gray-600">{dataFormatada}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#006eb3] text-white">
                            Dia {diaAtualDoAno}
                        </span>
                    </div>
                </div>

                {/* Conteúdo da leitura */}
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                        <BookOpen className="h-5 w-5 text-[#006eb3] mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-1">Leitura Bíblica</h3>
                            <p className="text-gray-700">{leituraDoDia.leitura}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                        <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-1">Tempo estimado de leitura</h3>
                            <p className="text-gray-700">10-15 minutos</p>
                        </div>
                    </div>
                </div>

                {/* Botões de ação */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <motion.button
                        onClick={compartilharLeitura}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Share2 size={16} />
                        Compartilhar na Comunidade
                    </motion.button>
                    
                    <p className="text-sm text-gray-500">
                        Marque quando concluir sua leitura
                    </p>
                </div>
            </motion.div>
        </div>
    );
}