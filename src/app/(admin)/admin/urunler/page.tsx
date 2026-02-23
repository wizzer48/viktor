import { getProducts } from '@/app/actions/product';
import { deleteProduct } from '@/app/actions/product';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, ArrowUpRight, Plus, Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteButton } from '@/components/admin/DeleteButton';

export default async function AdminProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; brand?: string; category?: string }>;
}) {
    const products = await getProducts();
    const params = await searchParams;
    const query = params.q?.toLowerCase() || '';
    const brandFilter = params.brand || '';
    const categoryFilter = params.category || '';

    // Derive unique brands and categories for filters
    const brands = [...new Set(products.map(p => p.brand))].sort();
    const categories = [...new Set(products.map(p => p.category))].sort();

    // Apply filters
    const filtered = products.filter(p => {
        const matchesQuery = !query || p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query);
        const matchesBrand = !brandFilter || p.brand === brandFilter;
        const matchesCategory = !categoryFilter || p.category === categoryFilter;
        return matchesQuery && matchesBrand && matchesCategory;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-foreground">Ürün Yönetimi</h2>
                    <p className="text-[var(--viktor-slate)]">Toplam {products.length} ürün • {filtered.length} gösteriliyor</p>
                </div>
                <Link href="/admin/ekle">
                    <Button className="bg-[var(--viktor-blue)] hover:bg-[#0090ad] text-white">
                        <Plus className="w-4 h-4 mr-2" /> Yeni Ürün Ekle
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-[var(--viktor-surface)] border border-[var(--viktor-border)] p-4 rounded-lg">
                <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--viktor-slate)]" />
                        <input
                            type="text"
                            name="q"
                            defaultValue={query}
                            placeholder="Ürün adı veya marka ara..."
                            className="w-full pl-10 pr-4 py-2.5 bg-[var(--viktor-bg)] border border-[var(--viktor-border)] text-foreground text-sm rounded-lg focus:border-[var(--viktor-blue)] outline-none"
                        />
                    </div>
                    {/* Brand Filter */}
                    <select
                        name="brand"
                        defaultValue={brandFilter}
                        className="bg-[var(--viktor-bg)] border border-[var(--viktor-border)] text-foreground p-2.5 text-sm rounded-lg focus:border-[var(--viktor-blue)] outline-none"
                    >
                        <option value="">Tüm Markalar</option>
                        {brands.map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                    {/* Category Filter */}
                    <select
                        name="category"
                        defaultValue={categoryFilter}
                        className="bg-[var(--viktor-bg)] border border-[var(--viktor-border)] text-foreground p-2.5 text-sm rounded-lg focus:border-[var(--viktor-blue)] outline-none"
                    >
                        <option value="">Tüm Kategoriler</option>
                        {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <Button type="submit" variant="outline" className="border-[var(--viktor-blue)] text-[var(--viktor-blue)] hover:bg-[var(--viktor-blue)] hover:text-white md:col-span-4 md:w-fit md:ml-auto">
                        Filtrele
                    </Button>
                </form>
            </div>

            {/* Products Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                    <Package className="w-12 h-12 text-[var(--viktor-slate)] mx-auto" />
                    <p className="text-[var(--viktor-slate)]">Eşleşen ürün bulunamadı.</p>
                </div>
            ) : (
                <div className="bg-[var(--viktor-surface)] border border-[var(--viktor-border)] rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--viktor-bg)] border-b border-[var(--viktor-border)]">
                            <tr>
                                <th className="p-4 font-mono text-xs text-[var(--viktor-slate)] uppercase">Görsel</th>
                                <th className="p-4 font-mono text-xs text-[var(--viktor-slate)] uppercase">Ürün Adı</th>
                                <th className="p-4 font-mono text-xs text-[var(--viktor-slate)] uppercase">Marka</th>
                                <th className="p-4 font-mono text-xs text-[var(--viktor-slate)] uppercase">Kategori</th>
                                <th className="p-4 font-mono text-xs text-[var(--viktor-slate)] uppercase text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--viktor-border)]">
                            {filtered.map((product) => (
                                <tr key={product.id} className="hover:bg-[var(--viktor-blue)]/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="relative w-12 h-12 bg-[var(--viktor-bg)] rounded-lg overflow-hidden border border-[var(--viktor-border)]">
                                            <Image src={product.imagePath || product.images?.[0] || '/placeholder.svg'} alt="" fill className="object-cover" />
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-medium text-foreground">{product.name}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-[var(--viktor-blue)]/10 text-[var(--viktor-blue)] px-2.5 py-1 rounded-full text-xs font-medium">
                                            {product.brand}
                                        </span>
                                    </td>
                                    <td className="p-4 text-[var(--viktor-slate)] text-xs">{product.category}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link href={`/urunler/${product.id}`} target="_blank">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-[var(--viktor-slate)] hover:text-foreground">
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/admin/duzenle/${product.id}`}>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-[var(--viktor-blue)] hover:bg-[var(--viktor-blue)]/10">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <DeleteButton id={product.id} action={deleteProduct} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
