import puppeteer from 'puppeteer';
import Database from 'better-sqlite3';
import path from 'path';
import { ScraperEngine } from '../src/lib/scraper/engine';

async function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    console.log("🚀 Resim Eşleştirici Başlatılıyor: https://core.com.tr/products/");

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    try {
        await page.setViewport({ width: 1280, height: 1080 });
        await page.goto('https://core.com.tr/products/', { waitUntil: 'networkidle2' });

        console.log("📜 Lazy-load resimler için sayfa kaydırılıyor...");
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 300;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve(true);
                    }
                }, 150);
            });
        });

        await wait(3000);

        console.log("🔍 Eşleşmeler DOM'dan çıkarılıyor...");
        const mappings = await page.evaluate(() => {
            const columns = Array.from(document.querySelectorAll('.fusion-layout-column'));
            const results: { title: string, image: string }[] = [];

            columns.forEach(col => {
                const text = (col as HTMLElement).innerText || '';
                const img = col.querySelector('img');

                if (text && img) {
                    const src = img.getAttribute('data-src') || img.getAttribute('src');
                    if (src && !src.includes('logo')) {
                        // Clean up the text to isolate the title
                        // Usually the first line or highest contrast text
                        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                        if (lines.length > 0) {
                            results.push({
                                title: lines[0], // First line is usually the title 'Eclipse Touch Panels'
                                image: src
                            });
                        }
                    }
                }
            });
            return results;
        });

        console.log(`📌 ${mappings.length} adet resim/başlık eşleşmesi bulundu.`);

        const dbPath = path.join(process.cwd(), 'src', 'data', 'viktor.db');
        const db = new Database(dbPath);

        // Let's get all Core products from DB
        const coreProducts = db.prepare("SELECT id, title FROM products WHERE brand = 'Core'").all() as any[];

        console.log(`📦 Veritabanında ${coreProducts.length} adet Core ürünü var.`);
        let updatedCount = 0;

        for (const product of coreProducts) {
            // Try to find a matching mapping
            // Fuzzy search on title
            const match = mappings.find(m => {
                const dbTitle = product.title.toLowerCase().replace(/[^a-z0-9]/g, '');
                const mTitle = m.title.toLowerCase().replace(/[^a-z0-9]/g, '');
                return dbTitle.includes(mTitle) || mTitle.includes(dbTitle);
            });

            if (match) {
                console.log(`✅ Eşleşme bulundu: [DB] ${product.title} <--> [WEB] ${match.title}`);
                // Download the asset locally
                const engine = new ScraperEngine();
                // Bypass private method restriction for this script by casting to any or using a public wrapper
                // Downloader is already used implicitly, let's just use Downloader directly
                const { AssetDownloader } = require('../src/lib/scraper/downloader');

                try {
                    const downloadedPath = await AssetDownloader.downloadImage(match.image, product.id);
                    if (downloadedPath) {
                        const imagesJson = JSON.stringify([downloadedPath]);
                        db.prepare("UPDATE products SET images = ? WHERE id = ?").run(imagesJson, product.id);
                        updatedCount++;
                        console.log(`   -> Resim indirildi ve DB güncellendi: ${downloadedPath}`);
                    }
                } catch (e: any) {
                    console.error(`   -> Resim indirme hatası: ${e.message}`);
                }
            } else {
                console.log(`⚠️ Eşleşme bulunamadı: ${product.title}`);
            }
        }

        db.close();
        console.log(`\n🎉 İşlem tamamlandı. ${updatedCount} ürünün resmi güncellendi.`);

    } catch (err) {
        console.error(err);
    } finally {
        await browser.close();
    }
}

run();
