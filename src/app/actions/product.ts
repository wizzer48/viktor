'use server';

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { ProductSchema } from '@/lib/schemas';
import { Product, Variant } from '@/lib/scraper/types';

// Use dynamic import/require for SQLite to avoid Edge runtime errors 
function getDb() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('better-sqlite3');
    const dbPath = path.join(process.cwd(), 'src', 'data', 'viktor.db');
    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    return db;
}

// --- DATA ACCESS ---

function mapRowToProduct(row: Record<string, unknown>): Product {
    let images: string[] = [];
    try {
        images = JSON.parse((row.images as string) || '[]');
        if (!Array.isArray(images)) images = [];
    } catch { }

    let specs: Record<string, string> = {};
    try {
        specs = JSON.parse((row.specs as string) || '{}');
    } catch { }

    let features: string[] = [];
    try { features = JSON.parse((row.features as string) || '[]'); } catch { }

    let downloads: { title: string; url: string; }[] = [];
    try { downloads = JSON.parse((row.downloads as string) || '[]'); } catch { }

    let videos: string[] = [];
    try { videos = JSON.parse((row.videos as string) || '[]'); } catch { }

    let variants: Variant[] = [];
    try { variants = JSON.parse((row.variants as string) || '[]'); } catch { }

    return {
        id: row.id as string,
        brand: row.brand as Product['brand'],
        name: row.title as string,
        category: row.category as string,
        subCategory: undefined,
        originalCategory: row.category as string, // Fallback since it wasn't preserved in Phase 2.5
        description: (row.description as string) || '',
        imagePath: images.length > 0 ? images[0] : '/placeholder.svg',
        images: images,
        datasheetPath: undefined,
        sourceUrl: '',
        specs: specs,
        features,
        downloads,
        videos,
        variants,
        lastUpdated: new Date().toISOString()
    };
}

export async function getProducts(): Promise<Product[]> {
    try {
        const db = getDb();
        const rows = db.prepare('SELECT * FROM products').all();
        db.close();
        return rows.map(mapRowToProduct);
    } catch (err: unknown) {
        console.error('getProducts error:', err);
        return [];
    }
}

export async function getProduct(id: string): Promise<Product | undefined> {
    try {
        const db = getDb();
        const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
        db.close();
        if (!row) return undefined;
        return mapRowToProduct(row);
    } catch (err: unknown) {
        console.error('getProduct error:', err);
        return undefined;
    }
}

export async function getDistinctBrands(): Promise<string[]> {
    try {
        const db = getDb();
        const rows = db.prepare('SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL AND brand != ""').all();
        db.close();
        return rows.map((r: { brand: string }) => r.brand).sort();
    } catch (err) {
        console.error('getDistinctBrands error:', err);
        return [];
    }
}

export async function getDistinctCategories(): Promise<string[]> {
    try {
        const db = getDb();
        const rows = db.prepare('SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != ""').all();
        db.close();
        return rows.map((r: { category: string }) => r.category).sort();
    } catch (err) {
        console.error('getDistinctCategories error:', err);
        return [];
    }
}

// --- HELPERS ---

function slugify(text: string): string {
    const trMap: Record<string, string> = {
        'ç': 'c', 'Ç': 'c',
        'ğ': 'g', 'Ğ': 'g',
        'ı': 'i', 'I': 'i', 'İ': 'i',
        'ö': 'o', 'Ö': 'o',
        'ş': 's', 'Ş': 's',
        'ü': 'u', 'Ü': 'u'
    };

    return text
        .split('')
        .map(char => trMap[char] || char)
        .join('')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

async function saveFile(file: File, folder: 'products' | 'docs', prefix: string): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());

    const ext = path.extname(file.name) || (folder === 'products' ? '.jpg' : '.pdf');
    const uniqueSuffix = crypto.randomBytes(4).toString('hex');
    const fileName = `${prefix}-${uniqueSuffix}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, fileName), buffer);

    return `/uploads/${folder}/${fileName}`;
}

// --- ACTIONS ---

export async function addProduct(prevState: { success: boolean; message: string }, formData: FormData) {
    return await saveProduct(formData, 'create');
}

export async function updateProduct(prevState: { success: boolean; message: string }, formData: FormData) {
    return await saveProduct(formData, 'update');
}

async function saveProduct(formData: FormData, mode: 'create' | 'update') {
    try {
        const rawData = {
            id: formData.get('id'),
            name: formData.get('name'),
            brand: formData.get('brand'),
            category: formData.get('category'),
            description: formData.get('description'),
            specs: formData.get('specs') ? JSON.parse(formData.get('specs') as string) : {},
            features: formData.get('features') ? JSON.parse(formData.get('features') as string) : [],
            downloads: formData.get('downloads') ? JSON.parse(formData.get('downloads') as string) : [],
            videos: formData.get('videos') ? JSON.parse(formData.get('videos') as string) : [],
            variants: formData.get('variants') ? JSON.parse(formData.get('variants') as string) : [],
        };

        const validatedFields = ProductSchema.safeParse(rawData);

        if (!validatedFields.success) {
            console.error("Validation failed:", validatedFields.error);
            return { success: false, message: 'Invalid data: ' + validatedFields.error.issues.map(i => i.message).join(', ') };
        }

        const { name, brand, category, description, specs, features, downloads, videos, variants } = validatedFields.data as {
            name: string;
            brand: string;
            category: string;
            description: string;
            specs: Record<string, string>;
            features: string[];
            downloads: { title: string; url: string; }[];
            videos: string[];
            variants: Variant[];
        };
        let id = rawData.id as string;

        const imageFiles = formData.getAll('images') as File[];
        const filePrefix = slugify(`${brand}-${name}`).substring(0, 50);

        const db = getDb();

        let existingProduct: Product | undefined;
        if (mode === 'update') {
            const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
            if (!row) return { success: false, message: 'Product not found' };
            existingProduct = mapRowToProduct(row);
        } else {
            const baseSlug = slugify(`${brand}-${name}`);
            id = baseSlug;
            let counter = 1;
            while (db.prepare('SELECT id FROM products WHERE id = ?').get(id)) {
                id = `${baseSlug}-${counter}`;
                counter++;
            }
        }

        // Handle Image Uploads
        const newImagePaths: string[] = [];
        for (const file of imageFiles) {
            if (file.size > 0) {
                const imgPath = await saveFile(file, 'products', filePrefix);
                newImagePaths.push(imgPath);
            }
        }

        let finalImages: string[] = [];
        if (mode === 'create') {
            finalImages = newImagePaths;
        } else if (existingProduct) {
            finalImages = [...(existingProduct.images || []), ...newImagePaths];
        }

        // Insert / Update in SQLite
        const insertStmt = db.prepare(`
            INSERT OR REPLACE INTO products (id, title, description, images, specs, features, downloads, videos, variants, category, brand, slug)
            VALUES (@id, @title, @description, @images, @specs, @features, @downloads, @videos, @variants, @category, @brand, @slug)
        `);

        insertStmt.run({
            id: id,
            title: name,
            description: description || '',
            images: JSON.stringify(finalImages),
            specs: JSON.stringify(specs || {}),
            features: JSON.stringify(features || []),
            downloads: JSON.stringify(downloads || []),
            videos: JSON.stringify(videos || []),
            variants: JSON.stringify(variants || []),
            category: category,
            brand: brand,
            slug: id
        });
        db.close();

        revalidatePath('/urunler');
        revalidatePath(`/urunler/${id}`);
        revalidatePath('/admin');
        revalidatePath(`/admin/duzenle/${id}`);

        return { success: true, message: `Product ${mode === 'create' ? 'added' : 'updated'} successfully!` };

    } catch (error: unknown) {
        console.error(`Error saving product:`, error);
        return { success: false, message: (error as Error).message };
    }
}

export async function deleteProduct(id: string) {
    try {
        const db = getDb();
        const changes = db.prepare('DELETE FROM products WHERE id = ?').run(id).changes;
        db.close();

        if (changes === 0) {
            return { success: false, message: 'Product not found' };
        }

        revalidatePath('/urunler');
        revalidatePath('/admin');

        return { success: true, message: 'Product deleted' };
    } catch (error: unknown) {
        return { success: false, message: (error as Error).message };
    }
}

export async function updateBulkProducts(updates: { id: string, brand: string, category: string }[]) {
    try {
        const db = getDb();

        // Use a transaction for bulk updates
        const updateStmt = db.prepare('UPDATE products SET brand = @brand, category = @category WHERE id = @id');

        const transaction = db.transaction((items: { id: string, brand: string, category: string }[]) => {
            for (const item of items) {
                updateStmt.run(item);
            }
        });

        transaction(updates);
        db.close();

        revalidatePath('/urunler');
        revalidatePath('/admin');

        return { success: true, message: `${updates.length} ürün başarıyla güncellendi!` };
    } catch (error: unknown) {
        console.error('Bulk update error:', error);
        return { success: false, message: (error as Error).message };
    }
}

