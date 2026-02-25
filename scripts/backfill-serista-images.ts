import Database from 'better-sqlite3';
import { ScraperEngine } from './src/lib/scraper/engine';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src', 'data', 'viktor.db');

async function run() {
    const db = new Database(dbPath);
    // Find all products that originated from Serista (we know this because we set them to EAE recently, but let's just grab all EAE ones with serista in their source URL or since we don't have source URL stored easily, we can just use the known slug patterns or scrape via engine if URL is known).
    // Actually, we don't store sourceUrl in DB right now, but wait, do we?
    const rows = db.prepare('SELECT id, title, sourceUrl FROM products WHERE brand = "EAE"').all();

    console.log(`Found ${rows.length} EAE products. Re-scraping images if sourceUrl exists...`);

    const engine = new ScraperEngine();

    for (const row of rows) {
        if (!row.sourceUrl) {
            // We can search serista if we don't have it, or just use the IDs we used in bulk-serista.ts
            continue;
        }

        if (row.sourceUrl.includes('serista.com.tr')) {
            console.log(`Re-scraping [${row.id}] from ${row.sourceUrl}`);
            try {
                const result = await engine.scrape(row.sourceUrl);
                if (result.success && result.data?.data) {
                    const newImages = result.data.data.images || [];
                    if (newImages.length > 0) {
                        db.prepare('UPDATE products SET images = ? WHERE id = ?').run(JSON.stringify(newImages), row.id);
                        console.log(`✅ Updated images for ${row.id}: ${newImages.length} images.`);
                    }
                }
            } catch (err) {
                console.error(`Error on ${row.id}`, err);
            }
        }
    }

    db.close();
    console.log('Done.');
}

run();
