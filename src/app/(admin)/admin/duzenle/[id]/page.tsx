import { getProduct } from '@/app/actions/product';
import { ProductForm } from '@/components/admin/ProductForm';
import { notFound } from 'next/navigation';

interface EditProductPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    const { id } = await params; // Await
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Edit Product</h2>
                <div className="px-3 py-1 bg-[var(--viktor-surface)] border border-[var(--viktor-border)] text-xs font-mono text-[var(--viktor-blue)]">
                    MODE: UPDATE :: {product.id.split('-')[0]}
                </div>
            </div>

            <ProductForm mode="update" initialData={product} />
        </div>
    );
}
