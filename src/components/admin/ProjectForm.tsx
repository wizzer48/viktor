'use client';

import { useActionState } from 'react';
import { addProject, updateProject, Project } from '@/app/actions/project';
import { useState } from 'react';
import { Upload, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ProjectFormProps {
    mode: 'create' | 'update';
    initialData?: Project;
}

const initialState = {
    success: false,
    message: ''
};

export function ProjectForm({ mode, initialData }: ProjectFormProps) {
    const action = mode === 'create' ? addProject : updateProject;
    const [state, formAction, isPending] = useActionState(action, initialState);

    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imagePath || null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <form action={formAction} className="space-y-8 bg-[var(--viktor-surface)] border border-[var(--viktor-border)] p-8 rounded-sm">
            {state.message && (
                <div className={`p-4 border ${state.success ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-red-500/50 bg-red-500/10 text-red-400'}`}>
                    {state.message}
                </div>
            )}

            <input type="hidden" name="id" value={initialData?.id} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-xs font-mono uppercase text-[var(--viktor-slate)]">Project Name</label>
                    <input name="name" defaultValue={initialData?.name} required className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-2 text-white outline-none focus:border-[var(--viktor-blue)]" />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-[var(--viktor-slate)]">Location</label>
                    <input name="location" defaultValue={initialData?.location} required className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-2 text-white outline-none focus:border-[var(--viktor-blue)]" />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-[var(--viktor-slate)]">Year</label>
                    <input name="year" defaultValue={initialData?.year} required className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-2 text-white outline-none focus:border-[var(--viktor-blue)]" />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-xs font-mono uppercase text-[var(--viktor-slate)]">Description</label>
                    <textarea name="description" defaultValue={initialData?.description} rows={3} className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-2 text-white outline-none focus:border-[var(--viktor-blue)]" />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-xs font-mono uppercase text-[var(--viktor-slate)]">Tags (comma separated)</label>
                    <input name="tags" defaultValue={initialData?.tags?.join(', ')} placeholder="KNX, Lighting, Hotel" className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-2 text-white outline-none focus:border-[var(--viktor-blue)]" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-[var(--viktor-slate)]">Project Image</label>
                <div className="flex gap-4 items-start">
                    <div className="relative group cursor-pointer border-2 border-dashed border-[var(--viktor-border)] hover:border-[var(--viktor-blue)] bg-[var(--viktor-bg)] w-32 h-32 flex flex-col items-center justify-center transition-colors">
                        <input type="file" name="image" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <Upload className="w-6 h-6 text-[var(--viktor-slate)]" />
                    </div>
                    {imagePreview && (
                        <div className="relative w-32 h-32 border border-[var(--viktor-border)]">
                            <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                        </div>
                    )}
                </div>
            </div>

            <Button type="submit" disabled={isPending} className="w-full bg-[var(--viktor-blue)] hover:bg-[#0090ad] text-white font-bold py-4 uppercase">
                <Save className="w-4 h-4 mr-2" /> {isPending ? 'Saving...' : 'Save Project'}
            </Button>
        </form>
    );
}
