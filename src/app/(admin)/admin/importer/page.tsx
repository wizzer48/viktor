'use client';

import { useState } from 'react';
import { scrapeProductAction } from '@/app/actions/scrape';
import { Brand, Product } from '@/lib/scraper/types';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ui/ProductCard';

export default function ImporterPage() {
    const [url, setUrl] = useState('');
    const [brand, setBrand] = useState<Brand>('Legrand');
    const [cookies, setCookies] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; data?: Product } | null>(null);

    const brands: Brand[] = ['Legrand', 'Interra', 'EAE', 'Core', 'Hager', 'Astrum', 'Bticino'];

    const handleScrape = async () => {
        if (!url) return;
        setLoading(true);
        setResult(null);

        try {
            let parsedCookies = undefined;
            if (cookies.trim()) {
                try {
                    parsedCookies = JSON.parse(cookies);
                } catch (e) {
                    setResult({ success: false, message: 'Invalid JSON Cookies format' });
                    setLoading(false);
                    return;
                }
            }
            const response = await scrapeProductAction(url, brand, parsedCookies);
            setResult(response);
        } catch {
            setResult({ success: false, message: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-[var(--viktor-blue)]">Product Importer (Universal Engine)</h1>
                <p className="text-[var(--viktor-slate)]">
                    Select a brand and paste the source URL to import product data, assets, and specs.
                </p>
            </div>

            <div className="bg-[var(--viktor-surface)] border border-[var(--viktor-border)] p-6 space-y-6 rounded-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1 space-y-2">
                        <label className="text-sm font-medium text-[var(--viktor-slate)]">Target Brand</label>
                        <select
                            value={brand}
                            onChange={(e) => setBrand(e.target.value as Brand)}
                            className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] text-white p-2 text-sm focus:border-[var(--viktor-blue)] outline-none"
                        >
                            {brands.map((b) => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-3 space-y-2">
                        <label className="text-sm font-medium text-[var(--viktor-slate)]">Source URL</label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/product-page..."
                            className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] text-white p-2 text-sm focus:border-[var(--viktor-blue)] outline-none font-mono"
                        />
                    </div>
                </div>

                {/* Advanced: Cookies */}
                <div className="pt-4 border-t border-[var(--viktor-border)]">
                    <details className="group">
                        <summary className="text-xs font-mono text-[var(--viktor-slate)] cursor-pointer hover:text-[var(--viktor-blue)] select-none">
                            ▶ ADVANCED: INJECT COOKIES (JSON)
                        </summary>
                        <div className="mt-3 space-y-3">
                            <p className="text-[10px] text-[var(--viktor-slate)]">Paste JSON or upload a <code>.json</code> file from &quot;Export Cookie JSON File&quot; extension to bypass bot detection.</p>

                            {/* File Upload */}
                            <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-[var(--viktor-border)] rounded-lg cursor-pointer hover:border-[var(--viktor-blue)] hover:bg-[var(--viktor-blue)]/5 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[var(--viktor-blue)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                <div>
                                    <span className="text-sm font-medium text-foreground">JSON Dosyası Yükle</span>
                                    <span className="text-[10px] text-[var(--viktor-slate)] block">.json uzantılı cookie dosyanızı seçin</span>
                                </div>
                                <input
                                    type="file"
                                    accept=".json,application/json"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = (evt) => {
                                            const text = evt.target?.result as string;
                                            setCookies(text);
                                        };
                                        reader.readAsText(file);
                                        e.target.value = ''; // Reset so same file can be re-uploaded
                                    }}
                                />
                            </label>

                            {/* Or paste manually */}
                            <textarea
                                value={cookies}
                                onChange={(e) => setCookies(e.target.value)}
                                placeholder='[{"name": "session", "value": "..."}]'
                                className="w-full h-24 bg-[var(--viktor-bg)] border border-[var(--viktor-border)] text-foreground p-2 text-xs font-mono focus:border-[var(--viktor-blue)] outline-none rounded-sm"
                            />
                            {cookies && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-green-500 font-mono">✓ {cookies.length} karakter yüklendi</span>
                                    <button onClick={() => setCookies('')} className="text-[10px] text-red-400 hover:text-red-300 font-mono">Temizle</button>
                                </div>
                            )}
                        </div>
                    </details>
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={handleScrape}
                        disabled={loading || !url}
                        className="bg-[var(--viktor-blue)] text-white hover:bg-[#0090ad]"
                    >
                        {loading ? 'PROCESSING...' : 'INITIATE SEQUENCE'}
                    </Button>
                </div>
            </div>

            {result && (
                <div className={`p-4 border ${result.success ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'} rounded-sm`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="font-mono font-bold text-sm tracking-wider uppercase">
                            {result.success ? 'SUCCESS' : 'FAILURE'}
                        </span>
                    </div>
                    <p className="font-mono text-xs opacity-80 mb-4">{result.message}</p>

                    {result.data && (
                        <div className="mt-6 border-t border-[var(--viktor-border)] pt-6">
                            <h3 className="text-sm font-bold text-[var(--viktor-slate)] mb-4 uppercase tracking-wider">Preview</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1 h-64">
                                    <ProductCard product={result.data} />
                                </div>
                                <div className="md:col-span-2 space-y-4 font-mono text-xs">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-2 border border-[var(--viktor-border)] bg-[var(--viktor-bg)]/50">
                                            <span className="text-[var(--viktor-slate)] block mb-1">Normalized Category</span>
                                            <span className="text-[var(--viktor-blue)]">{result.data.category}</span>
                                        </div>
                                        <div className="p-2 border border-[var(--viktor-border)] bg-[var(--viktor-bg)]/50">
                                            <span className="text-[var(--viktor-slate)] block mb-1">Local Asset Status</span>
                                            <span className={result.data.imagePath ? "text-green-400" : "text-red-400"}>
                                                IMG: {result.data.imagePath ? 'OK' : 'MISSING'} <br />
                                                PDF: {result.data.datasheetPath ? 'OK' : 'NONE'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-2 border border-[var(--viktor-border)] bg-[var(--viktor-bg)]/50">
                                        <span className="text-[var(--viktor-slate)] block mb-1">Raw Extracted Specs</span>
                                        <pre className="overflow-x-auto whitespace-pre-wrap text-[10px] text-gray-400">
                                            {JSON.stringify(result.data.specs, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
