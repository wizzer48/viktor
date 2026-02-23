'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'viktor2026'; // Default fallback, should be ENV
const COOKIE_NAME = 'viktor_admin_session';

export async function login(prevState: { success: boolean; message: string; }, formData: FormData) {
    const password = formData.get('password') as string;

    if (password === ADMIN_PASSWORD) {
        // Set secure cookie
        const cookieStore = await cookies();
        cookieStore.set(COOKIE_NAME, 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 Week
            path: '/',
        });

        return { success: true, message: 'Login successful' };
    } else {
        return { success: false, message: 'Invalid password' };
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    redirect('/login');
}

export async function checkAuth() {
    const cookieStore = await cookies();
    return cookieStore.has(COOKIE_NAME);
}
