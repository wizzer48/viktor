import { getProject } from '@/app/actions/project';
import { ProjectForm } from '@/components/admin/ProjectForm';
import { notFound } from 'next/navigation';

interface EditProjectPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
    const { id } = await params; // Await
    const project = await getProject(id);
    if (!project) notFound();

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-white">Edit Project: {project.name}</h2>
            <ProjectForm mode="update" initialData={project} />
        </div>
    );
}
