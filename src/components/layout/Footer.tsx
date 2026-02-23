'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Terminal, Facebook, Twitter, Linkedin, Instagram, MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
    const pathname = usePathname();

    // Hide footer on admin and login pages
    if (pathname.startsWith('/admin') || pathname.startsWith('/login')) return null;

    return (
        <footer className="bg-[var(--viktor-bg)] border-t border-[var(--viktor-border)] text-[var(--foreground)] dark:text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-[var(--viktor-blue)] rounded-sm flex items-center justify-center text-black font-bold">
                                <Terminal className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold tracking-tighter leading-none">VIKTOR</span>
                                <span className="text-[10px] font-mono text-[var(--viktor-blue)] tracking-widest leading-none">SYSTEMS</span>
                            </div>
                        </Link>
                        <p className="text-[var(--viktor-slate)] text-sm leading-relaxed">
                            Konut, ticari ve endüstriyel yapılar için uçtan uca otomasyon, güvenlik ve ağ altyapısı çözümleri.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                                <a key={i} href="#" className="w-8 h-8 rounded-sm bg-[var(--viktor-surface)] flex items-center justify-center text-[var(--viktor-slate)] hover:bg-[var(--viktor-blue)] hover:text-white transition-colors">
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-[var(--foreground)] dark:text-white">Hızlı Erişim</h4>
                        <ul className="space-y-3">
                            {[
                                { label: 'Ana Sayfa', href: '/' },
                                { label: 'Kurumsal', href: '/kurumsal' },
                                { label: 'Çözümler', href: '/cozumler' },
                                { label: 'Referanslar', href: '/referanslar' },
                                { label: 'İletişim', href: '/iletisim' },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-[var(--viktor-slate)] hover:text-[var(--viktor-blue)] transition-colors text-sm">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-[var(--foreground)] dark:text-white">Hizmetlerimiz</h4>
                        <ul className="space-y-3">
                            {[
                                'Akıllı Ev Otomasyonu (KNX)',
                                'Otel Odası Yönetimi (GRMS)',
                                'Aydınlatma Kontrol (DALI)',
                                'Zayıf Akım Sistemleri',
                                'IP CCTV & Güvenlik',
                                'Yapısal Kablolama & Ağ'
                            ].map((item, i) => (
                                <li key={i} className="text-[var(--viktor-slate)] text-sm flex items-center gap-2">
                                    <span className="w-1 h-1 bg-[var(--viktor-blue)] rounded-full" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-[var(--foreground)] dark:text-white">İletişim</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-[var(--viktor-slate)] text-sm">
                                <MapPin className="w-5 h-5 text-[var(--viktor-blue)] flex-shrink-0" />
                                <span>Teknopark Bulvarı No:1/1A<br />Pendik / İstanbul</span>
                            </li>
                            <li className="flex items-center gap-3 text-[var(--viktor-slate)] text-sm">
                                <Phone className="w-5 h-5 text-[var(--viktor-blue)] flex-shrink-0" />
                                <span>+90 (216) 555 01 23</span>
                            </li>
                            <li className="flex items-center gap-3 text-[var(--viktor-slate)] text-sm">
                                <Mail className="w-5 h-5 text-[var(--viktor-blue)] flex-shrink-0" />
                                <span>info@viktor.com.tr</span>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-[var(--viktor-border)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[var(--viktor-slate)] font-mono">
                    <p>© 2026 VIKTOR SYSTEMS. Tüm hakları saklıdır.</p>
                    <div className="flex gap-6">
                        <Link href="/admin" className="hover:text-[var(--viktor-blue)] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--viktor-blue)]"></span>
                            Sistem Girişi
                        </Link>
                        <Link href="#" className="hover:text-[var(--viktor-blue)]">Gizlilik Politikası</Link>
                        <Link href="#" className="hover:text-[var(--viktor-blue)]">KVKK Aydınlatma Metni</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
