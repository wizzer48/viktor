'use client';

import { useState, useRef } from 'react';
import { detectCategoryPages, collectPageUrls, scrapeSingleProduct } from '@/app/actions/bulk-scrape';
import { Brand } from '@/lib/scraper/types';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Download, AlertTriangle } from 'lucide-react';

interface Result {
    url: string;
    name: string;
    success: boolean;
    message: string;
}

export default function BulkImportPage() {
    const [categoryUrl, setCategoryUrl] = useState('');
    const [brand, setBrand] = useState<Brand>('Interra');
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [cookies, setCookies] = useState('');
    const [urls, setUrls] = useState<string[]>([]);
    const [results, setResults] = useState<Result[]>([]);
    const [phase, setPhase] = useState<'idle' | 'collecting' | 'scraping' | 'done'>('idle');
    const [current, setCurrent] = useState(0);
    const [total, setTotal] = useState(0);
    const [statusText, setStatusText] = useState('');
    const abortRef = useRef(false);

    const brands: Brand[] = ['Legrand', 'Interra', 'EAE', 'Core', 'Hager', 'Astrum', 'Bticino'];
    const categories = [
        'Akıllı Bina Otomasyonu',
        'Anahtar & Priz Grubu',
        'Güvenlik & İnterkom',
        'Ağ & Altyapı',
        'Otel Çözümleri',
    ];

    const parsedCookies = () => {
        if (!cookies.trim()) return undefined;
        try { return JSON.parse(cookies); } catch { return undefined; }
    };

    // STEP 1: Detect pages, then collect URLs page-by-page
    const handleCollect = async () => {
        if (!categoryUrl) return;
        setPhase('collecting');
        setUrls([]);
        setResults([]);
        setCurrent(0);
        abortRef.current = false;

        // Quick call: detect total pages + get page 1 URLs
        setStatusText('Sayfa sayısı tespit ediliyor...');
        const detection = await detectCategoryPages(categoryUrl, parsedCookies());
        if (!detection.success) {
            setPhase('idle');
            setStatusText('Hata: ' + detection.message);
            return;
        }

        const allUrls = new Set(detection.firstPageUrls);
        setTotal(detection.totalPages);
        setCurrent(1);
        setStatusText(`Sayfa 1/${detection.totalPages} tamamlandı (${allUrls.size} ürün)`);

        // Collect remaining pages one-by-one
        for (let p = 2; p <= detection.totalPages; p++) {
            if (abortRef.current) break;

            setStatusText(`Sayfa ${p}/${detection.totalPages} taranıyor...`);
            const pageResult = await collectPageUrls(categoryUrl, p, parsedCookies());
            if (pageResult.success) {
                pageResult.urls.forEach(u => allUrls.add(u));
            }
            setCurrent(p);
            setStatusText(`Sayfa ${p}/${detection.totalPages} tamamlandı (${allUrls.size} ürün)`);
        }

        const sortedUrls = [...allUrls].sort();
        setUrls(sortedUrls);
        setStatusText(`${detection.totalPages} sayfa tarandı, ${sortedUrls.length} ürün bulundu`);
        setPhase('idle');
    };

    // STEP 2: Import products one-by-one
    const handleStartImport = async () => {
        setPhase('scraping');
        setResults([]);
        setCurrent(0);
        setTotal(urls.length);
        abortRef.current = false;

        for (let i = 0; i < urls.length; i++) {
            if (abortRef.current) break;

            setCurrent(i + 1);
            setStatusText(`${i + 1}/${urls.length} import ediliyor...`);

            const result = await scrapeSingleProduct(urls[i], brand, parsedCookies(), category || undefined, subCategory || undefined);
            setResults(prev => [...prev, {
                url: urls[i],
                name: result.name,
                success: result.success,
                message: result.message
            }]);

            // Small delay between scrapes
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        setPhase('done');
    };

    const handleAbort = () => {
        abortRef.current = true;
        setPhase('done');
    };

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;


    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-3xl font-bold text-foreground">Toplu Ürün İçe Aktarma</h2>
                <p className="text-[var(--viktor-slate)]">Bir kategori URL&apos;si girin, tüm ürünler otomatik olarak import edilsin.</p>
            </div>

            {/* Step 1: Category URL */}
            <div className="bg-[var(--viktor-surface)] border border-[var(--viktor-border)] p-6 rounded-lg space-y-4">
                <h3 className="text-sm font-mono text-[var(--viktor-blue)] uppercase tracking-wider">
                    Adım 1: Kategori Sayfası
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-1">
                        <label className="text-xs text-[var(--viktor-slate)] block mb-1">Marka</label>
                        <select
                            value={brand}
                            onChange={(e) => setBrand(e.target.value as Brand)}
                            className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] text-foreground p-2.5 text-sm rounded-lg focus:border-[var(--viktor-blue)] outline-none"
                        >
                            {brands.map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs text-[var(--viktor-slate)] block mb-1">Hedef Kategori</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] text-foreground p-2.5 text-sm rounded-lg focus:border-[var(--viktor-blue)] outline-none"
                        >
                            <option value="">Otomatik Algıla</option>
                            {categories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-1">
                        <label className="text-xs text-[var(--viktor-slate)] block mb-1">Alt Kategori (Opsiyonel)</label>
                        <input
                            type="text"
                            value={subCategory}
                            onChange={(e) => setSubCategory(e.target.value)}
                            placeholder="Örn: Combo Aktuatörler"
                            className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] text-foreground p-2.5 text-sm rounded-lg focus:border-[var(--viktor-blue)] outline-none"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs text-[var(--viktor-slate)] block mb-1">Kategori URL</label>
                        <input
                            type="text"
                            value={categoryUrl}
                            onChange={(e) => setCategoryUrl(e.target.value)}
                            placeholder="https://interratechnology.com/tr/urunler/knx-sistem-cihazlari"
                            className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] text-foreground p-2.5 text-sm font-mono rounded-lg focus:border-[var(--viktor-blue)] outline-none"
                        />
                    </div>
                </div>

                {/* Cookie Upload */}
                <details className="group" suppressHydrationWarning>
                    <summary className="text-xs font-mono text-[var(--viktor-slate)] cursor-pointer hover:text-[var(--viktor-blue)]">
                        ▶ Cookie Enjeksiyonu (Opsiyonel)
                    </summary>
                    <div className="mt-2 space-y-2">
                        <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-[var(--viktor-border)] rounded-lg cursor-pointer hover:border-[var(--viktor-blue)] hover:bg-[var(--viktor-blue)]/5 transition-all">
                            <Download className="w-5 h-5 text-[var(--viktor-blue)]" />
                            <span className="text-sm text-foreground">JSON Cookie Dosyası Yükle</span>
                            <input
                                type="file"
                                accept=".json"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = (evt) => setCookies(evt.target?.result as string);
                                    reader.readAsText(file);
                                    e.target.value = '';
                                }}
                            />
                        </label>
                        {cookies && <span className="text-[10px] text-green-500 font-mono">✓ Cookie yüklendi</span>}
                    </div>
                </details>

                {/* Status text */}
                {statusText && phase === 'collecting' && (
                    <p className="text-xs font-mono text-[var(--viktor-blue)]">⏳ {statusText}</p>
                )}

                {/* Progress during collection */}
                {phase === 'collecting' && total > 0 && (
                    <div className="w-full h-2 bg-[var(--viktor-bg)] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[var(--viktor-blue)] transition-all duration-300 rounded-full"
                            style={{ width: `${Math.round((current / total) * 100)}%` }}
                        />
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleCollect}
                        disabled={!categoryUrl || phase === 'collecting' || phase === 'scraping'}
                        className="bg-[var(--viktor-blue)] text-white hover:bg-[#0090ad]"
                    >
                        {phase === 'collecting' ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Linkler Toplanıyor...</>
                        ) : (
                            'Ürün Linklerini Topla'
                        )}
                    </Button>
                    {phase === 'collecting' && (
                        <Button onClick={handleAbort} variant="ghost" size="sm" className="text-red-400">
                            İptal
                        </Button>
                    )}
                </div>

                {/* Result after collection */}
                {urls.length > 0 && phase === 'idle' && (
                    <p className="text-xs font-mono text-green-500">✓ {statusText}</p>
                )}
            </div>

            {/* Step 2: Review & Start */}
            {urls.length > 0 && (
                <div className="bg-[var(--viktor-surface)] border border-[var(--viktor-border)] p-6 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-mono text-[var(--viktor-blue)] uppercase tracking-wider">
                            Adım 2: Bulunan Ürünler ({urls.length})
                        </h3>
                        {phase === 'idle' && (
                            <Button
                                onClick={handleStartImport}
                                className="bg-green-600 text-white hover:bg-green-700"
                            >
                                <Download className="w-4 h-4 mr-2" /> Tümünü İçe Aktar
                            </Button>
                        )}
                        {phase === 'scraping' && (
                            <Button onClick={handleAbort} variant="destructive">
                                <AlertTriangle className="w-4 h-4 mr-2" /> Durdur
                            </Button>
                        )}
                    </div>

                    {/* Progress Bar */}
                    {(phase === 'scraping' || phase === 'done') && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-foreground">{current} / {urls.length}</span>
                                <span className="text-[var(--viktor-slate)]">{Math.round((current / urls.length) * 100)}%</span>
                            </div>
                            <div className="w-full h-3 bg-[var(--viktor-bg)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[var(--viktor-blue)] transition-all duration-300 rounded-full"
                                    style={{ width: `${Math.round((current / urls.length) * 100)}%` }}
                                />
                            </div>
                            <div className="flex items-center gap-4 text-xs font-mono">
                                <span className="text-green-500">✓ {successCount} başarılı</span>
                                {failCount > 0 && <span className="text-red-400">✗ {failCount} başarısız</span>}
                            </div>
                            {phase === 'scraping' && (
                                <p className="text-[10px] text-[var(--viktor-slate)] font-mono truncate">
                                    ⏳ {statusText}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Results List */}
                    <div className="max-h-64 overflow-y-auto space-y-1">
                        {results.map((r, i) => (
                            <div key={i} className={`flex items-center gap-2 text-xs font-mono px-3 py-2 rounded ${r.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                }`}>
                                {r.success ? <CheckCircle className="w-3 h-3 flex-shrink-0" /> : <XCircle className="w-3 h-3 flex-shrink-0" />}
                                <span className="truncate flex-1">{r.name || r.url.split('/').pop()}</span>
                                {!r.success && <span className="text-[10px] opacity-70">{r.message}</span>}
                            </div>
                        ))}
                        {phase === 'scraping' && (
                            <div className="flex items-center gap-2 text-xs font-mono px-3 py-2 text-[var(--viktor-blue)]">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span className="truncate">İşleniyor...</span>
                            </div>
                        )}
                    </div>

                    {/* URL Preview (collapsed) */}
                    {phase === 'idle' && (
                        <details>
                            <summary className="text-xs text-[var(--viktor-slate)] cursor-pointer hover:text-[var(--viktor-blue)]">
                                URL Listesini Göster
                            </summary>
                            <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                                {urls.map((url, i) => (
                                    <p key={i} className="text-[10px] font-mono text-[var(--viktor-slate)] truncate">
                                        {i + 1}. {url}
                                    </p>
                                ))}
                            </div>
                        </details>
                    )}
                </div>
            )}

            {/* Done Summary */}
            {phase === 'done' && (
                <div className={`p-6 border rounded-lg ${failCount === 0 ? 'border-green-500/50 bg-green-500/10' : 'border-yellow-500/50 bg-yellow-500/10'
                    }`}>
                    <h3 className="font-bold text-foreground mb-2">
                        {failCount === 0 ? '🎉 Toplu İçe Aktarma Tamamlandı!' : '⚠️ İçe Aktarma Tamamlandı (Hatalar Var)'}
                    </h3>
                    <p className="text-sm text-[var(--viktor-slate)]">
                        {successCount} ürün başarıyla eklendi{failCount > 0 ? `, ${failCount} üründe hata oluştu` : ''}.
                    </p>
                </div>
            )}
        </div>
    );
}
