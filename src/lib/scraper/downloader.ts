import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function downloadAsset(url: string, type: 'image' | 'pdf'): Promise<string | null> {
    if (!url) return null;

    try {
        const origin = new URL(url).origin;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': type === 'image' ? 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8' : 'application/pdf',
                'Referer': origin
            }
        });

        if (!response.ok) {
            console.warn(`Failed to download asset (${response.status}): ${url}`);
            return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let fileExtension = path.extname(new URL(url).pathname);
        if (!fileExtension) {
            fileExtension = type === 'image' ? '.jpg' : '.pdf';
        }

        const fileName = `${crypto.randomUUID()}${fileExtension}`;
        const folder = type === 'image' ? 'products' : 'docs';
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

        await fs.mkdir(uploadDir, { recursive: true });

        const absolutePath = path.join(uploadDir, fileName);
        await fs.writeFile(absolutePath, buffer);

        // Correct Return Path for Web (No /public)
        return `/uploads/${folder}/${fileName}`;

    } catch (error) {
        console.error(`Error downloading asset from ${url}:`, error);
        return null;
    }
}