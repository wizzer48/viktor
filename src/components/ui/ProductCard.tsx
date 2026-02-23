'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/scraper/types';
import { ArrowUpRight } from 'lucide-react';
import { AddToQuoteButton } from '@/components/quote/AddToQuoteButton';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="group relative bg-[var(--viktor-surface)] border border-[var(--viktor-border)] hover:border-[var(--viktor-blue)] transition-colors duration-300 rounded-sm overflow-hidden flex flex-col h-full">
            {/* Image Container */}
            <div className="relative aspect-square w-full bg-white/5 p-4 overflow-hidden">
                <div className="absolute top-2 right-2 z-10">
                    <span className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--viktor-blue)] text-white/90 rounded-sm shadow-lg shadow-[var(--viktor-blue)]/20">
                        {product.brand}
                    </span>
                </div>

                <div className="relative w-full h-full">
                    <Image
                        src={product.imagePath}
                        alt={product.name}
                        fill
                        className="object-contain transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>

                {/* Overlay on Hover (Desktop) */}
                <div className="hidden md:flex absolute inset-0 bg-[var(--viktor-bg)]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center backdrop-blur-sm">
                    <Link
                        href={`/urunler/${product.id}`}
                        className="px-6 py-2 bg-[var(--viktor-blue)] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#0090ad] transition-colors flex items-center gap-2"
                    >
                        İncele <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-2 flex-grow">
                <div className="flex justify-between items-start">
                    <div className="text-[10px] uppercase tracking-wider text-[var(--viktor-slate)] font-mono">
                        {product.category}
                    </div>
                </div>
                <h3 className="text-foreground dark:text-white font-medium text-sm leading-snug line-clamp-2 group-hover:text-[var(--viktor-blue)] transition-colors mb-2">
                    {product.name}
                </h3>

                <div className="mt-auto pt-2 flex items-center justify-between">
                    {/* Mobile Only Link */}
                    <Link
                        href={`/urunler/${product.id}`}
                        className="text-xs font-bold text-[var(--viktor-blue)] flex items-center gap-1 uppercase tracking-wider hover:underline"
                    >
                        İNCELE <ArrowUpRight className="w-3 h-3" />
                    </Link>
                    <AddToQuoteButton product={product} size="sm" variant="ghost" className="h-8 px-2" showText={false} />
                </div>
            </div>
        </div>
    );
}
