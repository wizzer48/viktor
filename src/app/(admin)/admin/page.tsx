import { getProducts } from '@/app/actions/product';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, Plus, ArrowUpRight, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { deleteProduct } from '@/app/actions/product';

export default async function AdminDashboardPage() {
    const products = await getProducts();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
                    <p className="text-[var(--viktor-slate)]">Manage catalog and content.</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/admin/referanslar">
                        <Button className="bg-[var(--viktor-surface)] border border-[var(--viktor-blue)] text-[var(--viktor-blue)] hover:bg-[var(--viktor-blue)] hover:text-white">
                            <FolderOpen className="w-4 h-4 mr-2" /> MANAGE PROJECTS
                        </Button>
                    </Link>
                    <Link href="/admin/ekle">
                        <Button className="bg-[var(--viktor-blue)] hover:bg-[#0090ad] text-white">
                            <Plus className="w-4 h-4 mr-2" /> ADD NEW PRODUCT
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[var(--viktor-surface)] border border-[var(--viktor-border)] p-6 rounded-sm">
                    <h3 className="text-xs font-mono text-[var(--viktor-slate)] uppercase">Total Products</h3>
                    <p className="text-4xl font-bold text-foreground mt-2">{products.length}</p>
                </div>
                <div className="bg-[var(--viktor-surface)] border border-[var(--viktor-border)] p-6 rounded-sm">
                    <h3 className="text-xs font-mono text-[var(--viktor-slate)] uppercase">Brands</h3>
                    <p className="text-4xl font-bold text-foreground mt-2">{new Set(products.map(p => p.brand)).size}</p>
                </div>
                <div className="bg-[var(--viktor-surface)] border border-[var(--viktor-border)] p-6 rounded-sm">
                    <h3 className="text-xs font-mono text-[var(--viktor-slate)] uppercase">Categories</h3>
                    <p className="text-4xl font-bold text-foreground mt-2">{new Set(products.map(p => p.category)).size}</p>
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-[var(--viktor-surface)] border border-[var(--viktor-border)] rounded-sm overflow-hidden">
                <div className="p-4 border-b border-[var(--viktor-border)] flex justify-between items-center bg-[var(--viktor-bg)]">
                    <h3 className="font-bold text-foreground">Recent Products</h3>
                    <span className="text-xs text-[var(--viktor-slate)]">Latest entries</span>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--viktor-bg)] border-b border-[var(--viktor-border)]">
                        <tr>
                            <th className="p-4 font-mono text-[var(--viktor-slate)] uppercase">Image</th>
                            <th className="p-4 font-mono text-[var(--viktor-slate)] uppercase">Name</th>
                            <th className="p-4 font-mono text-[var(--viktor-slate)] uppercase">Brand</th>
                            <th className="p-4 font-mono text-[var(--viktor-slate)] uppercase">Category</th>
                            <th className="p-4 font-mono text-[var(--viktor-slate)] uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--viktor-border)]">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="relative w-12 h-12 bg-white/5 rounded-sm overflow-hidden">
                                        <Image src={product.imagePath || product.images?.[0] || '/placeholder.svg'} alt={product.name || "Ürün Görseli"} fill className="object-cover" />
                                    </div>
                                </td>
                                <td className="p-4 font-medium text-foreground">{product.name}</td>
                                <td className="p-4 text-[var(--viktor-slate)]">
                                    <span className="bg-[var(--viktor-bg)] border border-[var(--viktor-border)] px-2 py-1 rounded-sm text-xs">
                                        {product.brand}
                                    </span>
                                </td>
                                <td className="p-4 text-[var(--viktor-slate)]">{product.category}</td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
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
        </div>
    );
}
