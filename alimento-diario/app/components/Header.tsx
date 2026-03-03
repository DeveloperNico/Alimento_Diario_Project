'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Users } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import UserProfile from './UserProfile';

export default function Header() {
    const pathname = usePathname();
    const { user } = useAuth();

    const links = [
        { href: "/", label: "Início", id: "home" },
        { href: "/pages/cronograma", label: "Cronograma", id: "cronograma" },
        { href: "/comunidade", label: "Comunidade", id: "comunidade" },
    ];

    const renderIcon = (id: string) => {
        switch (id) {
            case "home":
                return <Home size={24} />;
            case "cronograma":
                return <BookOpen size={24} />;
            case "comunidade":
                return <Users size={24} />;
            default:
                return null;
        }
    };

    return (
        <header className="sticky top-0 z-1 relative bg-white overflow-hidden shadow-sm">
            <div className="absolute -top-20 -right-42 w-[800px] h-[300px] bg-[radial-gradient(circle_at_center,_#9fddf5_0%,_transparent_70%)] opacity-40 blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between px-5 py-2">
                <div className="flex items-center gap-3">
                    <Image
                        src="/logo_alimento_diario.png"
                        alt="Logo Alimento Diário"
                        width={80}
                        height={80}
                    />
                    <h1 className="font-poppins text-xl font-bold">
                        Alimento Diário
                    </h1>
                </div>

                <div className="flex items-center gap-6">
                    {/* Navegação */}
                    <nav className="flex gap-2">
                        {links.map((link) => {
                            const isActive = pathname === link.href;

                            return (
                                <Link
                                    key={link.id}
                                    href={link.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                        ? "bg-[#2091bd] text-white"
                                        : "text-[#079ed9] hover:bg-[#13b0ed30]"
                                        }`}
                                >
                                    {renderIcon(link.id)}
                                    {isActive && (
                                        <span className="font-medium">{link.label}</span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Perfil do usuário */}
                    {user && <UserProfile />}
                </div>
            </div>
        </header>
    );
}