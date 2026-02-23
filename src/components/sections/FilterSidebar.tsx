'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';

interface FilterSidebarProps {
    brands: string[];
    categories: string[];
}

export function FilterSidebar({ brands, categories }: FilterSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Init state from URL
    const [selectedBrands, setSelectedBrands] = useState<string[]>(
        searchParams.getAll('brand')
    );
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        searchParams.getAll('category')
    );

    // Sync State with URL changes (Back/Forward nav)
    useEffect(() => {
        setSelectedBrands(searchParams.getAll('brand'));
        setSelectedCategories(searchParams.getAll('category'));
    }, [searchParams]);

    const updateFilters = useCallback((newBrands: string[], newCategories: string[]) => {
        const params = new URLSearchParams();

        newBrands.forEach(b => params.append('brand', b));
        newCategories.forEach(c => params.append('category', c));

        router.push(`/urunler?${params.toString()}`, { scroll: false });
    }, [router]);

    const toggleBrand = (brand: string) => {
        const newBrands = selectedBrands.includes(brand)
            ? selectedBrands.filter(b => b !== brand)
            : [...selectedBrands, brand];

        setSelectedBrands(newBrands);
        updateFilters(newBrands, selectedCategories);
    };

    const toggleCategory = (cat: string) => {
        const newCats = selectedCategories.includes(cat)
            ? selectedCategories.filter(c => c !== cat)
            : [...selectedCategories, cat];

        setSelectedCategories(newCats);
        updateFilters(selectedBrands, newCats);
    };

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--viktor-border)]">
                <h3 className="text-lg font-bold text-foreground tracking-wide uppercase">Filters</h3>
                <button
                    onClick={() => {
                        setSelectedBrands([]);
                        setSelectedCategories([]);
                        router.push('/urunler', { scroll: false });
                    }}
                    className="text-xs text-[var(--viktor-blue)] hover:text-foreground transition-colors"
                >
                    RESET
                </button>
            </div>

            <Accordion.Root type="multiple" defaultValue={['brands', 'categories']} className="space-y-4">

                {/* Brand Filter */}
                <Accordion.Item value="brands" className="border-b border-[var(--viktor-border)] pb-4">
                    <Accordion.Header>
                        <Accordion.Trigger className="flex items-center justify-between w-full py-2 text-sm font-medium text-[var(--viktor-slate)] hover:text-foreground transition-colors group">
                            <span>BRAND</span>
                            <ChevronDown className="w-4 h-4 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                        </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="pt-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
                        {brands.map((b) => (
                            <label key={b} className="flex items-center gap-3 cursor-pointer group/item hover:bg-white/5 p-1 rounded-sm transition-colors">
                                <div className={cn(
                                    "w-4 h-4 border rounded-sm flex items-center justify-center transition-colors",
                                    selectedBrands.includes(b)
                                        ? "bg-[var(--viktor-blue)] border-[var(--viktor-blue)] text-black"
                                        : "border-[var(--viktor-slate)] group-hover/item:border-[var(--viktor-blue)]"
                                )}>
                                    {selectedBrands.includes(b) && <Check className="w-3 h-3" strokeWidth={3} />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={selectedBrands.includes(b)}
                                    onChange={() => toggleBrand(b)}
                                />
                                <span className={cn(
                                    "text-sm font-light transition-colors",
                                    selectedBrands.includes(b) ? "text-foreground font-medium" : "text-[var(--viktor-slate)]"
                                )}>
                                    {b}
                                </span>
                            </label>
                        ))}
                    </Accordion.Content>
                </Accordion.Item>

                {/* Category Filter */}
                <Accordion.Item value="categories" className="border-b border-[var(--viktor-border)] pb-4">
                    <Accordion.Header>
                        <Accordion.Trigger className="flex items-center justify-between w-full py-2 text-sm font-medium text-[var(--viktor-slate)] hover:text-foreground transition-colors group">
                            <span>CATEGORY</span>
                            <ChevronDown className="w-4 h-4 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                        </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="pt-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
                        {categories.map((c) => (
                            <label key={c} className="flex items-center gap-3 cursor-pointer group/item hover:bg-white/5 p-1 rounded-sm transition-colors">
                                <div className={cn(
                                    "w-4 h-4 border rounded-sm flex items-center justify-center transition-colors",
                                    selectedCategories.includes(c)
                                        ? "bg-[var(--viktor-blue)] border-[var(--viktor-blue)] text-black"
                                        : "border-[var(--viktor-slate)] group-hover/item:border-[var(--viktor-blue)]"
                                )}>
                                    {selectedCategories.includes(c) && <Check className="w-3 h-3" strokeWidth={3} />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={selectedCategories.includes(c)}
                                    onChange={() => toggleCategory(c)}
                                />
                                <span className={cn(
                                    "text-sm font-light transition-colors",
                                    selectedCategories.includes(c) ? "text-foreground font-medium" : "text-[var(--viktor-slate)]"
                                )}>
                                    {c}
                                </span>
                            </label>
                        ))}
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion.Root>
        </div>
    );
}
