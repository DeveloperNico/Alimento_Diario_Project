'use client';

import { useState } from 'react';
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, BookOpen } from "lucide-react";

type LeituraData = {
    at: string;
    nt: string;
    salmo: string;
    proverbios: string;
};

export default function CalendarioLeitura() {
    const [mesAtual, setMesAtual] = useState(2); // Março (0-based)
    const [anoAtual, setAnoAtual] = useState(2026);

    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    // Dados mockados de leituras por dia - com tipo explícito
    const leiturasPorDia: Record<number, LeituraData> = {
        1: { at: "Gênesis 1-2", nt: "Mateus 1", salmo: "Salmo 1", proverbios: "Provérbios 1" },
        2: { at: "Gênesis 3-4", nt: "Mateus 2", salmo: "Salmo 2", proverbios: "Provérbios 2" },
        3: { at: "Gênesis 5-6", nt: "Mateus 3", salmo: "Salmo 3", proverbios: "Provérbios 3" },
        4: { at: "Gênesis 7-8", nt: "Mateus 4", salmo: "Salmo 4", proverbios: "Provérbios 4" },
        5: { at: "Gênesis 9-10", nt: "Mateus 5", salmo: "Salmo 5", proverbios: "Provérbios 5" },
        6: { at: "Gênesis 11-12", nt: "Mateus 6", salmo: "Salmo 6", proverbios: "Provérbios 6" },
        7: { at: "Gênesis 13-14", nt: "Mateus 7", salmo: "Salmo 7", proverbios: "Provérbios 7" },
        8: { at: "Gênesis 15-16", nt: "Mateus 8", salmo: "Salmo 8", proverbios: "Provérbios 8" },
        9: { at: "Gênesis 17-18", nt: "Mateus 9", salmo: "Salmo 9", proverbios: "Provérbios 9" },
        10: { at: "Gênesis 19-20", nt: "Mateus 10", salmo: "Salmo 10", proverbios: "Provérbios 10" },
        11: { at: "Gênesis 21-22", nt: "Mateus 11", salmo: "Salmo 11", proverbios: "Provérbios 11" },
        12: { at: "Gênesis 23-24", nt: "Mateus 12", salmo: "Salmo 12", proverbios: "Provérbios 12" },
        13: { at: "Gênesis 25-26", nt: "Mateus 13", salmo: "Salmo 13", proverbios: "Provérbios 13" },
        14: { at: "Gênesis 27-28", nt: "Mateus 14", salmo: "Salmo 14", proverbios: "Provérbios 14" },
        15: { at: "Gênesis 29-30", nt: "Mateus 15", salmo: "Salmo 15", proverbios: "Provérbios 15" },
        16: { at: "Gênesis 31-32", nt: "Mateus 16", salmo: "Salmo 16", proverbios: "Provérbios 16" },
    };
    // Calcular dias do mês
    const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
    const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();

    const proximoMes = () => {
        if (mesAtual === 11) {
            setMesAtual(0);
            setAnoAtual(anoAtual + 1);
        } else {
            setMesAtual(mesAtual + 1);
        }
    };

    const mesAnterior = () => {
        if (mesAtual === 0) {
            setMesAtual(11);
            setAnoAtual(anoAtual - 1);
        } else {
            setMesAtual(mesAtual - 1);
        }
    };

    const selecionarMes = (mes: number) => {
        setMesAtual(mes);
    };

    const getDiaStatus = (dia: number) => {
        // Simulando dias lidos (baseado no progresso do usuário: 15 dias)
        const diasLidos = 15;
        const diaAtual = 16;

        if (dia < diaAtual) return dia <= diasLidos ? 'lido' : 'perdido';
        if (dia === diaAtual) return 'hoje';
        return 'futuro';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'lido': return 'bg-green-100 border-green-500 text-green-800';
            case 'hoje': return 'bg-blue-100 border-blue-500 text-blue-800 ring-2 ring-blue-300';
            case 'perdido': return 'bg-red-100 border-red-500 text-red-800';
            default: return 'bg-gray-50 border-gray-200 text-gray-600';
        }
    };

    return (
        <div className="flex justify-center py-5">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-2xl p-6 sm:p-8 w-full max-w-8xl"
            >
                {/* Header do Calendário */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-8 w-8 text-[#0082b5]" />
                            <h2 className="text-2xl font-bold">Cronograma de Leitura</h2>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={mesAnterior}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>

                            <h3 className="text-xl font-semibold min-w-[200px] text-center">
                                {meses[mesAtual]} {anoAtual}
                            </h3>

                            <button
                                onClick={proximoMes}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Seletor de meses */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {meses.map((mes, index) => (
                            <button
                                key={mes}
                                onClick={() => selecionarMes(index)}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${index === mesAtual
                                        ? 'bg-[#0082b5] text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {mes.substring(0, 3)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Calendário */}
                <div className="grid grid-cols-7 gap-2">
                    {/* Cabeçalho dos dias da semana */}
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
                        <div key={dia} className="p-2 text-center font-semibold text-gray-600 text-sm">
                            {dia}
                        </div>
                    ))}

                    {/* Dias vazios no início */}
                    {Array.from({ length: primeiroDia }).map((_, index) => (
                        <div key={`empty-${index}`} className="p-2"></div>
                    ))}

                    {/* Dias do mês */}
                    {Array.from({ length: diasNoMes }).map((_, index) => {
                        const dia = index + 1;
                        const status = getDiaStatus(dia);
                        const leitura = leiturasPorDia[dia] as LeituraData | undefined;

                        return (
                            <motion.div
                                key={dia}
                                whileHover={{ scale: 1.05 }}
                                className={`p-2 rounded-lg border-2 cursor-pointer transition-all ${getStatusColor(status)}`}
                            >
                                <div className="text-center">
                                    <div className="font-bold text-sm mb-1">{dia}</div>

                                    {leitura && (
                                        <div className="text-xs space-y-1">
                                            <div className="flex items-center gap-1 justify-center">
                                                <BookOpen className="h-2 w-2" />
                                                <span className="truncate">{leitura.at}</span>
                                            </div>
                                            <div className="text-[10px] opacity-75">
                                                {leitura.nt} • {leitura.salmo}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Legenda */}
                <div className="mt-6 flex justify-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-green-100 border border-green-500"></div>
                        <span>Lido</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-100 border border-blue-500"></div>
                        <span>Hoje</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-red-100 border border-red-500"></div>
                        <span>Perdido</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-gray-50 border border-gray-200"></div>
                        <span>Futuro</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}