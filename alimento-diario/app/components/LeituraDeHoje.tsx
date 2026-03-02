'use client';

import { motion } from "framer-motion";
import { Calendar, BookOpen, FileText, Clock } from "lucide-react";

export default function LeituraDeHoje() {
    // Dados mockados - depois virão do backend
    const diaAtual = 16; // Baseado no progresso do usuário (15 + 1)
    const leituraDeHoje = {
        dia: diaAtual,
        data: "03 de março, 2026",
        leituras: [
            {
                tipo: "Antigo Testamento",
                livro: "Gênesis",
                capitulos: "16-17",
                versiculos: "Gênesis 16:1-16, 17:1-27"
            },
        ]
    };

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
                        <p className="text-gray-600">Dia {leituraDeHoje.dia} • {leituraDeHoje.data}</p>
                    </div>
                </div>

                {/* Lista de Leituras */}
                <div className="space-y-4">
                    {leituraDeHoje.leituras.map((leitura, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="rounded-xl bg-[#13b0ed30] p-4 border border-[#13b0ed50]"
                        >
                            <div className="flex items-start gap-3">
                                <div className="rounded-full bg-[#0082b5] p-2">
                                    <BookOpen className="h-4 w-4 text-white" />
                                </div>
                                
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-semibold uppercase tracking-wide text-[#0082b5]">
                                            {leitura.tipo}
                                        </span>
                                    </div>
                                    
                                    <h3 className="font-bold text-lg text-gray-800">
                                        {leitura.livro} {leitura.capitulos}
                                    </h3>
                                    
                                    <p className="text-gray-600 text-sm mt-1">
                                        {leitura.versiculos}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <FileText className="h-5 w-5 text-[#0082b5]" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

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