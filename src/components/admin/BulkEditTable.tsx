'use client';

import { useState, useTransition } from 'react';
import { Product } from '@/lib/scraper/types';
import { updateBulkProducts } from '@/app/actions/product';
import { Save, Search, PlayCircle, Download, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import Image from 'next/image';

interface BulkEditTableProps {
    initialProducts: Product[];
}

export function BulkEditTable({ initialProducts }: BulkEditTableProps) {
    const [products, setProducts] = useState(initialProducts);
    const [searchQuery, setSearchQuery] = useState('');
    const [isPending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [batchBrand, setBatchBrand] = useState('');
    const [batchCategory, setBatchCategory] = useState('');

    // Extract unique brands and categories dynamically to feed the Combobox options 
    // This allows newly typed local values to instantly appear in other dropdowns.
    const liveBrands = Array.from(new Set(products.map(p => p.brand).filter(b => b.trim() !== ''))).sort();
    const liveCategories = Array.from(new Set(products.map(p => p.category).filter(c => c.trim() !== ''))).sort();

    // Filter local products based on search
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleAll = () => {
        if (selectedIds.size === filteredProducts.length && filteredProducts.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredProducts.map(p => p.id)));
        }
    };

    const toggleRow = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleApplyBatch = () => {
        setProducts(current =>
            current.map(p => {
                if (selectedIds.has(p.id)) {
                    return {
                        ...p,
                        brand: batchBrand || p.brand,
                        category: batchCategory || p.category
                    };
                }
                return p;
            })
        );
        setSelectedIds(new Set());
        setBatchBrand('');
        setBatchCategory('');
    };

    // We track edits inside local state immediately, allowing seamless mass-edits
    const handleUpdate = (id: string, field: 'brand' | 'category', value: string) => {
        setProducts(current =>
            current.map(p => p.id === id ? { ...p, [field]: value } : p)
        );
    };

    const handleSaveAll = async () => {
        setFeedback(null);
        startTransition(async () => {
            // Find products that differ from initial list
            const updates = products.filter(p => {
                const initial = initialProducts.find(ip => ip.id === p.id);
                return initial && (initial.brand !== p.brand || initial.category !== p.category);
            }).map(p => ({
                id: p.id,
                brand: p.brand,
                category: p.category
            }));

            if (updates.length === 0) {
                setFeedback({ type: 'success', msg: 'Değişiklik yapılmadı.' });
                return;
            }

            const res = await updateBulkProducts(updates);
            if (res.success) {
                setFeedback({ type: 'success', msg: res.message });
            } else {
                setFeedback({ type: 'error', msg: res.message });
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--viktor-surface)] border border-[var(--viktor-border)] p-4 rounded-lg">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--viktor-slate)]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ürün adı, marka veya kategori ara..."
                        className="w-full pl-10 pr-4 py-2 bg-[var(--viktor-bg)] border border-[var(--viktor-border)] text-foreground text-sm rounded-lg focus:border-[var(--viktor-blue)] outline-none"
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {feedback && (
                        <span className={`text-sm font-medium ${feedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {feedback.msg}
                        </span>
                    )}
                    <Button
                        onClick={handleSaveAll}
                        disabled={isPending}
                        className="w-full md:w-auto bg-[var(--viktor-blue)] hover:bg-[#0090ad] text-white"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isPending ? 'Kaydediliyor...' : 'Tüm Değişiklikleri Kaydet'}
                    </Button>
                </div>
            </div>

            {selectedIds.size > 0 && (
                <div className="bg-[var(--viktor-blue)]/10 border border-[var(--viktor-blue)]/30 p-4 rounded-lg flex flex-col lg:flex-row gap-4 items-center justify-between animate-in fade-in zoom-in duration-200">
                    <div className="text-sm font-semibold text-[var(--viktor-blue)]">
                        {selectedIds.size} ürün seçildi
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
                        <div className="w-full md:w-48">
                            <Combobox
                                name="batchBrand"
                                options={liveBrands}
                                defaultValue={batchBrand}
                                placeholder="Marka (Değiştirme)"
                                onChange={setBatchBrand}
                            />
                        </div>
                        <div className="w-full md:w-64">
                            <Combobox
                                name="batchCategory"
                                options={liveCategories}
                                defaultValue={batchCategory}
                                placeholder="Kategori (Değiştirme)"
                                onChange={setBatchCategory}
                            />
                        </div>
                        <Button
                            onClick={handleApplyBatch}
                            variant="default"
                            className="w-full md:w-auto bg-[var(--viktor-blue)] text-white hover:bg-[#0090ad]"
                        >
                            Seçililere Uygula
                        </Button>
                    </div>
                </div>
            )}

            <div className="bg-[var(--viktor-surface)] border border-[var(--viktor-border)] rounded-lg overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[var(--viktor-bg)] border-b border-[var(--viktor-border)]">
                        <tr>
                            <th className="p-4 w-12 text-center">
                                <input
                                    type="checkbox"
                                    checked={filteredProducts.length > 0 && selectedIds.size === filteredProducts.length}
                                    onChange={toggleAll}
                                    className="w-4 h-4 rounded border-[var(--viktor-border)] bg-[var(--viktor-bg)] text-[var(--viktor-blue)] focus:ring-[var(--viktor-blue)] cursor-pointer"
                                />
                            </th>
                            <th className="p-4 font-mono text-xs text-[var(--viktor-slate)] uppercase w-16">Görsel</th>
                            <th className="p-4 font-mono text-xs text-[var(--viktor-slate)] uppercase min-w-[250px]">Ürün Adı</th>
                            <th className="p-4 font-mono text-xs text-[var(--viktor-slate)] uppercase w-24 text-center">Veri</th>
                            <th className="p-4 font-mono text-xs text-[var(--viktor-slate)] uppercase w-[250px]">Marka</th>
                            <th className="p-4 font-mono text-xs text-[var(--viktor-slate)] uppercase w-[300px]">Kategori</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--viktor-border)]">
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-[var(--viktor-blue)]/5 transition-colors">
                                <td className="p-4 text-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(product.id)}
                                        onChange={() => toggleRow(product.id)}
                                        className="w-4 h-4 rounded border-[var(--viktor-border)] bg-[var(--viktor-bg)] text-[var(--viktor-blue)] focus:ring-[var(--viktor-blue)] cursor-pointer"
                                    />
                                </td>
                                <td className="p-4">
                                    <div className="relative w-10 h-10 bg-[var(--viktor-bg)] rounded overflow-hidden border border-[var(--viktor-border)]">
                                        <Image src={product.imagePath || product.images?.[0] || '/placeholder.svg'} alt={product.name || "Ürün Görseli"} fill className="object-cover" />
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground truncate max-w-[300px]" title={product.name}>
                                            {product.name}
                                        </span>
                                        <span className="text-[10px] text-[var(--viktor-slate)] font-mono">{product.id.substring(0, 15)}...</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center gap-1.5">
                                        {/* Rich Data Indicators */}
                                        {product.features && product.features.length > 0 && (
                                            <div title="Özellikler Mevcut" className="w-6 h-6 rounded bg-[var(--viktor-surface)] border border-[var(--viktor-border)] flex items-center justify-center">
                                                <List className="w-3.5 h-3.5 text-green-400" />
                                            </div>
                                        )}
                                        {product.downloads && product.downloads.length > 0 && (
                                            <div title="Döküman Mevcut" className="w-6 h-6 rounded bg-[var(--viktor-surface)] border border-[var(--viktor-border)] flex items-center justify-center">
                                                <Download className="w-3.5 h-3.5 text-blue-400" />
                                            </div>
                                        )}
                                        {product.videos && product.videos.length > 0 && (
                                            <div title="Video Mevcut" className="w-6 h-6 rounded bg-[var(--viktor-surface)] border border-[var(--viktor-border)] flex items-center justify-center">
                                                <PlayCircle className="w-3.5 h-3.5 text-red-400" />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3">
                                    <Combobox
                                        name={`brand_${product.id}`}
                                        options={liveBrands}
                                        defaultValue={product.brand}
                                        placeholder="Marka"
                                        onChange={(v) => handleUpdate(product.id, 'brand', v)}
                                    />
                                </td>
                                <td className="p-3">
                                    <Combobox
                                        name={`category_${product.id}`}
                                        options={liveCategories}
                                        defaultValue={product.category}
                                        placeholder="Kategori"
                                        onChange={(v) => handleUpdate(product.id, 'category', v)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
