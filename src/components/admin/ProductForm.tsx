'use client';

import { useActionState } from 'react';
import { addProduct, updateProduct } from '@/app/actions/product';
import { useState, useRef } from 'react';
import { Upload, Plus, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import categoryMap from '@/data/category-map.json';
import { Product } from '@/lib/scraper/types';
import Image from 'next/image';

const BRANDS = ['Legrand', 'Interra', 'EAE', 'Core', 'Hager', 'Astrum', 'Bticino'];
const CATEGORIES = Object.keys(categoryMap.GlobalRules).sort();

interface ProductFormProps {
    mode: 'create' | 'update';
    initialData?: Product;
}

const initialState = {
    success: false,
    message: ''
};

export function ProductForm({ mode, initialData }: ProductFormProps) {
    const action = mode === 'create' ? addProduct : updateProduct;
    const [state, formAction, isPending] = useActionState(action, initialState);

    // State
    const [specs, setSpecs] = useState<{ key: string, value: string }[]>(
        initialData?.specs
            ? Object.entries(initialData.specs).map(([key, value]) => ({ key, value }))
            : [{ key: '', value: '' }]
    );

    // Image Previews (New uploads)
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    // Existing Images (from initialData)
    const [existingImages] = useState<string[]>(
        initialData?.images && initialData.images.length > 0
            ? initialData.images
            : (initialData?.imagePath ? [initialData.imagePath] : [])
    );

    const formRef = useRef<HTMLFormElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newPreviews: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const reader = new FileReader();
                reader.onloadend = () => {
                    newPreviews.push(reader.result as string);
                    if (newPreviews.length === files.length) {
                        setImagePreviews(prev => [...prev, ...newPreviews]);
                    }
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const addSpec = () => setSpecs([...specs, { key: '', value: '' }]);
    const removeSpec = (index: number) => {
        const newSpecs = [...specs];
        newSpecs.splice(index, 1);
        setSpecs(newSpecs);
    };
    const updateSpec = (index: number, field: 'key' | 'value', val: string) => {
        const newSpecs = [...specs];
        newSpecs[index][field] = val;
        setSpecs(newSpecs);
    };

    const specsJson = JSON.stringify(
        specs.reduce((acc, curr) => {
            if (curr.key && curr.value) acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>)
    );

    return (
        <form ref={formRef} action={formAction} className="space-y-8 bg-[var(--viktor-surface)] border border-[var(--viktor-border)] p-8 rounded-sm">

            {/* Feedback */}
            {state.message && (
                <div className={`p-4 border ${state.success ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-red-500/50 bg-red-500/10 text-red-400'} rounded-sm`}>
                    {state.message}
                </div>
            )}

            <input type="hidden" name="id" value={initialData?.id} />

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-[var(--viktor-slate)]">Brand</label>
                    <input
                        list="brands"
                        name="brand"
                        defaultValue={initialData?.brand}
                        required
                        className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-2 text-white outline-none focus:border-[var(--viktor-blue)]"
                        placeholder="Select or Type Brand..."
                    />
                    <datalist id="brands">
                        {BRANDS.map(b => <option key={b} value={b} />)}
                    </datalist>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-[var(--viktor-slate)]">Category</label>
                    <input
                        list="categories"
                        name="category"
                        defaultValue={initialData?.category}
                        required
                        className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-2 text-white outline-none focus:border-[var(--viktor-blue)]"
                        placeholder="Select or Type Category..."
                    />
                    <datalist id="categories">
                        {CATEGORIES.map(c => <option key={c} value={c} />)}
                    </datalist>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-xs font-mono uppercase text-[var(--viktor-slate)]">Product Name</label>
                    <input name="name" type="text" defaultValue={initialData?.name} required placeholder="Ex: KNX Smart Touch Panel 4''" className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-2 text-white outline-none focus:border-[var(--viktor-blue)]" />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-xs font-mono uppercase text-[var(--viktor-slate)]">Description</label>
                    <textarea name="description" defaultValue={initialData?.description} rows={4} className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-2 text-white outline-none focus:border-[var(--viktor-blue)]" />
                </div>
            </div>

            {/* Media */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[var(--viktor-border)]">
                <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-[var(--viktor-slate)]">Images (Multiple)</label>

                    {/* File Input */}
                    <div className="relative group cursor-pointer border-2 border-dashed border-[var(--viktor-border)] hover:border-[var(--viktor-blue)] bg-[var(--viktor-bg)] h-32 flex flex-col items-center justify-center transition-colors mb-4">
                        <input type="file" name="images" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <Upload className="w-6 h-6 text-[var(--viktor-slate)] mb-2" />
                        <span className="text-xs text-[var(--viktor-slate)]">Click to upload images</span>
                    </div>

                    {/* Previews Grid */}
                    <div className="grid grid-cols-4 gap-2">
                        {existingImages.map((src, i) => (
                            <div key={`exist-${i}`} className="relative aspect-square border border-[var(--viktor-border)] bg-black/20">
                                <Image src={src} alt="Existing" fill className="object-cover opacity-70" />
                                <div className="absolute top-0 right-0 bg-black/50 p-1">
                                    <span className="text-[8px] text-white">CURRENT</span>
                                </div>
                            </div>
                        ))}
                        {imagePreviews.map((src, i) => (
                            <div key={`new-${i}`} className="relative aspect-square border border-green-500/50">
                                <Image src={src} alt="New Upload Preview" fill className="object-cover" />
                                <div className="absolute top-0 right-0 bg-green-500 p-1">
                                    <span className="text-[8px] text-black font-bold">NEW</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-[var(--viktor-slate)]">Datasheet (PDF)</label>
                    <div className="relative group cursor-pointer border-2 border-dashed border-[var(--viktor-border)] hover:border-[var(--viktor-blue)] bg-[var(--viktor-bg)] h-32 flex flex-col items-center justify-center transition-colors">
                        <input type="file" name="datasheet" accept="application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" />
                        <Upload className="w-6 h-6 text-[var(--viktor-slate)] mb-2" />
                        <span className="text-xs text-[var(--viktor-slate)]">Click to upload PDF</span>
                    </div>
                    {initialData?.datasheetPath && (
                        <p className="text-xs text-[var(--viktor-blue)] mt-2">Current: {initialData.datasheetPath.split('/').pop()}</p>
                    )}
                </div>
            </div>

            {/* Spec Builder */}
            <div className="pt-6 border-t border-[var(--viktor-border)]">
                <div className="flex items-center justify-between mb-4">
                    <label className="text-xs font-mono uppercase text-[var(--viktor-slate)]">Technical Specifications</label>
                    <button type="button" onClick={addSpec} className="text-[var(--viktor-blue)] text-xs flex items-center gap-1 hover:underline">
                        <Plus className="w-3 h-3" /> Add Spec
                    </button>
                </div>

                <input type="hidden" name="specs" value={specsJson} />

                <div className="space-y-2">
                    {specs.map((spec, i) => (
                        <div key={i} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Key"
                                value={spec.key}
                                onChange={(e) => updateSpec(i, 'key', e.target.value)}
                                className="flex-1 bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-2 text-white text-sm outline-none focus:border-[var(--viktor-blue)]"
                            />
                            <input
                                type="text"
                                placeholder="Value"
                                value={spec.value}
                                onChange={(e) => updateSpec(i, 'value', e.target.value)}
                                className="flex-1 bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-2 text-white text-sm outline-none focus:border-[var(--viktor-blue)]"
                            />
                            <button type="button" onClick={() => removeSpec(i)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-sm">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <Button type="submit" disabled={isPending} className="w-full bg-[var(--viktor-blue)] hover:bg-[#0090ad] text-white font-bold py-6 uppercase tracking-wider">
                <Save className="w-4 h-4 mr-2" /> {isPending ? 'Saving...' : (mode === 'create' ? 'Create Product' : 'Update Product')}
            </Button>
        </form>
    );
}
