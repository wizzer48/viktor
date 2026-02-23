'use server';

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';
import { ProjectSchema } from '@/lib/schemas';

const PROJECTS_FILE = path.join(process.cwd(), 'src', 'data', 'projects.json');

export interface Project {
    id: string;
    name: string;
    location: string;
    year: string;
    description: string;
    tags: string[];
    imagePath: string;
}

// --- DATA ACCESS ---

export const getProjects = cache(async (): Promise<Project[]> => {
    try {
        await fs.access(PROJECTS_FILE);
        const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
});

export const getProject = cache(async (id: string): Promise<Project | undefined> => {
    const projects = await getProjects();
    return projects.find(p => p.id === id);
});

// --- HELPERS ---

function slugify(text: string): string {
    const trMap: Record<string, string> = {
        'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'I': 'i',
        'İ': 'i', 'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u'
    };
    return text.split('').map(char => trMap[char] || char).join('').toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

async function writeProjects(projects: Project[]) {
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
}

async function saveFile(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || '.jpg';
    const uniqueSuffix = crypto.randomBytes(4).toString('hex');
    const fileName = `proj-${uniqueSuffix}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'projects');

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, fileName), buffer);

    return `/uploads/projects/${fileName}`;
}

// --- ACTIONS ---

export async function addProject(prevState: { success: boolean; message: string }, formData: FormData) {
    return await saveProject(formData, 'create');
}

export async function updateProject(prevState: { success: boolean; message: string }, formData: FormData) {
    return await saveProject(formData, 'update');
}

async function saveProject(formData: FormData, mode: 'create' | 'update') {
    try {
        // Validate with Zod
        const rawData = {
            id: formData.get('id'),
            name: formData.get('name'),
            location: formData.get('location'),
            year: formData.get('year'),
            description: formData.get('description'),
            tags: formData.get('tags'),
        };

        const validatedFields = ProjectSchema.safeParse(rawData);

        if (!validatedFields.success) {
            return { success: false, message: 'Invalid data: ' + validatedFields.error.issues.map(i => i.message).join(', ') };
        }

        const { name, location, year, description, tags: tagsRaw } = validatedFields.data;
        let id = rawData.id as string;
        const imageFile = formData.get('image') as File;

        if (!name) return { success: false, message: 'Missing name' };

        const projects = await getProjects();
        let project: Project;

        if (mode === 'create') {
            const baseSlug = slugify(name);
            id = baseSlug;
            let counter = 1;
            while (projects.some(p => p.id === id)) {
                id = `${baseSlug}-${counter}`;
                counter++;
            }
            project = {
                id,
                name,
                location: location || '',
                year: year || new Date().getFullYear().toString(),
                description: description || '',
                tags: [],
                imagePath: '/placeholder.svg'
            };
        } else {
            const existing = projects.find(p => p.id === id);
            if (!existing) return { success: false, message: 'Project not found' };
            project = { ...existing };
            // Update fields
            project.name = name;
            project.location = location || '';
            project.year = year || '';
            project.description = description || '';
        }

        // Handle Tags (Comma separated)
        project.tags = (tagsRaw || '').split(',').map(t => t.trim()).filter(Boolean);

        // Handle Image
        if (imageFile && imageFile.size > 0) {
            project.imagePath = await saveFile(imageFile);
        }

        // Save
        if (mode === 'create') {
            projects.push(project);
        } else {
            const index = projects.findIndex(p => p.id === id);
            projects[index] = project;
        }

        await writeProjects(projects);

        revalidatePath('/referanslar');
        revalidatePath('/admin');
        revalidatePath('/admin/referanslar');

        return { success: true, message: `Project ${mode === 'create' ? 'added' : 'updated'}` };

    } catch (error: unknown) {
        return { success: false, message: (error as Error).message };
    }
}

export async function deleteProject(id: string) {
    try {
        const projects = await getProjects();
        const filtered = projects.filter(p => p.id !== id);
        await writeProjects(filtered);
        revalidatePath('/referanslar');
        revalidatePath('/admin');
        revalidatePath('/admin/referanslar');
        return { success: true, message: 'Project deleted' };
    } catch (e: unknown) {
        return { success: false, message: (e as Error).message };
    }
}
