'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const QuoteSchema = z.object({
    name: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır.'),
    company: z.string().optional(),
    email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
    phone: z.string().min(10, 'Geçerli bir telefon numarası giriniz.'),
    notes: z.string().optional(),
    items: z.string() // JSON string of items
});

export async function submitQuote(prevState: any, formData: FormData) {
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

    let quoteItems = [];
    try {
        quoteItems = JSON.parse(itemsJson);
    } catch (e) {
        return { success: false, message: 'Ürün bilgileri hatalı.' };
    }

    if (!quoteItems || quoteItems.length === 0) {
        return { success: false, message: 'Sepetiniz boş.' };
    }

    // 2. Prepare Quote Data
    const newQuote = {
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        status: 'new', // new, reviewed, contacted, closed
        customer: {
            name,
            company,
            email,
            phone
        },
        notes,
        items: quoteItems
    };

    // 3. Save to JSON File
    try {
        const filePath = path.join(process.cwd(), 'src/data/quotes.json');

        let quotes = [];
        try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            quotes = JSON.parse(fileContent);
        } catch (error) {
            // File might not exist or be empty, start fresh
            quotes = [];
        }

        quotes.unshift(newQuote); // Add new quote to the beginning

        // Ensure directory exists
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(quotes, null, 2));

        // 4. Revalidate Admin Pages
        revalidatePath('/admin/teklifler');

        return { success: true, message: 'Teklif talebiniz başarıyla alındı.' };

    } catch (error) {
        console.error('Quote Save Error:', error);
        return { success: false, message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.' };
    }
}

export async function getQuotes() {
    try {
        const filePath = path.join(process.cwd(), 'src/data/quotes.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        return [];
    }
}
