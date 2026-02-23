import { ProjectForm } from '@/components/admin/ProjectForm';

export default function AddProjectPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-white">Add New Project</h2>
            <ProjectForm mode="create" />
        </div>
    );
}
