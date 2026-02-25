import { getDistinctBrands, getDistinctCategories } from '@/app/actions/product';
import { ProductForm } from '@/components/admin/ProductForm';

export default async function AddProductPage() {
    const brands = await getDistinctBrands();
    const categories = await getDistinctCategories();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">New Product Entry</h2>
                <div className="px-3 py-1 bg-[var(--viktor-surface)] border border-[var(--viktor-border)] text-xs font-mono text-[var(--viktor-slate)]">
                    MODE: CREATE
                </div>
            </div>

            <ProductForm mode="create" brands={brands} categories={categories} />
        </div>
    );
}
