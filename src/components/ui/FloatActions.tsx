'use client';

import { Phone, MessageCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuote } from '@/context/QuoteContext';

export function FloatActions() {
    const { items } = useQuote();
    const pathname = usePathname();

    // Hide floating actions on admin and login pages
    if (pathname.startsWith('/admin') || pathname.startsWith('/login')) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
            {/* Quote Basket */}
            <Link
                href="/teklif"
                className="w-14 h-14 bg-[var(--viktor-blue)] rounded-full flex items-center justify-center text-white shadow-lg shadow-[var(--viktor-blue)]/30 hover:scale-110 transition-transform hover:shadow-[var(--viktor-blue)]/50 group relative"
            >
                {items.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-[var(--viktor-bg)] animate-in zoom-in">
                        {items.length}
                    </div>
                )}
                <div className="absolute right-full mr-4 bg-white text-black text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none">
                    Teklif Sepeti
                </div>
                <FileText className="w-6 h-6" />
            </Link>

            {/* WhatsApp */}
            <Link
                href="https://wa.me/905555555555" // TODO: Change to real WhatsApp number
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/30 hover:scale-110 transition-transform hover:shadow-green-500/50 group relative"
            >
                <div className="absolute right-full mr-4 bg-white text-black text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none">
                    WhatsApp Destek
                </div>
                <MessageCircle className="w-7 h-7" />
            </Link>

            {/* Phone */}
            <Link
                href="tel:+902165550123"
                className="w-14 h-14 bg-[var(--viktor-surface)] text-[var(--viktor-slate)] border border-[var(--viktor-border)] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform hover:text-[var(--viktor-blue)] hover:border-[var(--viktor-blue)] group relative"
            >
                <div className="absolute right-full mr-4 bg-white text-black text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none">
                    Bizi Arayın
                </div>
                <Phone className="w-6 h-6" />
            </Link>
        </div>
    );
}
