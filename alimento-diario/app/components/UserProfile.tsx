// app/components/UserProfile.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function UserProfile() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { user, logout } = useAuth();
    const router = useRouter();

    // Garantir que o componente está montado (para SSR)
    useEffect(() => {
        setMounted(true);
    }, []);

    // Calcular posição do dropdown
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right,
            });
        }
    }, [isOpen]);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                // Verificar se o clique foi no dropdown
                const dropdownElement = document.getElementById('user-profile-dropdown');
                if (dropdownElement && dropdownElement.contains(event.target as Node)) {
                    return;
                }
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    // Fechar dropdown ao rolar a página
    useEffect(() => {
        function handleScroll() {
            if (isOpen) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('scroll', handleScroll);
            return () => document.removeEventListener('scroll', handleScroll);
        }
    }, [isOpen]);

    const handleLogout = () => {
        logout();
        router.push('/pages/auth');
    };

    const handleEditProfile = () => {
        setIsOpen(false);
        router.push('/pages/perfil');
    };

    if (!user) return null;

    // Gerar iniciais se não houver foto
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const dropdownContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    id="user-profile-dropdown"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="fixed w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-[9999]"
                    style={{
                        top: `${dropdownPosition.top}px`,
                        right: `${dropdownPosition.right}px`,
                    }}
                >
                    {/* Info do usuário no dropdown */}
                    <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                                {user.fotoPerfil ? (
                                    <Image
                                        src={user.fotoPerfil}
                                        alt={user.nome}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <span>{getInitials(user.nome)}</span>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{user.nome}</p>
                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Opções do menu */}
                    <div className="py-1">
                        <button
                            onClick={handleEditProfile}
                            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left cursor-pointer"
                        >
                            <Settings className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-700">Minha conta</span>
                        </button>
                        
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-50 transition-colors text-left text-red-600 cursor-pointer"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Sair da conta</span>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            {/* Botão do perfil */}
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {/* Foto/Avatar */}
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {user.fotoPerfil ? (
                        <Image
                            src={user.fotoPerfil}
                            alt={user.nome}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <span className="text-sm">{getInitials(user.nome)}</span>
                    )}
                </div>

                {/* Info do usuário */}
                <div className="flex-1 text-left hidden sm:block">
                    <p className="font-semibold text-gray-800 text-sm">{user.nome}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{user.email}</p>
                </div>

                {/* Seta */}
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                </motion.div>
            </button>

            {/* Dropdown renderizado via Portal */}
            {mounted && createPortal(dropdownContent, document.body)}
        </>
    );
}