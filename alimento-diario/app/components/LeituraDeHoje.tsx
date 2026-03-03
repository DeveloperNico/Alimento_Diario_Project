'use client';

import { motion } from "framer-motion";
import { Calendar, BookOpen, FileText, Clock } from "lucide-react";
import { plano2026 } from '@/data/plano';
import { useAuth } from '@/app/context/AuthContext';

export default function LeituraDeHoje() {
    const { user } = useAuth();

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
                    <p className="text-gray-600">Não há leitura programada para hoje</p>
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
                <div className="mb-6 flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-[#0082b5]" />
                    <div>
                        <h2 className="text-2xl font-bold">Leitura de Hoje</h2>
                        <p className="text-gray-600">Dia {diaAtualDoAno} • {dataFormatada}</p>
                    </div>
                </div>

                {/* Leitura do Dia */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-xl bg-[#13b0ed30] p-4 border border-[#13b0ed50]"
                >
                    <div className="flex items-start gap-3">
                        <div className="rounded-full bg-[#0082b5] p-2">
                            <BookOpen className="h-4 w-4 text-white" />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wide text-[#0082b5]">
                                    Leitura Diária
                                </span>
                            </div>

                            <h3 className="font-bold text-lg text-gray-800">
                                {leituraDoDia.leitura}
                            </h3>

                            <p className="text-gray-600 text-sm mt-1">
                                Plano de Leitura Bíblica Anual
                            </p>
                        </div>

                        <div className="text-right">
                            <FileText className="h-5 w-5 text-[#0082b5]" />
                        </div>
                    </div>
                </motion.div>

                {/* Footer com tempo estimado */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 flex items-center justify-center gap-2 text-gray-600"
                >
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Tempo estimado: 15-20 minutos</span>
                </motion.div>
            </motion.div>
        </div>
    );
}