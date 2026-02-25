import { getProjects } from '@/app/actions/project';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { deleteProject } from '@/app/actions/project';

export default async function AdminProjectsPage() {
    const projects = await getProjects();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-foreground">Project References</h2>
                    <p className="text-[var(--viktor-slate)]">Manage site portfolio.</p>
                </div>
                <Link href="/admin/referanslar/ekle">
                    <Button className="bg-[var(--viktor-blue)] hover:bg-[#0090ad] text-white">
                        <Plus className="w-4 h-4 mr-2" /> ADD NEW PROJECT
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(proj => (
                    <div key={proj.id} className="bg-[var(--viktor-surface)] border border-[var(--viktor-border)] rounded-sm overflow-hidden group">
                        <div className="relative h-48">
                            <Image src={proj.imagePath} alt={proj.name} fill className="object-cover" />
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-foreground mb-1">{proj.name}</h3>
                            <p className="text-xs text-[var(--viktor-slate)] mb-4">{proj.location} • {proj.year}</p>
                            <div className="flex gap-2">
                                <Link href={`/admin/referanslar/duzenle/${proj.id}`} className="flex-1">
                                    <Button className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] hover:border-[var(--viktor-blue)] text-foreground">
                                        <Edit className="w-4 h-4 mr-2" /> Edit
                                    </Button>
                                </Link>
                                <DeleteButton id={proj.id} action={deleteProject} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
