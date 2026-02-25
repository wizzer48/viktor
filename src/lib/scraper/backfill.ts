import { ScraperEngine } from './engine';
import Database from 'better-sqlite3';
import path from 'path';

export async function runBackfill() {
    const dbPath = path.join(process.cwd(), 'src', 'data', 'viktor.db');
    const db = new Database(dbPath);

    const rows = db.prepare('SELECT id, title, sourceUrl FROM products WHERE brand = "EAE"').all() as Record<string, unknown>[];
    console.log(`Found ${rows.length} EAE products. Re-scraping images...`);


    let updated = 0;

    for (const row of rows) {
        const rowId = row.id as string;
        const urlSlug = rowId.replace('eae-', ''); // assuming id was like eae-mona-dokunmatik-anahtar
        // let's just try searching or using direct url
        // Actually, serista urls are usually: https://serista.com.tr/product/${urlSlug}/

        const url = `https://serista.com.tr/product/${urlSlug}/`;
        console.log(`Trying to re-scrape: ${url}`);

        try {
            const result = await ScraperEngine.scrape(url, 'EAE');
            if (result.success && result.data) {
                const newImages = result.data.images || [];
                if (newImages.length > 0) {
                    db.prepare('UPDATE products SET images = ? WHERE id = ?').run(JSON.stringify(newImages), rowId);
                    console.log(`✅ Updated images for ${rowId}: ${newImages.length} images.`);
                    updated++;
                }
            } else {
                console.log(`Failed or not found: ${url}`);
            }
        } catch {
            console.error(`Error on ${rowId}`);
        }
    }

    db.close();
    return `Done. Updated ${updated} products.`;
}
