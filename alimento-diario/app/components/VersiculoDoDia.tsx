'use client';

import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { Quote, Share2 } from "lucide-react";
import { useRouter } from 'next/navigation';

type Versiculo = {
    referencia: string;
    texto: string;
};

export default function VersiculoDoDia() {
    const [versiculo, setVersiculo] = useState<Versiculo | null>(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const router = useRouter();

    useEffect(() => {
        async function fetchVersiculo() {
            try {
                const res = await fetch('/api/versiculos');
                if (!res.ok) throw new Error('Erro na requisição');

                const data = await res.json();
                console.log('Versículo recebido:', data);

                setVersiculo(data);
            } catch (e: any) {
                setErro(e.message || 'Erro desconhecido');
            } finally {
                setLoading(false);
            }
        }

        fetchVersiculo();
    }, []);

    const compartilharVersiculo = () => {
        if (versiculo) {
            const referenciaEncoded = encodeURIComponent(versiculo.referencia);
            router.push(`/pages/comunidade?ref=${referenciaEncoded}`);
        }
    };

    if (loading) return <div>Carregando versículo do dia...</div>;
    if (erro) return <div>Erro: {erro}</div>;
    if (!versiculo) return <div>Nenhum versículo encontrado.</div>;

    return (
        <div className="flex justify-center items-center py-5 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-2xl border border-[#006eb3] bg-[#a8e1f730] p-6 sm:p-8 w-full max-w-4xl shadow-lg"
            >
                <Quote className="absolute text-[#0082b580] right-4 top-4 h-10 w-10 text-accent/20" />
                <div className="relative">
                    <p className="mb-1 text-xs font-poppins font-semibold uppercase tracking-widest text-accent">
                        Versículo do Dia
                    </p>
                    <blockquote className="my-4 font-serif text-xl leading-relaxed text-foreground">
                        "{versiculo.texto}"
                    </blockquote>
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-poppins font-medium text-primary"> {versiculo.referencia}</p>
                        
                        {/* Botão Compartilhar */}
                        <motion.button
                            onClick={compartilharVersiculo}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer"
                        >
                            <Share2 size={16} />
                            Compartilhar
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
