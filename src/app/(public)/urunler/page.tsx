import { getProducts } from '@/app/actions/product';
import { FilterSidebar } from '@/components/sections/FilterSidebar';
import { ProductCard } from '@/components/ui/ProductCard';


interface ProductsPageProps {
    searchParams: Promise<{
        brand?: string | string[];
        category?: string | string[];
    }>;
}

export const dynamic = 'force-dynamic';

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    const { brand, category } = await searchParams; // Await searchParams

    // 1. Fetch All Data
    const allProducts = await getProducts();

    // 2. Extract Unique Filters (for Sidebar)
    const brands = Array.from(new Set(allProducts.map((p) => p.brand))).sort();
    const categories = Array.from(new Set(allProducts.map((p) => p.category))).sort();

    // 3. Apply Filters (Server-Side)
    let filteredProducts = allProducts;

    // Handle Brand Filter
    const brandParams = typeof brand === 'string'
        ? [brand]
        : (brand || []);

    if (brandParams.length > 0) {
        filteredProducts = filteredProducts.filter(p => brandParams.includes(p.brand));
    }

    // Handle Category Filter
    const catParams = typeof category === 'string'
        ? [category]
        : (category || []);

    if (catParams.length > 0) {
        filteredProducts = filteredProducts.filter(p => catParams.includes(p.category));
    }

    return (
        <div className="min-h-screen bg-[var(--viktor-bg)] pt-24 pb-12">
            {/* Header */}
            <div className="container mx-auto px-4 mb-12">
                <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">
                    System <span className="text-[var(--viktor-navy)] dark:text-[var(--viktor-blue)]">Components</span>
                </h1>
                <p className="text-[var(--viktor-slate)] max-w-2xl">
                    Browse our comprehensive catalog of integrated automation hardware.
                    Use filters to narrow down by protocol, brand, or application.
                </p>
            </div>

            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar (25%) */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="sticky top-28">
                            <FilterSidebar brands={brands} categories={categories} />
                        </div>
                    </aside>

                    {/* Main Grid (75%) */}
                    <main className="flex-1">
                        {/* Results Count */}
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-sm text-[var(--viktor-slate)] font-mono">
                                SHOWING {filteredProducts.length} RESULTS
                            </span>
                            {/* Sort dropdown could go here */}
                        </div>

                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="h-[400px]">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[var(--viktor-border)] rounded-sm">
                                <p className="text-[var(--viktor-slate)] text-lg">No products match your criteria.</p>
                                <p className="text-sm text-[var(--viktor-slate)]/50 mt-2">Try adjusting the filters.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
