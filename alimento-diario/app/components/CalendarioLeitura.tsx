'use client';

import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, BookOpen, Upload, X, AlertCircle } from "lucide-react";

type LeituraData = {
    at: string;
    nt: string;
    salmo: string;
    proverbios: string;
};

type CronogramaData = {
    personalizado: boolean;
    leituras: Record<number, LeituraData>;
    uploadedAt?: string;
    tipoArquivo?: string;
};

export default function CalendarioLeitura() {
    const [mesAtual, setMesAtual] = useState(2); // MarÃ§o (0-based)
    const [anoAtual, setAnoAtual] = useState(2026);
    const [cronograma, setCronograma] = useState<CronogramaData | null>(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    const meses = [
        'Janeiro', 'Fevereiro', 'MarÃ§o', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    useEffect(() => {
        carregarCronograma();
    }, []);

    const carregarCronograma = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/cronograma');
            const data = await res.json();
            setCronograma(data);
        } catch (error) {
            console.error('Erro ao carregar cronograma:', error);
        } finally {
            setLoading(false);
        }
    };

    

    const removerCronogramaPersonalizado = async () => {
        if (!confirm('Tem certeza que deseja remover o cronograma personalizado?')) return;

        try {
            const res = await fetch('/api/cronograma', {
                method: 'DELETE',
            });

            const result = await res.json();
            if (result.sucesso) {
                alert('Cronograma personalizado removido!');
                carregarCronograma();
            }
        } catch (error) {
            console.error('Erro ao remover cronograma:', error);
            alert('Erro ao remover cronograma personalizado');
        }
    };

    // Calcular dias do mÃªs
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
        // TODO: Integrar com API de progresso do usuÃ¡rio
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

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center py-5">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0082b5] mx-auto mb-4"></div>
                    <p>Carregando cronograma...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (!cronograma) {
        return (
            <div className="flex justify-center py-5">
                <div className="text-center text-red-600">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>Erro ao carregar cronograma</p>
                    <button
                        onClick={carregarCronograma}
                        className="mt-2 px-4 py-2 bg-[#0082b5] text-white rounded-lg"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    const leiturasPorDia = cronograma.leituras;

    return (
        <div className="flex justify-center py-5">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-2xl border border-[#006eb3] bg-white p-6 sm:p-8 w-full max-w-6xl shadow-lg"
            >
                {/* Header com upload */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-8 w-8 text-[#0082b5]" />
                            <div>
                                <h2 className="text-2xl font-bold">Cronograma de Leitura</h2>
                                {cronograma.personalizado && (
                                    <p className="text-sm text-green-600">
                                        ðŸ“„ Cronograma personalizado ({cronograma.tipoArquivo})
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {cronograma.personalizado && (
                                <button
                                    onClick={removerCronogramaPersonalizado}
                                    className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
                                >
                                    <X className="h-4 w-4" />
                                    Remover
                                </button>
                            )}

                            <label className="flex items-center gap-2 px-4 py-2 bg-[#0082b5] text-white rounded-lg hover:bg-[#006ea3] transition-colors cursor-pointer">
                                <Upload className="h-4 w-4" />
                                {uploading ? 'Processando...' : 'Upload'}
                                <input
                                    type="file"
                                    accept=".pdf,.txt"
                                    disabled={uploading}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* NavegaÃ§Ã£o do mÃªs */}
                    <div className="flex items-center justify-center gap-2 mb-4">
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

                {/* CalendÃ¡rio */}
                <div className="grid grid-cols-7 gap-2">
                    {/* CabeÃ§alho dos dias da semana */}
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'SÃ¡b'].map(dia => (
                        <div key={dia} className="p-2 text-center font-semibold text-gray-600 text-sm">
                            {dia}
                        </div>
                    ))}

                    {/* Dias vazios no inÃ­cio */}
                    {Array.from({ length: primeiroDia }).map((_, index) => (
                        <div key={`empty-${index}`} className="p-2"></div>
                    ))}

                    {/* Dias do mÃªs */}
                    {Array.from({ length: diasNoMes }).map((_, index) => {
                        const dia = index + 1;
                        const status = getDiaStatus(dia);
                        const leitura = leiturasPorDia[dia] as LeituraData | undefined;

                        return (
                            <motion.div
                                key={dia}
                                whileHover={{ scale: 1.05 }}
                                className={`p-2 rounded-lg border-2 cursor-pointer transition-all ${getStatusColor(status)}`}
                                title={leitura ? `AT: ${leitura.at}\nNT: ${leitura.nt}\n${leitura.salmo}\n${leitura.proverbios}` : `Dia ${dia}`}
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
                                                {leitura.nt} â€¢ {leitura.salmo}
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

                {/* InformaÃ§Ãµes adicionais */}
                {cronograma.personalizado && cronograma.uploadedAt && (
                    <div className="mt-4 text-xs text-gray-500 text-center">
                        Cronograma carregado em: {new Date(cronograma.uploadedAt).toLocaleDateString('pt-BR')}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
