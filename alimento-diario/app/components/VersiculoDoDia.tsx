'use client';

import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

type Versiculo = {
    referencia: string;
    texto: string;
};

export default function VersiculoDoDia() {
    const [versiculo, setVersiculo] = useState<Versiculo | null>(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        async function fetchVersiculo() {
            try {
                const res = await fetch('/api/versiculos'); // 👈 cuidado aqui
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

    if (loading) return <div>Carregando versículo do dia...</div>;
    if (erro) return <div>Erro: {erro}</div>;
    if (!versiculo) return <div>Nenhum versículo encontrado.</div>;

    return (
        <div className="flex justify-center items-center py-10 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-2xl border border-[#004269] bg-[#a8e1f730] p-6 sm:p-8 w-full max-w-4xl shadow-lg"
            >
                <Quote className="absolute text-[#0082b580] right-4 top-4 h-10 w-10 text-accent/20" />
                <div className="relative">
                    <p className="mb-1 text-xs font-poppins font-semibold uppercase tracking-widest text-accent">
                        Versículo do Dia
                    </p>
                    <blockquote className="my-4 font-serif text-xl leading-relaxed text-foreground">
                        "{versiculo.texto}"
                    </blockquote>
                    <p className="text-sm font-poppins font-medium text-primary">— {versiculo.referencia}</p>
                </div>
            </motion.div>
        </div>
    );
}