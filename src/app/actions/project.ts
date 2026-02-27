'use server';

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';
import { ProjectSchema } from '@/lib/schemas';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Database = require('better-sqlite3');

function getDb() {
    const dbPath = path.join(process.cwd(), 'src', 'data', 'viktor.db');
    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    return db;
}

export interface Project {
    id: string;
    name: string;
    location: string;
    year: string;
    description: string;
    tags: string[];
    imagePath: string;
}

interface ProjectRow {
    id: string;
    name: string;
    location: string;
    year: string;
    description: string;
    tags: string;
    image_path: string;
}

function mapRowToProject(row: ProjectRow): Project {
    let tags: string[] = [];
    try { tags = JSON.parse(row.tags || '[]'); } catch { tags = []; }

    return {
        id: row.id,
        name: row.name,
        location: row.location || '',
        year: row.year || '',
        description: row.description || '',
        tags,
        imagePath: row.image_path || '/placeholder.svg'
    };
}

// --- DATA ACCESS ---

export const getProjects = cache(async (): Promise<Project[]> => {
    try {
        const db = getDb();
        const rows = db.prepare('SELECT * FROM projects').all() as ProjectRow[];
        db.close();
        return rows.map(mapRowToProject);
    } catch {
        return [];
    }
});

export const getProject = cache(async (id: string): Promise<Project | undefined> => {
    try {
        const db = getDb();
        const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRow | undefined;
        db.close();
        if (!row) return undefined;
        return mapRowToProject(row);
    } catch {
        return undefined;
    }
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

        const db = getDb();

        // Handle Tags (Comma separated)
        const tags = (tagsRaw || '').split(',').map(t => t.trim()).filter(Boolean);

        if (mode === 'create') {
            const baseSlug = slugify(name);
            id = baseSlug;
            let counter = 1;
            while (db.prepare('SELECT id FROM projects WHERE id = ?').get(id)) {
                id = `${baseSlug}-${counter}`;
                counter++;
            }
        } else {
            const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(id);
            if (!existing) {
                db.close();
                return { success: false, message: 'Project not found' };
            }
        }

        // Handle Image
        let imagePath = '/placeholder.svg';
        if (imageFile && imageFile.size > 0) {
            imagePath = await saveFile(imageFile);
        } else if (mode === 'update') {
            const existingRow = db.prepare('SELECT image_path FROM projects WHERE id = ?').get(id) as { image_path: string } | undefined;
            imagePath = existingRow?.image_path || '/placeholder.svg';
        }

        // Upsert
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO projects (id, name, location, year, description, tags, image_path)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(id, name, location || '', year || new Date().getFullYear().toString(), description || '', JSON.stringify(tags), imagePath);
        db.close();

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
        const db = getDb();
        const changes = db.prepare('DELETE FROM projects WHERE id = ?').run(id).changes;
        db.close();

        if (changes === 0) {
            return { success: false, message: 'Project not found' };
        }

        revalidatePath('/referanslar');
        revalidatePath('/admin');
        revalidatePath('/admin/referanslar');
        return { success: true, message: 'Project deleted' };
    } catch (e: unknown) {
        return { success: false, message: (e as Error).message };
    }
}
