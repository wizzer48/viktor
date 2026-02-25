'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Variant } from '@/lib/scraper/types';
import { cn } from '@/lib/utils'; // Assuming this utility exists

interface InteractiveGalleryProps {
    brand: string;
    productName: string;
    images: string[];
    variants?: Variant[];
}

export function InteractiveGallery({ brand, productName, images, variants }: InteractiveGalleryProps) {
    const defaultImage = images.length > 0 ? images[0] : '/placeholder.svg';
    const [activeImage, setActiveImage] = useState<string>(defaultImage);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

    // Group variants
    const groupedVariants = variants?.reduce((acc, variant) => {
        const group = variant.group || 'Standart Finishes';
        if (!acc[group]) acc[group] = [];
        acc[group].push(variant);
        return acc;
    }, {} as Record<string, Variant[]>) || {};

    const handleSwatchClick = (v: Variant) => {
        setSelectedVariant(v);
        if (v.image) {
            setActiveImage(v.image);
        }
    };

    const handleThumbClick = (img: string) => {
        setActiveImage(img);
        setSelectedVariant(null); // Deselect variant when looking at standard gallery
    };

    return (
        <div className="space-y-6">
            {/* Main Image */}
            <div className="relative aspect-square bg-[var(--viktor-surface)] border border-[var(--viktor-border)] rounded-sm overflow-hidden p-8 transition-all duration-300">
                <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 bg-[var(--viktor-blue)] text-white text-xs font-bold uppercase tracking-widest rounded-sm shadow-lg shadow-[var(--viktor-blue)]/20">
                        {brand}
                    </span>
                </div>
                {selectedVariant && (
                    <div className="absolute top-4 right-4 z-10 animate-fade-in text-right">
                        <span className="text-[10px] text-[var(--viktor-slate)] uppercase tracking-wider block mb-1">Seçili Varyant</span>
                        <span className="px-2 py-1 bg-black/50 backdrop-blur-md border border-[var(--viktor-border)] text-white text-xs font-mono rounded-sm shadow-lg">
                            {selectedVariant.name}
                        </span>
                    </div>
                )}

                <Image
                    key={activeImage} // Force re-mount for fade animation
                    src={activeImage}
                    alt={selectedVariant ? `${productName} - ${selectedVariant.name}` : productName}
                    fill
                    className="object-contain animate-fade-in"
                    priority
                />
            </div>

            {/* Premium Finishes (Variants) */}
            {variants && variants.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-[var(--viktor-border)]/50">
                    <h3 className="text-sm font-mono uppercase tracking-widest text-[var(--viktor-blue)] mb-2">Premium Finishes</h3>
                    {Object.entries(groupedVariants).map(([group, vars]) => (
                        <div key={group} className="space-y-2">
                            <h4 className="text-xs text-[var(--viktor-slate)] mb-1">{group}</h4>
                            <div className="flex flex-wrap gap-3">
                                {vars.map((v, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSwatchClick(v)}
                                        className={cn(
                                            "group relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 outline-none focus:ring-2 focus:ring-[var(--viktor-blue)] focus:ring-offset-2 focus:ring-offset-[var(--viktor-bg)]",
                                            selectedVariant?.name === v.name
                                                ? "border-white scale-110 shadow-[0_0_15px_var(--viktor-blue)]"
                                                : "border-transparent hover:border-gray-400 hover:scale-110"
                                        )}
                                        title={v.name}
                                    >
                                        <div
                                            className="w-full h-full rounded-full absolute inset-0 shadow-inner"
                                            style={{ backgroundColor: v.hex || '#333' }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Standard Image Gallery */}
            {images.length > 1 && (
                <div className="space-y-2 pt-4 border-t border-[var(--viktor-border)]/50">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--viktor-slate)] mb-2">Galeri</h3>
                    <div className="grid grid-cols-4 gap-4">
                        {images.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => handleThumbClick(img)}
                                className={cn(
                                    "relative aspect-square bg-[var(--viktor-surface)] border rounded-sm overflow-hidden cursor-pointer transition-all outline-none",
                                    activeImage === img && !selectedVariant
                                        ? "border-[var(--viktor-blue)] ring-1 ring-[var(--viktor-blue)]"
                                        : "border-[var(--viktor-border)] hover:border-gray-400 opacity-70 hover:opacity-100"
                                )}
                            >
                                <Image src={img} alt={`${productName} thumbnail ${i}`} fill className="object-contain p-2 pointer-events-none" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
