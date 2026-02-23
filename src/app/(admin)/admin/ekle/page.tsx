import { ProductForm } from '@/components/admin/ProductForm';

export default function AddProductPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">New Product Entry</h2>
                <div className="px-3 py-1 bg-[var(--viktor-surface)] border border-[var(--viktor-border)] text-xs font-mono text-[var(--viktor-slate)]">
                    MODE: CREATE
                </div>
            </div>

            <ProductForm mode="create" />
        </div>
    );
}
