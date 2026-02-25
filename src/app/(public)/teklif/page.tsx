'use client';

import { useQuote } from '@/context/QuoteContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ArrowRight, Send, Plus, Minus } from 'lucide-react';
import { submitQuote } from '@/app/actions/quote';
import { useState } from 'react';

const initialState = {
    success: false,
    message: '',
    errors: {}
};

export default function QuotePage() {
    const { items, removeFromQuote, updateQuantity, clearQuote } = useQuote();
    // const [state, formAction] = useFormState(submitQuote, initialState); // Commented out until action exists
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<{ success: boolean, message: string } | null>(null);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Prepare data
        const formData = new FormData(e.currentTarget);
        const quoteItems = JSON.stringify(items.map(i => ({
            id: i.product.id,
            name: i.product.name,
            quantity: i.quantity,
            brand: i.product.brand
        })));
        formData.append('items', quoteItems);

        // Call Server Action (We will implement this next)
        try {
            const result = await submitQuote(initialState, formData);
            setSubmitResult(result);
            if (result.success) {
                clearQuote();
            }
        } catch {
            setSubmitResult({ success: false, message: 'Bir hata oluştu.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (items.length === 0 && !submitResult?.success) {
        return (
            <div className="min-h-screen bg-[var(--viktor-bg)] pt-32 pb-24 px-4">
                <div className="container mx-auto max-w-2xl text-center space-y-6">
                    <div className="w-24 h-24 bg-[var(--viktor-surface)] rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--viktor-slate)]">
                        <FileTextOff className="w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Teklif Sepetiniz Boş</h1>
                    <p className="text-[var(--viktor-slate)] text-lg">
                        Projeleriniz için ürün seçmeye kataloğumuzdan başlayabilirsiniz.
                    </p>
                    <Link href="/urunler">
                        <Button className="mt-8 bg-[var(--viktor-blue)] hover:bg-[#0090ad] text-white px-8 py-6 text-lg">
                            Ürünleri İncele <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (submitResult?.success) {
        return (
            <div className="min-h-screen bg-[var(--viktor-bg)] pt-32 pb-24 px-4">
                <div className="container mx-auto max-w-2xl text-center space-y-6 bg-[var(--viktor-surface)] p-12 rounded-sm border border-green-500/20 shadow-xl">
                    <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                        <Send className="w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Talebiniz Alındı!</h1>
                    <p className="text-[var(--viktor-slate)] text-lg">
                        Teklif isteğiniz başarıyla tarafımıza ulaştı. Satış ekibimiz en kısa sürede sizinle iletişime geçecektir.
                    </p>
                    <Link href="/">
                        <Button variant="outline" className="mt-8 border-[var(--viktor-border)] text-foreground hover:text-[var(--viktor-blue)]">
                            Anasayfaya Dön
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--viktor-bg)] pt-24 pb-24">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-foreground mb-12">Teklif İste</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[var(--viktor-surface)] border border-[var(--viktor-border)] rounded-sm overflow-hidden">
                            <div className="p-6 border-b border-[var(--viktor-border)] flex justify-between items-center">
                                <h2 className="font-bold text-lg text-foreground">Seçilen Ürünler ({items.length})</h2>
                                <button onClick={clearQuote} className="text-xs text-red-400 hover:text-red-500 hover:underline">
                                    Sepeti Temizle
                                </button>
                            </div>
                            <div className="divide-y divide-[var(--viktor-border)]">
                                {items.map((item) => (
                                    <div key={item.product.id} className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center group hover:bg-[var(--viktor-bg)]/50 transition-colors">
                                        <div className="relative w-20 h-20 bg-white rounded-sm border border-[var(--viktor-border)] flex-shrink-0">
                                            <Image
                                                src={item.product.imagePath}
                                                alt={item.product.name}
                                                fill
                                                className="object-contain p-2"
                                            />
                                        </div>

                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] uppercase font-bold text-[var(--viktor-blue)] bg-[var(--viktor-blue)]/10 px-2 py-0.5 rounded-full">
                                                    {item.product.brand}
                                                </span>
                                            </div>
                                            <h3 className="text-foreground font-medium text-sm sm:text-base leading-snug mb-1 truncate">
                                                {item.product.name}
                                            </h3>
                                            <p className="text-[10px] text-[var(--viktor-slate)] font-mono uppercase">
                                                #{item.product.id.slice(0, 8)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4 ml-auto">
                                            <div className="flex items-center border border-[var(--viktor-border)] rounded-sm bg-[var(--viktor-bg)]">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-[var(--viktor-slate)] hover:text-[var(--viktor-blue)] hover:bg-[var(--viktor-surface)] transition-colors"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-mono font-bold text-foreground">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-[var(--viktor-slate)] hover:text-[var(--viktor-blue)] hover:bg-[var(--viktor-surface)] transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeFromQuote(item.product.id)}
                                                className="text-[var(--viktor-slate)] hover:text-red-500 transition-colors p-2"
                                                title="Ürünü Çıkar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-[var(--viktor-surface)] border border-[var(--viktor-border)] p-8 rounded-sm sticky top-24">
                            <h2 className="font-bold text-lg text-foreground mb-6">Teklif Detayları</h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-mono uppercase font-bold text-[var(--viktor-slate)]">Ad Soyad</label>
                                    <Input name="name" required placeholder="Adınız Soyadınız" className="bg-[var(--viktor-bg)] border-[var(--viktor-border)]" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-mono uppercase font-bold text-[var(--viktor-slate)]">Firma Adı</label>
                                    <Input name="company" placeholder="Firma Adı (Opsiyonel)" className="bg-[var(--viktor-bg)] border-[var(--viktor-border)]" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-mono uppercase font-bold text-[var(--viktor-slate)]">E-Posta</label>
                                    <Input name="email" type="email" required placeholder="ornek@sirket.com" className="bg-[var(--viktor-bg)] border-[var(--viktor-border)]" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-mono uppercase font-bold text-[var(--viktor-slate)]">Telefon</label>
                                    <Input name="phone" type="tel" required placeholder="0555 555 55 55" className="bg-[var(--viktor-bg)] border-[var(--viktor-border)]" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-mono uppercase font-bold text-[var(--viktor-slate)]">Proje Notları</label>
                                    <Textarea name="notes" rows={4} placeholder="Proje detayları veya özel istekler..." className="bg-[var(--viktor-bg)] border-[var(--viktor-border)]" />
                                </div>

                                <Button type="submit" disabled={isSubmitting} className="w-full bg-[var(--viktor-blue)] hover:bg-[#0090ad] text-white font-bold h-12 mt-4 uppercase tracking-wider">
                                    {isSubmitting ? 'Gönderiliyor...' : 'Teklif İste'} <Send className="w-4 h-4 ml-2" />
                                </Button>

                                <p className="text-xs text-[var(--viktor-slate)] text-center mt-4 leading-relaxed">
                                    Bu form bir satın alma işlemi değildir. Temsilcimiz seçtiğiniz ürünler için size özel fiyat çalışması yapıp dönecektir.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FileTextOff({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m2 2 20 20" />
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 1.8 1.1" />
            <path d="M14 2v6h6" />
            <path d="M10 20h4" />
            <line x1="16.5" y1="13.5" x2="16.5" y2="13.51" />
            <line x1="12.5" y1="17.5" x2="12.5" y2="17.51" />
        </svg>
    )
}
