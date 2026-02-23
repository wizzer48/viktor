import { getProduct } from '@/app/actions/product';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Download, Tag, Layers, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddToQuoteButton } from '@/components/quote/AddToQuoteButton';

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
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalog
                </Link>
            </div>

            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Image Gallery */}
                <div className="space-y-4">
                    <div className="relative aspect-square bg-[var(--viktor-surface)] border border-[var(--viktor-border)] rounded-sm overflow-hidden p-8">
                        <div className="absolute top-4 left-4 z-10">
                            <span className="px-3 py-1 bg-[var(--viktor-blue)] text-white text-xs font-bold uppercase tracking-widest rounded-sm shadow-lg shadow-[var(--viktor-blue)]/20">
                                {product.brand}
                            </span>
                        </div>
                        <Image
                            src={images[0]}
                            alt={product.name}
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    {images.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">
                            {images.map((img, i) => (
                                <div key={i} className="relative aspect-square bg-[var(--viktor-surface)] border border-[var(--viktor-border)] rounded-sm overflow-hidden cursor-pointer hover:border-[var(--viktor-blue)] transition-colors">
                                    <Image src={img} alt={`${product.name} ${i}`} fill className="object-contain p-2" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Info */}
                <div className="space-y-8 animate-in slide-in-from-right duration-500">
                    <div>
                        <div className="text-[var(--viktor-blue)] text-sm font-mono font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Tag className="w-4 h-4" /> {product.category}
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
                            {product.name}
                        </h1>
                        <div
                            className="text-[var(--viktor-slate)] leading-relaxed prose prose-sm max-w-none [&_p]:mb-2 [&_strong]:text-foreground [&_strong]:font-bold [&_p:empty]:hidden [&_br]:hidden"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    </div>

                    {product.specs && Object.keys(product.specs).length > 0 && (
                        <div className="bg-[var(--viktor-surface)] border border-[var(--viktor-border)] rounded-sm p-6">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-[var(--viktor-blue)]" /> Technical Specifications
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                {Object.entries(product.specs).map(([key, val]) => (
                                    <div key={key} className="flex justify-between border-b border-[var(--viktor-border)]/50 py-2 text-sm">
                                        <span className="text-[var(--viktor-slate)]">{key}</span>
                                        <span className="text-white font-mono">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        <AddToQuoteButton product={product} className="w-full h-14 text-lg font-bold tracking-widest uppercase bg-[var(--viktor-blue)] hover:bg-[#0090ad] text-white border-none" />

                        {product.datasheetPath && (
                            <a href={product.datasheetPath} target="_blank" rel="noopener noreferrer" className="w-full">
                                <Button className="w-full bg-transparent border border-[var(--viktor-border)] text-[var(--viktor-slate)] hover:border-[var(--viktor-blue)] hover:text-[var(--viktor-blue)] h-12 transition-colors">
                                    <Download className="w-4 h-4 mr-2" /> Download Datasheet (PDF)
                                </Button>
                            </a>
                        )}
                        <div className="flex items-center gap-2 text-xs text-green-400 font-mono">
                            <CheckCircle className="w-3 h-3" /> In Stock / Available for Order
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
