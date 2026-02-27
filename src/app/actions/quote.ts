'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import path from 'path';
import { randomUUID } from 'crypto';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Database = require('better-sqlite3');

function getDb() {
    const dbPath = path.join(process.cwd(), 'src', 'data', 'viktor.db');
    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    return db;
}

const QuoteSchema = z.object({
    name: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır.'),
    company: z.string().optional(),
    email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
    phone: z.string().min(10, 'Geçerli bir telefon numarası giriniz.'),
    notes: z.string().optional(),
    items: z.string() // JSON string of items
});

export interface QuoteItem {
    id: string;
    name: string;
    quantity: number;
    brand: string;
}

export interface Quote {
    id: string;
    createdAt: string;
    status: string;
    customer: {
        name: string;
        company: string;
        email: string;
        phone: string;
    };
    notes: string;
    items: QuoteItem[];
}

export async function submitQuote(prevState: unknown, formData: FormData) {
    // 1. Validate Form Data
    const validatedFields = QuoteSchema.safeParse({
        name: formData.get('name'),
        company: formData.get('company'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        notes: formData.get('notes'),
        items: formData.get('items')
    });

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Lütfen form alanlarını kontrol ediniz.',
            errors: validatedFields.error.flatten().fieldErrors
        };
    }

    const { name, company, email, phone, notes, items: itemsJson } = validatedFields.data;

    let quoteItems: QuoteItem[] = [];
    try {
        quoteItems = JSON.parse(itemsJson);
    } catch {
        return { success: false, message: 'Server error parsing message' };
    }

    if (!quoteItems || quoteItems.length === 0) {
        return { success: false, message: 'Sepetiniz boş.' };
    }

    // 2. Save to SQLite
    try {
        const db = getDb();
        const quoteId = randomUUID();
        const createdAt = new Date().toISOString();

        const insertQuote = db.prepare(
            `INSERT INTO quotes (id, created_at, status, customer_name, customer_company, customer_email, customer_phone, notes)
             VALUES (?, ?, 'new', ?, ?, ?, ?, ?)`
        );

        const insertItem = db.prepare(
            `INSERT INTO quote_items (quote_id, product_id, product_name, quantity, brand)
             VALUES (?, ?, ?, ?, ?)`
        );

        const tx = db.transaction(() => {
            insertQuote.run(quoteId, createdAt, name, company || '', email, phone, notes || '');
            for (const item of quoteItems) {
                insertItem.run(quoteId, item.id || '', item.name, item.quantity || 1, item.brand || '');
            }
        });

        tx();
        db.close();

        // 3. Revalidate Admin Pages
        revalidatePath('/admin/teklifler');

        return { success: true, message: 'Teklif talebiniz başarıyla alındı.' };

    } catch (error) {
        console.error('Quote Save Error:', error);
        return { success: false, message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.' };
    }
}

export async function getQuotes(): Promise<Quote[]> {
    try {
        const db = getDb();

        const quoteRows = db.prepare('SELECT * FROM quotes ORDER BY created_at DESC').all() as {
            id: string; created_at: string; status: string;
            customer_name: string; customer_company: string;
            customer_email: string; customer_phone: string; notes: string;
        }[];

        const itemStmt = db.prepare('SELECT * FROM quote_items WHERE quote_id = ?');

        const quotes: Quote[] = quoteRows.map(row => {
            const items = itemStmt.all(row.id) as {
                product_id: string; product_name: string; quantity: number; brand: string;
            }[];

            return {
                id: row.id,
                createdAt: row.created_at,
                status: row.status,
                customer: {
                    name: row.customer_name,
                    company: row.customer_company,
                    email: row.customer_email,
                    phone: row.customer_phone
                },
                notes: row.notes,
                items: items.map(i => ({
                    id: i.product_id,
                    name: i.product_name,
                    quantity: i.quantity,
                    brand: i.brand
                }))
            };
        });

        db.close();
        return quotes;
    } catch (error) {
        console.error('getQuotes error:', error);
        return [];
    }
}
