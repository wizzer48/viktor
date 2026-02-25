import { getProducts } from '@/app/actions/product';
import { BulkEditTable } from '@/components/admin/BulkEditTable';
import { Layers } from 'lucide-react';

export default async function BulkEditPage() {
    const products = await getProducts();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
                    <Layers className="w-8 h-8 text-[var(--viktor-blue)]" />
                    Toplu Ürün Düzenleme
                </h2>
                <p className="text-[var(--viktor-slate)] mt-2">
                    Tüm ürünlerinizin marka veya kategorilerini tek bir sayfadan hızlıca düzenleyip kaydedin.
                </p>
            </div>

            <BulkEditTable initialProducts={products} />
        </div>
    );
}
