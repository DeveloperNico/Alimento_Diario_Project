// app/context/ProgressoContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

type ProgressoContextType = {
    diasLidosEspecificos: number[];
    recarregarDados: () => Promise<void>;
    marcarDiaComoLido: (diaDoAno?: number) => Promise<boolean>;
    loading: boolean;
};

const ProgressoContext = createContext<ProgressoContextType | undefined>(undefined);

export function ProgressoProvider({ children }: { children: ReactNode }) {
    const [diasLidosEspecificos, setDiasLidosEspecificos] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const recarregarDados = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`/api/progresso?userId=${user.id}`);
            const data = await res.json();
            setDiasLidosEspecificos(data.diasLidosEspecificos || []);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const marcarDiaComoLido = async (diaDoAno?: number): Promise<boolean> => {
        if (!user) return false;

        try {
            const body: any = { userId: user.id };
            if (diaDoAno) {
                body.diaEspecifico = diaDoAno;
            }

            const res = await fetch('/api/progresso/marcar-dia', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-user-id': user.id 
                },
                body: JSON.stringify(body),
            });
            
            const data = await res.json();
            
            if (data.sucesso) {
                // Recarregar dados do progresso
                await recarregarDados();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao marcar dia:', error);
            return false;
        }
    };

    useEffect(() => {
        recarregarDados();
    }, [user]);

    return (
        <ProgressoContext.Provider value={{ 
            diasLidosEspecificos, 
            recarregarDados, 
            marcarDiaComoLido,
            loading 
        }}>
            {children}
        </ProgressoContext.Provider>
    );
}

export function useProgresso() {
    const context = useContext(ProgressoContext);
    if (context === undefined) {
        throw new Error('useProgresso deve ser usado dentro de um ProgressoProvider');
    }
    return context;
}