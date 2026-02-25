import { getProduct } from '@/app/actions/product';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Download, Tag, Layers, CheckCircle, FileText, Check, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddToQuoteButton } from '@/components/quote/AddToQuoteButton';
import { InteractiveGallery } from '@/components/products/InteractiveGallery';

interface ProductDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        return {
            title: 'Ürün Bulunamadı | Viktor Systems',
            description: 'Aradığınız ürün kataloğumuzda bulunamadı.'
        };
    }

    return {
        title: `${product.name} | ${product.brand} | Viktor Systems`,
        description: product.description.replace(/<[^>]*>/g, '').substring(0, 160) + '...',
        openGraph: {
            title: `${product.name} - ${product.brand}`,
            description: product.description.replace(/<[^>]*>/g, '').substring(0, 160) + '...',
            images: product.images && product.images.length > 0 ? [product.images[0]] : [],
        }
    };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
    const { id } = await params; // Await params
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    // Handle Images
    const images = product.images && product.images.length > 0
        ? product.images
        : [product.imagePath];

    return (
        <div className="min-h-screen bg-[var(--viktor-bg)] pt-24 pb-12">
            <div className="container mx-auto px-4 mb-8">
                <Link href="/urunler" className="inline-flex items-center text-[var(--viktor-slate)] hover:text-white transition-colors text-sm font-mono uppercase tracking-wider">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Kataloğa Dön
                </Link>
            </div>

            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Interactive Gallery (Client Component) */}
                <InteractiveGallery
                    brand={product.brand}
                    productName={product.name}
                    images={images}
                    variants={product.variants}
                />

                {/* Right: Info */}
                <div className="space-y-8 animate-in slide-in-from-right duration-500">
                    <div>
                        <div className="text-[var(--viktor-blue)] text-sm font-mono font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Tag className="w-4 h-4" /> {product.category}
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4">
                            {product.name}
                        </h1>
                        <div
                            className="text-[var(--viktor-slate)] leading-relaxed prose prose-sm max-w-none [&_p]:mb-2 [&_strong]:text-foreground [&_strong]:font-bold [&_p:empty]:hidden [&_br]:hidden"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    </div>

                    {product.specs && Object.keys(product.specs).length > 0 && (
                        <div className="bg-[var(--viktor-surface)] border border-[var(--viktor-border)] rounded-sm p-6 mt-8">
                            <h3 className="text-foreground font-bold mb-4 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-[var(--viktor-blue)]" /> Teknik Özellikler
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                {Object.entries(product.specs).map(([key, val]) => (
                                    <div key={key} className="flex justify-between border-b border-[var(--viktor-border)]/50 py-2 text-sm">
                                        <span className="text-[var(--viktor-slate)]">{key}</span>
                                        <span className="text-foreground font-mono">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {product.features && product.features.length > 0 && (
                        <div className="bg-[var(--viktor-surface)] border border-[var(--viktor-border)] rounded-sm p-6 mt-8">
                            <h3 className="text-foreground font-bold mb-4 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-[var(--viktor-blue)]" /> Öne Çıkan Özellikler
                            </h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {product.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-[var(--viktor-slate)]">
                                        <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {product.downloads && product.downloads.length > 0 && (
                        <div className="bg-[var(--viktor-surface)] border border-[var(--viktor-border)] rounded-sm p-6 mt-8">
                            <h3 className="text-foreground font-bold mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[var(--viktor-blue)]" /> Dökümanlar ve Dosyalar
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {product.downloads.map((doc, idx) => (
                                    <a key={idx} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 border border-[var(--viktor-border)] rounded-sm hover:border-[var(--viktor-blue)] hover:bg-[var(--viktor-blue)]/5 transition-all group">
                                        <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center bg-[var(--viktor-bg)] group-hover:bg-[var(--viktor-blue)] transition-colors">
                                            <Download className="w-4 h-4 text-[var(--viktor-slate)] group-hover:text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-foreground group-hover:text-[var(--viktor-blue)] transition-colors line-clamp-1">{doc.title}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {product.videos && product.videos.length > 0 && (
                        <div className="bg-[var(--viktor-surface)] border border-[var(--viktor-border)] rounded-sm p-6 mt-8">
                            <h3 className="text-foreground font-bold mb-4 flex items-center gap-2">
                                <PlayCircle className="w-4 h-4 text-[var(--viktor-blue)]" /> Ürün Videoları
                            </h3>
                            <div className="flex flex-col gap-4">
                                {product.videos.map((vid, idx) => (
                                    <div key={idx} className="relative w-full aspect-video rounded-sm overflow-hidden border border-[var(--viktor-border)]">
                                        <iframe
                                            src={vid}
                                            className="absolute top-0 left-0 w-full h-full"
                                            allowFullScreen
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-4 mt-8">
                        <AddToQuoteButton product={product} className="w-full h-14 text-lg font-bold tracking-widest uppercase bg-[var(--viktor-blue)] hover:bg-[#0090ad] text-white border-none" />

                        {product.datasheetPath && (
                            <a href={product.datasheetPath} target="_blank" rel="noopener noreferrer" className="w-full">
                                <Button className="w-full bg-transparent border border-[var(--viktor-border)] text-[var(--viktor-slate)] hover:border-[var(--viktor-blue)] hover:text-[var(--viktor-blue)] h-12 transition-colors">
                                    <Download className="w-4 h-4 mr-2" /> Dökümanı İndir (PDF)
                                </Button>
                            </a>
                        )}
                        <div className="flex items-center gap-2 text-xs text-green-400 font-mono">
                            <CheckCircle className="w-3 h-3" /> Stokta / Siparişe Uygun
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
