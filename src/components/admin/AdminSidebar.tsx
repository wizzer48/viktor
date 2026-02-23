'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LogOut,
    Home,
    LayoutDashboard,
    PlusCircle,
    Bot,
    FileText,
    ChevronLeft,
    ChevronRight,
    ImageIcon,
    FolderOpen,
    Package,
    Layers,
} from 'lucide-react';
import { useState } from 'react';
import { logout } from '@/app/actions/auth';

const navSections = [
    {
        label: 'Genel',
        items: [
            { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/admin/teklifler', label: 'Teklifler', icon: FileText },
        ],
    },
    {
        label: 'Ürün Yönetimi',
        items: [
            { href: '/admin/urunler', label: 'Ürünler', icon: Package },
            { href: '/admin/ekle', label: 'Ürün Ekle', icon: PlusCircle },
            { href: '/admin/importer', label: 'AI Importer', icon: Bot },
            { href: '/admin/importer/toplu', label: 'Toplu Import', icon: Layers },
        ],
    },
    {
        label: 'İçerik',
        items: [
            { href: '/admin/referanslar', label: 'Referanslar', icon: ImageIcon },
            { href: '/admin/referanslar/ekle', label: 'Referans Ekle', icon: FolderOpen },
        ],
    },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname.startsWith(href);
    };

    return (
        <aside
            className={`sticky top-0 h-screen flex flex-col bg-[var(--viktor-surface)] border-r border-[var(--viktor-border)] transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-[72px]' : 'w-64'
                }`}
        >
            {/* Brand Header */}
            <div className="h-16 flex items-center border-b border-[var(--viktor-border)] px-4 gap-3 flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-[var(--viktor-blue)] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    V
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <p className="font-mono text-xs tracking-widest text-[var(--viktor-blue)] font-bold leading-none">
                            VIKTOR
                        </p>
                        <p className="font-mono text-[10px] text-[var(--viktor-slate)] tracking-wider leading-tight mt-0.5">
                            Admin Console
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation Sections */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                {navSections.map((section) => (
                    <div key={section.label}>
                        {!collapsed && (
                            <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--viktor-slate)] mb-2 px-3">
                                {section.label}
                            </p>
                        )}
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        title={collapsed ? item.label : undefined}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${active
                                            ? 'bg-[var(--viktor-blue)]/10 text-[var(--viktor-blue)] border border-[var(--viktor-blue)]/20'
                                            : 'text-[var(--viktor-slate)] hover:text-foreground hover:bg-[var(--viktor-bg)] border border-transparent'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-[var(--viktor-blue)]' : ''}`} />
                                        {!collapsed && <span>{item.label}</span>}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="border-t border-[var(--viktor-border)] p-3 space-y-1 flex-shrink-0">
                <Link
                    href="/"
                    title={collapsed ? 'Siteye Git' : undefined}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--viktor-slate)] hover:text-foreground hover:bg-[var(--viktor-bg)] transition-all"
                >
                    <Home className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Siteye Git</span>}
                </Link>
                <form action={logout}>
                    <button
                        type="submit"
                        title={collapsed ? 'Çıkış Yap' : undefined}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span>Çıkış Yap</span>}
                    </button>
                </form>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs text-[var(--viktor-slate)] hover:text-foreground hover:bg-[var(--viktor-bg)] transition-all mt-2"
                >
                    {collapsed ? (
                        <ChevronRight className="w-4 h-4 flex-shrink-0 mx-auto" />
                    ) : (
                        <>
                            <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                            <span>Daralt</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}
