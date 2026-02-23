'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Menu, X, Terminal } from 'lucide-react';
import { useState } from 'react';
import { ModeToggle } from '@/components/mode-toggle';

export function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Hide public navbar on admin and login pages
    if (pathname.startsWith('/admin') || pathname.startsWith('/login')) return null;

    const links = [
        { href: '/', label: 'ANA SAYFA' },
        { href: '/kurumsal', label: 'KURUMSAL' },
        { href: '/cozumler', label: 'ÇÖZÜMLER' },
        { href: '/referanslar', label: 'REFERANSLAR' },
        { href: '/iletisim', label: 'İLETİŞİM' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--viktor-bg)]/80 backdrop-blur-md border-b border-[var(--viktor-border)]">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2 group relative z-50"
                    onClick={() => setIsOpen(false)}
                >
                    <div className="w-10 h-10 bg-[var(--viktor-blue)] rounded-sm flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(0,180,216,0.5)] group-hover:shadow-[0_0_25px_rgba(0,180,216,0.8)] transition-shadow duration-300">
                        <Terminal className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg md:text-xl font-bold tracking-tighter text-[var(--foreground)] dark:text-white leading-none">VIKTOR</span>
                        <span className="text-[10px] font-mono text-[var(--viktor-blue)] tracking-widest leading-none">SYSTEMS</span>
                    </div>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium tracking-wide transition-colors relative py-2",
                                pathname === link.href
                                    ? "text-[var(--viktor-blue)]"
                                    : "text-[var(--foreground)] hover:text-[var(--viktor-blue)] dark:text-[var(--viktor-slate)] dark:hover:text-white"
                            )}
                        >
                            {link.label}
                            {pathname === link.href && (
                                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--viktor-blue)] shadow-[0_0_10px_var(--viktor-blue)]" />
                            )}
                        </Link>
                    ))}
                    <ModeToggle />
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-[var(--foreground)] dark:text-white"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-[var(--viktor-bg)] border-b border-[var(--viktor-border)] p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                "text-sm font-medium p-2 rounded-sm transition-colors",
                                pathname === link.href
                                    ? "bg-[var(--viktor-blue)]/10 text-[var(--viktor-blue)]"
                                    : "text-[var(--foreground)] hover:text-[var(--viktor-blue)] dark:text-[var(--viktor-slate)] dark:hover:text-white"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="flex justify-start px-2 pt-2 border-t border-[var(--viktor-border)]">
                        <ModeToggle />
                    </div>
                </div>
            )}
        </nav>
    );
}
