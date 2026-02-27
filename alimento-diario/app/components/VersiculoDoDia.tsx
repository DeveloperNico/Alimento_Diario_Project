'use client';

import React, { useEffect, useState } from 'react';

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
        <div>
            <h2>Versículo do Dia</h2>
            <p>
                <strong>{versiculo.referencia}</strong>
            </p>
            <blockquote>{versiculo.texto}</blockquote>
        </div>
    );
}