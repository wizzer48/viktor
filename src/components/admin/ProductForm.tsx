'use client';

import { useActionState } from 'react';
import { addProduct, updateProduct } from '@/app/actions/product';
import { useState, useRef } from 'react';
import { Upload, Plus, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product, Variant } from '@/lib/scraper/types';
import { Combobox } from '@/components/ui/combobox';
import Image from 'next/image';

interface ProductFormProps {
    mode: 'create' | 'update';
    initialData?: Product;
    brands: string[];
    categories: string[];
}

const initialState = {
    success: false,
    message: ''
};

export function ProductForm({ mode, initialData, brands, categories }: ProductFormProps) {
    const action = mode === 'create' ? addProduct : updateProduct;
    const [state, formAction, isPending] = useActionState(action, initialState);

    // State
    // Preserve existing specs silently
    const specsJson = JSON.stringify(initialData?.specs || {});

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



    // Features
    const [features, setFeatures] = useState<string[]>(initialData?.features || []);
    const addFeature = () => setFeatures([...features, '']);
    const removeFeature = (index: number) => {
        const newArr = [...features];
        newArr.splice(index, 1);
        setFeatures(newArr);
    };
    const updateFeature = (index: number, val: string) => {
        const newArr = [...features];
        newArr[index] = val;
        setFeatures(newArr);
    };

    // Downloads
    const [downloads, setDownloads] = useState<{ title: string, url: string }[]>(initialData?.downloads || []);
    const addDownload = () => setDownloads([...downloads, { title: '', url: '' }]);
    const removeDownload = (index: number) => {
        const newArr = [...downloads];
        newArr.splice(index, 1);
        setDownloads(newArr);
    };
    const updateDownload = (index: number, field: 'title' | 'url', val: string) => {
        const newArr = [...downloads];
        newArr[index][field] = val;
        setDownloads(newArr);
    };

    // Videos
    const [videos, setVideos] = useState<string[]>(initialData?.videos || []);
    const addVideo = () => setVideos([...videos, '']);
    const removeVideo = (index: number) => {
        const newArr = [...videos];
        newArr.splice(index, 1);
        setVideos(newArr);
    };
    const updateVideo = (index: number, val: string) => {
        const newArr = [...videos];
        newArr[index] = val;
        setVideos(newArr);
    };

    // Variants
    const [variants, setVariants] = useState<Variant[]>(initialData?.variants || []);
    const addVariant = () => setVariants([...variants, { group: '', name: '', hex: '', image: '' }]);
    const removeVariant = (index: number) => {
        const newArr = [...variants];
        newArr.splice(index, 1);
        setVariants(newArr);
    };
    const updateVariant = (index: number, field: 'group' | 'name' | 'hex' | 'image', val: string) => {
        const newArr = [...variants];
        newArr[index][field] = val;
        setVariants(newArr);
    };



    return (
        <form ref={formRef} action={formAction} className="space-y-8 bg-[var(--viktor-surface)] border border-[var(--viktor-border)] p-8 rounded-sm">

            {/* Feedback */}
            {state.message && (
                <div className={`p-4 border ${state.success ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-red-500/50 bg-red-500/10 text-red-400'} rounded-sm`}>
                    {state.message}
                </div>
            )}

            <input type="hidden" name="id" value={initialData?.id} />
            <input type="hidden" name="specs" value={specsJson} />

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-[var(--viktor-slate)]">Brand</label>
                    <Combobox
                        name="brand"
                        options={brands}
                        defaultValue={initialData?.brand}
                        placeholder="Select or Type Brand..."
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-[var(--viktor-slate)]">Category</label>
                    <Combobox
                        name="category"
                        options={categories}
                        defaultValue={initialData?.category}
                        placeholder="Select or Type Category..."
                        required
                    />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-xs font-mono uppercase text-[var(--viktor-slate)]">Product Name</label>
                    <input name="name" type="text" defaultValue={initialData?.name} required placeholder="Ex: KNX Smart Touch Panel 4''" className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-2 text-foreground outline-none focus:border-[var(--viktor-blue)]" />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-xs font-mono uppercase text-[var(--viktor-slate)]">Description</label>
                    <textarea name="description" defaultValue={initialData?.description} rows={4} className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-2 text-foreground outline-none focus:border-[var(--viktor-blue)]" />
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

            {/* Multi-fields Section */}
            <div className="grid grid-cols-1 gap-6 pt-6 border-t border-[var(--viktor-border)]">

                {/* Features */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-mono uppercase text-[var(--viktor-slate)]">Features (Bullet Points)</label>
                        <button type="button" onClick={addFeature} className="text-[var(--viktor-blue)] text-xs flex items-center gap-1 hover:underline">
                            <Plus className="w-3 h-3" /> Add Feature
                        </button>
                    </div>
                    <input type="hidden" name="features" value={JSON.stringify(features.filter(f => f.trim() !== ''))} />
                    <div className="space-y-2">
                        {features.map((feat, i) => (
                            <div key={`feat-${i}`} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Ex: Built-in temperature sensor"
                                    value={feat}
                                    onChange={(e) => updateFeature(i, e.target.value)}
                                    className="flex-1 bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-2 text-foreground text-sm outline-none focus:border-[var(--viktor-blue)]"
                                />
                                <button type="button" onClick={() => removeFeature(i)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-sm">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Downloads */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-mono uppercase text-[var(--viktor-slate)]">Downloads (PDFs/CAD)</label>
                        <button type="button" onClick={addDownload} className="text-[var(--viktor-blue)] text-xs flex items-center gap-1 hover:underline">
                            <Plus className="w-3 h-3" /> Add Download
                        </button>
                    </div>
                    <input type="hidden" name="downloads" value={JSON.stringify(downloads.filter(d => d.title.trim() && d.url.trim()))} />
                    <div className="space-y-2">
                        {downloads.map((doc, i) => (
                            <div key={`doc-${i}`} className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder="Doc Title (e.g. User Manual)"
                                    value={doc.title}
                                    onChange={(e) => updateDownload(i, 'title', e.target.value)}
                                    className="flex-1 bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-2 text-foreground text-sm outline-none focus:border-[var(--viktor-blue)]"
                                />
                                <input
                                    type="text"
                                    placeholder="URL (e.g. /uploads/manual.pdf)"
                                    value={doc.url}
                                    onChange={(e) => updateDownload(i, 'url', e.target.value)}
                                    className="flex-1 bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-2 text-foreground text-sm outline-none focus:border-[var(--viktor-blue)]"
                                />
                                <button type="button" onClick={() => removeDownload(i)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-sm shrink-0">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Videos */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-mono uppercase text-[var(--viktor-slate)]">Videos (YouTube Embed Links)</label>
                        <button type="button" onClick={addVideo} className="text-[var(--viktor-blue)] text-xs flex items-center gap-1 hover:underline">
                            <Plus className="w-3 h-3" /> Add Video
                        </button>
                    </div>
                    <input type="hidden" name="videos" value={JSON.stringify(videos.filter(v => v.trim() !== ''))} />
                    <div className="space-y-2">
                        {videos.map((vid, i) => (
                            <div key={`vid-${i}`} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Ex: https://www.youtube.com/embed/..."
                                    value={vid}
                                    onChange={(e) => updateVideo(i, e.target.value)}
                                    className="flex-1 bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-2 text-foreground text-sm outline-none focus:border-[var(--viktor-blue)]"
                                />
                                <button type="button" onClick={() => removeVideo(i)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-sm">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Variants */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-mono uppercase text-[var(--viktor-slate)]">Premium Varyantlar (Renk & Materyal)</label>
                        <button type="button" onClick={addVariant} className="text-[var(--viktor-blue)] text-xs flex items-center gap-1 hover:underline">
                            <Plus className="w-3 h-3" /> Varyant Ekle
                        </button>
                    </div>
                    <input type="hidden" name="variants" value={JSON.stringify(variants.filter(v => v.name.trim() !== ''))} />
                    <div className="space-y-4">
                        {variants.map((v, i) => (
                            <div key={`var-${i}`} className="flex flex-col sm:flex-row gap-2 border border-[var(--viktor-border)] p-4 bg-black/10 rounded-sm relative">
                                <button type="button" onClick={() => removeVariant(i)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-500/10 rounded-sm">
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full pr-8">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-500 uppercase">Grup (Örn: Brushed)</label>
                                        <input type="text" value={v.group || ''} onChange={(e) => updateVariant(i, 'group', e.target.value)} className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-2 text-sm focus:border-[var(--viktor-blue)] outline-none" placeholder="Brushed Finish" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-500 uppercase">İsim *</label>
                                        <input type="text" value={v.name || ''} onChange={(e) => updateVariant(i, 'name', e.target.value)} className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-2 text-sm focus:border-[var(--viktor-blue)] outline-none" placeholder="Brass" required />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-500 uppercase">Renk (Hex/CSS)</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={v.hex || '#000000'} onChange={(e) => updateVariant(i, 'hex', e.target.value)} className="w-8 h-8 rounded shrink-0 cursor-pointer bg-transparent border-none p-0" />
                                            <input type="text" value={v.hex || ''} onChange={(e) => updateVariant(i, 'hex', e.target.value)} className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-2 text-sm focus:border-[var(--viktor-blue)] outline-none font-mono" placeholder="#b5a36a" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-500 uppercase">Görsel URL</label>
                                        <input type="text" value={v.image || ''} onChange={(e) => updateVariant(i, 'image', e.target.value)} className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-2 text-sm focus:border-[var(--viktor-blue)] outline-none" placeholder="/uploads/ürün.jpg" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <Button type="submit" disabled={isPending} className="w-full bg-[var(--viktor-blue)] hover:bg-[#0090ad] text-white font-bold py-6 uppercase tracking-wider">
                <Save className="w-4 h-4 mr-2" /> {isPending ? 'Saving...' : (mode === 'create' ? 'Create Product' : 'Update Product')}
            </Button>
        </form>
    );
}
