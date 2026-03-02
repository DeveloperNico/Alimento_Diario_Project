'use client';

import { useState } from 'react';
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, BookOpen } from "lucide-react";
import { plano2026, LeituraDia } from '@/data/plano';

export default function CalendarioLeitura() {
    const [mesAtual, setMesAtual] = useState(2); // Março
    const [anoAtual, setAnoAtual] = useState(2026);

    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

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

    const calcularDiaDoAno = (dia: number, mes: number, ano: number) => {
        const data = new Date(ano, mes, dia);
        const inicioAno = new Date(ano, 0, 1);
        const diffTime = data.getTime() - inicioAno.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const getDiaStatus = (diaDoAno: number) => {
        const hoje = new Date();
        const diaAtualDoAno = calcularDiaDoAno(
            hoje.getDate(),
            hoje.getMonth(),
            hoje.getFullYear()
        );

        const diasLidos = Math.floor(diaAtualDoAno * 0.85);

        if (diaDoAno < diaAtualDoAno) {
            return diaDoAno <= diasLidos ? 'lido' : 'perdido';
        }
        if (diaDoAno === diaAtualDoAno) return 'hoje';
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
                className="relative overflow-hidden rounded-2xl bg-white p-6 sm:p-8 w-full max-w-8xl"
            >

                {/* Navegação */}
                <div className="flex items-center justify-center gap-2 mb-4">
                    <button
                        onClick={mesAnterior}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <h3 className="text-xl font-semibold min-w-[200px] text-center">
                        {meses[mesAtual]} {anoAtual}
                    </h3>

                    <button
                        onClick={proximoMes}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>

                {/* Calendário */}
                <div className="grid grid-cols-7 gap-2">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
                        <div key={dia} className="p-2 text-center font-semibold text-gray-600 text-sm">
                            {dia}
                        </div>
                    ))}

                    {Array.from({ length: primeiroDia }).map((_, index) => (
                        <div key={`empty-${index}`} />
                    ))}

                    {Array.from({ length: diasNoMes }).map((_, index) => {
                        const dia = index + 1;
                        const diaDoAno = calcularDiaDoAno(dia, mesAtual, anoAtual);
                        const leitura = plano2026[diaDoAno] as LeituraDia | undefined;
                        const status = getDiaStatus(diaDoAno);

                        return (
                            <motion.div
                                key={dia}
                                whileHover={{ scale: 1.05 }}
                                className={`p-2 rounded-lg border-2 cursor-pointer transition-all min-h-[85px] ${getStatusColor(status)}`}
                                title={
                                    leitura
                                        ? `Dia ${diaDoAno}\nLeitura: ${leitura.leitura}`
                                        : `Dia ${diaDoAno} - Sem leitura`
                                }
                            >
                                <div className="flex flex-col justify-between h-full text-center">
                                    <div className="font-bold text-sm">{dia}</div>

                                    <div className="text-[9px] text-gray-500 font-mono">
                                        D{diaDoAno}
                                    </div>

                                    {leitura ? (
                                        <div className="flex flex-col items-center justify-center text-[10px] font-medium">
                                            <BookOpen className="h-3 w-3 mb-1 text-blue-600" />
                                            <span className="truncate px-1">
                                                {leitura.leitura.length > 18
                                                    ? `${leitura.leitura.substring(0, 18)}...`
                                                    : leitura.leitura}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="text-[9px] text-gray-400">
                                            N/A
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
                        <div className="w-3 h-3 rounded bg-green-100 border border-green-500" />
                        <span>Lido</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-100 border border-blue-500" />
                        <span>Hoje</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-red-100 border border-red-500" />
                        <span>Atrasado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-gray-50 border border-gray-200" />
                        <span>Futuro</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}