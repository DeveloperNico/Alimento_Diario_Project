'use client';

import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { CircleCheck, Calendar, BookOpen } from "lucide-react";
import { useAuth } from '../context/AuthContext';

type Progresso = {
    diasLidos: number;
    diaAtual: number;
    diasRestantes: number;
    percentual: number;
    totalDias: number;
    diasLidosEspecificos: number[];
};

export default function ProgressoLeitura() {
    const [progresso, setProgresso] = useState<Progresso | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        async function fetchProgresso() {
            if (!user) return;
            
            try {
                const res = await fetch(`/api/progresso?userId=${user.id}`);
                const data = await res.json();
                setProgresso(data);
            } catch (error) {
                console.error('Erro ao buscar progresso:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchProgresso();
    }, [user]);

    const marcarDiaLido = async () => {
        if (!user) return;
        
        try {
            const res = await fetch('/api/progresso/marcar-dia', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-user-id': user.id 
                },
                body: JSON.stringify({ userId: user.id }),
            });
            const data = await res.json();
            
            if (data.sucesso) {
                // Recarregar progresso
                const resProgresso = await fetch(`/api/progresso?userId=${user.id}`);
                const novoProgresso = await resProgresso.json();
                setProgresso(novoProgresso);
            }
        } catch (error) {
            console.error('Erro ao marcar dia:', error);
        }
    };

    if (!user) {
        return (
            <div className="flex justify-center py-5">
                <div className="text-center">Faça login para ver seu progresso</div>
            </div>
        );
    }

    if (loading) return (
        <div className="flex justify-center py-5">
            <div className="text-center">Carregando progresso...</div>
        </div>
    );

    if (!progresso) return (
        <div className="flex justify-center py-5">
            <div className="text-center">Erro ao carregar progresso</div>
        </div>
    );

    return (
        <div className="flex justify-center py-5">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-2xl border border-[#006eb3] bg-white p-6 sm:p-8 w-full max-w-4xl shadow-lg"
            >
                {/* Título */}
                <h2 className="mb-6 text-2xl font-bold">Seu Progresso</h2>

                {/* Barra de Progresso */}
                <div className="mb-6 rounded-2xl">
                    <div className="mb-3 flex justify-between text-sm">
                        <span className="font-semibold">Progresso de Leitura</span>
                        <span className="font-bold text-[#0082b5]">{progresso.percentual}%</span>
                    </div>
                    
                    {/* Barra */}
                    <div className="h-4 overflow-hidden rounded-full bg-gray-200">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progresso.percentual}%` }}
                            transition={{ duration: 1 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-[#0082b5] rounded-full"
                        />
                    </div>

                    <p className="mt-2 text-xs text-gray-600">
                        {progresso.diasLidos} de {progresso.totalDias} dias lidos
                    </p>
                </div>

                {/* Cards de Info */}
                <div className="grid grid-cols-3 gap-4">
                    {/* Card Dias Lidos */}
                    <motion.div
                        className="rounded-xl bg-[#13b0ed30] p-4 text-center"
                    >
                        <CircleCheck className="mx-auto mb-1 h-6 w-6 text-[#0082b5]" />
                        <p className="text-3xl font-bold text-[#0082b5]">{progresso.diasLidos}</p>
                        <p className="text-sm text-gray-600">Dias Lidos</p>
                    </motion.div>

                    {/* Card Dia Atual */}
                    <motion.div
                        className="rounded-xl bg-[#13b0ed30] p-4 text-center"
                    >
                        <Calendar className="mx-auto mb-1 h-6 w-6 text-[#0082b5]" />
                        <p className="text-3xl font-bold text-[#0082b5]">{progresso.diaAtual}</p>
                        <p className="text-sm text-gray-600">Dia Atual</p>
                    </motion.div>

                    {/* Card Dias Restantes */}
                    <motion.div
                        className="rounded-xl bg-[#13b0ed30] p-4 text-center"
                    >
                        <BookOpen className="mx-auto mb-1 h-6 w-6 text-[#0082b5]" />
                        <p className="text-3xl font-bold text-[#0082b5]">{progresso.diasRestantes}</p>
                        <p className="text-sm text-gray-600">Dias Restantes</p>
                    </motion.div>
                </div>

                {/* Botão para marcar dia como lido */}
                <button
                    onClick={marcarDiaLido}
                    className="mt-6 w-full rounded-lg bg-gradient-to-r from-blue-500 to-[#0082b5] py-3 font-bold text-white hover:opacity-90 transition-opacity cursor-pointer"
                >
                    ✓ Marcar Dia como Lido
                </button>
            </motion.div>
        </div>
    );
}