'use server';

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const MESSAGES_FILE = path.join(process.cwd(), 'src', 'data', 'messages.json');

// Schema for validation
const ContactSchema = z.object({
    name: z.string().min(2, { message: 'İsim en az 2 karakter olmalıdır.' }),
    email: z.string().email({ message: 'Geçersiz e-posta adresi.' }),
    subject: z.string().min(1, { message: 'Lütfen bir konu seçiniz.' }),
    message: z.string().min(10, { message: 'Mesajınız en az 10 karakter olmalıdır.' }),
});

export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
    status: 'new' | 'read' | 'replied';
}

export interface ContactState {
    success: boolean;
    message: string;
    errors?: {
        name?: string[];
        email?: string[];
        subject?: string[];
        message?: string[];
    };
}

export async function sendContact(prevState: ContactState, formData: FormData): Promise<ContactState> {
    // Artificial delay for UX
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validate form data
    const validatedFields = ContactSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
    });

    // Return early if validation fails
    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Lütfen form alanlarını kontrol ediniz.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { name, email, subject, message } = validatedFields.data;

    try {
        const newMessage: ContactMessage = {
            id: crypto.randomUUID(),
            name,
            email,
            subject,
            message,
            createdAt: new Date().toISOString(),
            status: 'new'
        };

        // Read existing messages
        let messages: ContactMessage[] = [];
        try {
            await fs.access(MESSAGES_FILE);
            const data = await fs.readFile(MESSAGES_FILE, 'utf-8');
            messages = JSON.parse(data);
        } catch {
            // File doesn't exist, start empty
            await fs.mkdir(path.dirname(MESSAGES_FILE), { recursive: true });
        }

        // Add new message
        messages.unshift(newMessage);

        // Save
        await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));

        revalidatePath('/admin/messages'); // Hypothetical admin path

        return { success: true, message: 'Mesajınız başarıyla alındı. En kısa sürede dönüş yapacağız.' };

    } catch (error) {
        console.error('Contact error:', error);
        return { success: false, message: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.' };
    }
}
