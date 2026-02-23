'use server';

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { ProductSchema } from '@/lib/schemas';
import { Product } from '@/lib/scraper/types';

const PRODUCTS_FILE = path.join(process.cwd(), 'src', 'data', 'products.json');

// --- DATA ACCESS ---

export async function getProducts(): Promise<Product[]> {
    try {
        await fs.access(PRODUCTS_FILE);
        const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

export async function getProduct(id: string): Promise<Product | undefined> {
    const products = await getProducts();
    return products.find(p => p.id === id);
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
        .replace(/[^a-z0-9\s-]/g, '') // Remove invalid chars
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/-+/g, '-'); // Remove duplicate -
}

async function writeProducts(products: Product[]) {
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

async function saveFile(file: File, folder: 'products' | 'docs', prefix: string): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Usage: prefix-random.ext (e.g., legrand-combo-actuator-a1b2.jpg)
    // This keeps files identifiable but unique
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
        // Validate fields with Zod
        const rawData = {
            id: formData.get('id'),
            name: formData.get('name'),
            brand: formData.get('brand'),
            category: formData.get('category'),
            description: formData.get('description'),
            specs: formData.get('specs') ? JSON.parse(formData.get('specs') as string) : {},
        };

        const validatedFields = ProductSchema.safeParse(rawData);

        if (!validatedFields.success) {
            console.error("Validation failed:", validatedFields.error);
            return { success: false, message: 'Invalid data: ' + validatedFields.error.issues.map(i => i.message).join(', ') };
        }

        const { name, brand, category, description, specs } = validatedFields.data as {
            name: string;
            brand: string;
            category: string;
            description: string;
            specs: Record<string, string>
        };
        let id = rawData.id as string;

        const imageFiles = formData.getAll('images') as File[];
        const datasheetFile = formData.get('datasheet') as File;

        const products = await getProducts();
        let product: Product;

        // Generate Semantic Slug for ID if Creating
        if (mode === 'create') {
            const baseSlug = slugify(`${brand}-${name}`);
            id = baseSlug;
            let counter = 1;
            while (products.some(p => p.id === id)) {
                id = `${baseSlug}-${counter}`;
                counter++;
            }
        }

        const filePrefix = slugify(`${brand}-${name}`).substring(0, 50); // Limit length

        if (mode === 'update') {
            const existing = products.find(p => p.id === id);
            if (!existing) return { success: false, message: 'Product not found' };
            product = { ...existing };
        } else {
            product = {
                id,
                brand: brand as Product['brand'],
                name,
                category,
                originalCategory: 'Manual Entry',
                description: '',
                imagePath: '/placeholder.svg',
                images: [],
                sourceUrl: '',
                specs: {},
                lastUpdated: new Date().toISOString()
            };
        }

        product.name = name;
        product.brand = brand as Product['brand'];
        product.category = category;
        product.description = description || '';
        product.lastUpdated = new Date().toISOString();

        product.specs = (specs as Record<string, string>) || {};

        // Images
        const newImagePaths: string[] = [];
        for (const file of imageFiles) {
            if (file.size > 0) {
                const path = await saveFile(file, 'products', filePrefix);
                newImagePaths.push(path);
            }
        }

        if (mode === 'create') {
            if (newImagePaths.length > 0) {
                product.images = newImagePaths;
                product.imagePath = newImagePaths[0];
            }
        } else {
            if (newImagePaths.length > 0) {
                product.images = [...(product.images || []), ...newImagePaths];
                if (!product.imagePath || product.imagePath === '/placeholder.svg') {
                    product.imagePath = newImagePaths[0];
                }
            }
        }

        // Datasheet
        if (datasheetFile && datasheetFile.size > 0) {
            product.datasheetPath = await saveFile(datasheetFile, 'docs', filePrefix);
        }

        // Commmit
        if (mode === 'create') {
            products.push(product);
        } else {
            const index = products.findIndex(p => p.id === id);
            products[index] = product;
        }

        await writeProducts(products);

        revalidatePath('/urunler');
        revalidatePath(`/urunler/${product.id}`);
        revalidatePath('/admin');
        revalidatePath(`/admin/duzenle/${product.id}`);

        return { success: true, message: `Product ${mode === 'create' ? 'added' : 'updated'} successfully!` };

    } catch (error: unknown) {
        console.error(`Error saving product:`, error);
        return { success: false, message: (error as Error).message };
    }
}

export async function deleteProduct(id: string) {
    try {
        const products = await getProducts();
        const filtered = products.filter(p => p.id !== id);

        if (products.length === filtered.length) {
            return { success: false, message: 'Product not found' };
        }

        await writeProducts(filtered);
        revalidatePath('/urunler');
        revalidatePath('/admin');

        return { success: true, message: 'Product deleted' };
    } catch (error: unknown) {
        return { success: false, message: (error as Error).message };
    }
}
