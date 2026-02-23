import { MapPin, Calendar } from 'lucide-react';
import { getProjects } from '@/app/actions/project';
import Image from 'next/image';

export const revalidate = 0; // Ensure fresh data on each visit

export default async function ReferencesPage() {
    const projects = await getProjects();

    return (
        <div className="min-h-screen bg-[var(--viktor-bg)] pt-20">
            <section className="bg-[var(--viktor-surface)] border-b border-[var(--viktor-border)] py-20">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Referans <span className="text-[var(--viktor-navy)] dark:text-[var(--viktor-blue)]">Projelerimiz</span></h1>
                    <p className="text-[var(--viktor-slate)] text-lg max-w-2xl">
                        Türkiye genelinde başarıyla tamamladığımız, mühendislik gerektiren zorlu projelerden seçkiler.
                    </p>
                </div>
            </section>

            <section className="py-24 container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((proj) => (
                        <div key={proj.id} className="group relative bg-[var(--viktor-bg)] border border-[var(--viktor-border)] overflow-hidden rounded-sm hover:border-[var(--viktor-blue)] transition-all duration-300">
                            <div className="h-48 bg-[var(--viktor-surface)] relative overflow-hidden">
                                <Image
                                    src={proj.imagePath}
                                    alt={proj.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[var(--viktor-bg)] to-transparent z-10" />

                                <div className="absolute bottom-4 left-4 z-20">
                                    <h3 className="text-xl font-bold text-white group-hover:text-[var(--viktor-blue)] transition-colors">{proj.name}</h3>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center gap-4 text-xs font-mono text-[var(--viktor-slate)] mb-4">
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {proj.location}</span>
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {proj.year}</span>
                                </div>
                                <p className="text-[var(--viktor-slate)] text-sm mb-6 line-clamp-3">
                                    {proj.description}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {proj.tags.map(tag => (
                                        <span key={tag} className="text-[10px] uppercase font-bold px-2 py-1 bg-[var(--viktor-surface)] text-[var(--viktor-navy)] dark:text-[var(--viktor-blue)] rounded-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                    {projects.length === 0 && (
                        <div className="col-span-3 text-center text-[var(--viktor-slate)] py-12 border border-dashed border-[var(--viktor-border)]">
                            Projeler yükleniyor veya henüz eklenmedi.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
