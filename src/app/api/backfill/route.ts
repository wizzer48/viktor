import { NextResponse } from 'next/server';
import { ScraperEngine } from '@/lib/scraper/engine';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET() {
    try {
        const dbPath = path.join(process.cwd(), 'src', 'data', 'viktor.db');
        const db = new Database(dbPath);

        let counter = 0;
        let totalUpdated = 0;

        // Loop through the 4 pages of serista we initially scraped
        // https://serista.com.tr/product-category/urunler/
        for (let i = 1; i <= 4; i++) {
            const indexUrl = `https://serista.com.tr/product-category/urunler/page/${i}/`;
            const indexResult = await ScraperEngine.scrape(indexUrl, 'Serista');

            const indexData = indexResult.data as unknown as Record<string, unknown>;
            if (indexResult.success && indexData?.subLinks) {
                const links = indexData.subLinks as string[];
                for (const link of links) {
                    const productResult = await ScraperEngine.scrape(link, 'Serista');
                    if (productResult.success && productResult.data) {
                        const product = productResult.data;
                        // Find matching product in DB by name (since we replaced category/brand)
                        const row = db.prepare('SELECT id, images FROM products WHERE title = ?').get(product.name) as Record<string, unknown>;
                        if (row) {
                            let currentImages: string[] = [];
                            try { currentImages = JSON.parse(row.images as string); } catch { }
                            const newImages = [...new Set([...currentImages, ...(product.images || [])])];

                            if (newImages.length > currentImages.length) {
                                db.prepare('UPDATE products SET images = ? WHERE id = ?').run(JSON.stringify(newImages), row.id);
                                totalUpdated++;
                            }
                        }
                    }
                    counter++;
                    console.log(`Crawled ${counter} products...`);
                }
            }
        }

        db.close();
        return NextResponse.json({ success: true, message: `Checked ${counter} products, updated ${totalUpdated} products with new images.` });
    } catch (e: unknown) {
        return NextResponse.json({ success: false, error: (e as Error).message });
    }
}
