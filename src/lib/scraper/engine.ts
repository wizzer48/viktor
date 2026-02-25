import { Brand, Product, ScrapeResult } from './types';
import { BaseAdapter } from './adapters/base';
import { InterraAdapter } from './adapters/interra';
import { EAEAdapter } from './adapters/eae';
import { SeristaAdapter } from './adapters/serista';
import { GenericFallbackAdapter } from './adapters/generic';
import { downloadAsset } from './downloader';
import { normalizeCategory } from './mapper';
import path from 'path';
import crypto from 'crypto';

/** Generate a URL-friendly slug from a product name (Turkish-aware) */
function slugify(text: string): string {
    const turkishMap: Record<string, string> = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u',
    };
    return text
        .split('')
        .map(c => turkishMap[c] || c)
        .join('')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')  // Remove non-alphanumeric
        .replace(/[\s_]+/g, '-')       // Spaces/underscores to hyphens
        .replace(/-+/g, '-')           // Collapse multiple hyphens
        .replace(/^-|-$/g, '')         // Trim leading/trailing hyphens
        .substring(0, 80);             // Max 80 chars
}

export class ScraperEngine {
    static async scrapeHtml(html: string, sourceUrl: string, brand: Brand, categoryOverride?: string, subCategoryOverride?: string): Promise<ScrapeResult> {
        console.log(`\n🚀 BAŞLATILIYOR (HTML): ${brand}`);
        const result: ScrapeResult = { success: false, message: '' };

        try {
            // Sadece Core destekli şimdilik HTML injection
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { CoreAdapter } = require('./adapters/core');
            const adapter = new CoreAdapter(html, sourceUrl);

            const rawData = await adapter.scrapeRaw();
            console.log(`🔍 HAM VERİ BULUNDU: ${rawData.title}`);

            if (!rawData.title || rawData.title === 'Bilinmeyen Ürün') {
                throw new Error("Geçerli bir ürün başlığı bulunamadı, HTML bloğu hatalı.");
            }

            // Asset Management (Download)
            let finalImageUrl = rawData.rawImageUrl;
            if (finalImageUrl && !finalImageUrl.startsWith('http')) {
                try {
                    const baseUrl = new URL(sourceUrl).origin;
                    finalImageUrl = new URL(finalImageUrl, baseUrl).toString();
                } catch { }
            }

            let imagePath = '/placeholder.svg';
            if (finalImageUrl) {
                const downloaded = await downloadAsset(finalImageUrl, 'image');
                if (downloaded) imagePath = downloaded;
            }

            const galleryPaths: string[] = [];
            if (rawData.rawImages && rawData.rawImages.length > 0) {
                for (const imgUrl of rawData.rawImages) {
                    let validUrl = imgUrl;
                    if (validUrl && !validUrl.startsWith('http')) {
                        try {
                            const baseUrl = new URL(sourceUrl).origin;
                            validUrl = new URL(validUrl, baseUrl).toString();
                        } catch {
                            continue;
                        }
                    }
                    if (validUrl) {
                        const downloaded = await downloadAsset(validUrl, 'image');
                        if (downloaded) galleryPaths.push(downloaded);
                    }
                }
            }

            const normalizedCategory = categoryOverride || normalizeCategory(brand, rawData.originalCategory);
            const slug = slugify(rawData.title);
            const hashSuffix = crypto.createHash('md5').update(sourceUrl + rawData.title).digest('hex').substring(0, 4);
            const productId = `${slug}-${hashSuffix}`;

            const cleanedDescription = (rawData.description || '')
                .replace(/<img[^>]*>/gi, '')
                .replace(/<a[^>]*>\s*<\/a>/gi, '')
                .trim();

            // Downloads Array (PDFs)
            const finalDownloads: { title: string, url: string }[] = [];
            if (rawData.downloads && rawData.downloads.length > 0) {
                console.log(`⬇️ Dökümanlar indiriliyor (${rawData.downloads.length} adet)...`);
                for (const doc of rawData.downloads) {
                    let validDocUrl = doc.url;
                    if (validDocUrl && !validDocUrl.startsWith('http')) {
                        try {
                            const baseUrl = new URL(sourceUrl).origin;
                            validDocUrl = new URL(validDocUrl, baseUrl).toString();
                        } catch {
                            continue;
                        }
                    }
                    if (validDocUrl) {
                        const downloadedDoc = await downloadAsset(validDocUrl, 'pdf');
                        if (downloadedDoc) {
                            finalDownloads.push({ title: doc.title, url: downloadedDoc });
                        }
                    }
                }
            }

            const product: Product = {
                id: productId,
                brand,
                name: rawData.title,
                category: normalizedCategory,
                subCategory: subCategoryOverride,
                originalCategory: rawData.originalCategory,
                description: cleanedDescription,
                imagePath: imagePath,
                images: galleryPaths,
                sourceUrl: sourceUrl,
                specs: rawData.specs || {},
                features: rawData.features || [],
                downloads: finalDownloads,
                videos: rawData.videos || [],
                lastUpdated: new Date().toISOString(),
            };

            await this.saveProduct(product);
            console.log(`💾 HTML'DEN KAYDEDİLDİ: ${product.name}`);

            result.success = true;
            result.message = 'Başarıyla çekildi';
            result.data = product;

        } catch (error) {
            console.error('❌ HTML SCRAPE HATASI:', error);
            result.message = error instanceof Error ? error.message : 'Bilinmeyen hata';
        }

        return result;
    }

    static async scrape(url: string, brand: Brand, headers?: Record<string, string>, cookies?: { name: string; value: string; domain: string }[], categoryOverride?: string, subCategoryOverride?: string): Promise<ScrapeResult> {
        console.log(`\n🚀 BAŞLATILIYOR: ${brand} - ${url}`);
        const result: ScrapeResult = { success: false, message: '' };

        try {
            let adapter: BaseAdapter;
            const options = { url, brand, headers, cookies };

            if (url.includes('serista.com.tr')) {
                adapter = new SeristaAdapter(options);
            } else {
                switch (brand) {
                    case 'Interra':
                        adapter = new InterraAdapter(options);
                        break;
                    case 'EAE':
                        adapter = new EAEAdapter(options);
                        break;
                    default:
                        adapter = new GenericFallbackAdapter(options);
                }
            }

            // 2. Fetch & Extract Raw Data
            console.log(`📡 Bağlantı kuruluyor...`);
            await adapter.fetch();
            console.log(`✅ Bağlantı başarılı. Veri ayıklanıyor...`);

            const rawData = await adapter.scrapeRaw();
            console.log(`🔍 HAM VERİ BULUNDU:`, rawData);

            if (!rawData.title) {
                throw new Error("Ürün başlığı bulunamadı! Seçiciler (Selectors) hatalı olabilir.");
            }

            // 3. Asset Management (Download)
            // Resolve relative URLs
            let finalImageUrl = rawData.rawImageUrl;
            if (finalImageUrl && !finalImageUrl.startsWith('http')) {
                try {
                    const baseUrl = new URL(url).origin;
                    finalImageUrl = new URL(finalImageUrl, baseUrl).toString();
                } catch {
                    console.warn(`⚠️ Geçersiz Resim URL: ${finalImageUrl}`);
                }
            }

            let finalPdfUrl = rawData.rawPdfUrl;
            if (finalPdfUrl && !finalPdfUrl.startsWith('http')) {
                try {
                    const baseUrl = new URL(url).origin;
                    finalPdfUrl = new URL(finalPdfUrl, baseUrl).toString();
                } catch {
                    console.warn(`⚠️ Geçersiz PDF URL: ${finalPdfUrl}`);
                }
            }

            // Sadece URL varsa indirmeyi dene
            let imagePath = '/placeholder.svg';
            if (finalImageUrl) {
                console.log(`⬇️ Resim indiriliyor: ${finalImageUrl}`);
                const downloaded = await downloadAsset(finalImageUrl, 'image');
                if (downloaded) imagePath = downloaded;
            }

            // Download Gallery Images
            const galleryPaths: string[] = [];
            if (rawData.rawImages && rawData.rawImages.length > 0) {
                console.log(`⬇️ Galeri indiriliyor (${rawData.rawImages.length} adet)...`);
                for (const imgUrl of rawData.rawImages) {
                    let validUrl = imgUrl;
                    if (validUrl && !validUrl.startsWith('http')) {
                        try {
                            const baseUrl = new URL(url).origin;
                            validUrl = new URL(validUrl, baseUrl).toString();
                        } catch {
                            continue;
                        }
                    }
                    if (validUrl) {
                        const downloaded = await downloadAsset(validUrl, 'image');
                        if (downloaded) galleryPaths.push(downloaded);
                    }
                }
            }

            let datasheetPath: string | undefined = undefined;
            if (finalPdfUrl) {
                console.log(`⬇️ PDF indiriliyor: ${finalPdfUrl}`);
                const downloaded = await downloadAsset(finalPdfUrl, 'pdf');
                if (downloaded) datasheetPath = downloaded;
            }

            // 4. Category Mapping
            const normalizedCategory = categoryOverride || normalizeCategory(brand, rawData.originalCategory);
            console.log(`🏷️ Kategori: ${categoryOverride ? `[OVERRIDE] ${categoryOverride}` : `${rawData.originalCategory} -> ${normalizedCategory}`}`);

            // 5. Construct Final Product
            const slug = slugify(rawData.title);
            const hashSuffix = crypto.createHash('md5').update(url).digest('hex').substring(0, 4);
            const productId = `${slug}-${hashSuffix}`;

            // Clean description: Remove <img> tags and ensure safe HTML
            const cleanedDescription = (rawData.description || '')
                .replace(/<img[^>]*>/gi, '') // Remove all <img> tags
                .replace(/<a[^>]*>\s*<\/a>/gi, '') // Remove empty anchors
                .trim();

            // Downloads Array (PDFs)
            const finalDownloads: { title: string, url: string }[] = [];
            if (rawData.downloads && rawData.downloads.length > 0) {
                console.log(`⬇️ Dökümanlar indiriliyor (${rawData.downloads.length} adet)...`);
                for (const doc of rawData.downloads) {
                    let validDocUrl = doc.url;
                    if (validDocUrl && !validDocUrl.startsWith('http')) {
                        try {
                            const baseUrl = new URL(url).origin;
                            validDocUrl = new URL(validDocUrl, baseUrl).toString();
                        } catch {
                            continue;
                        }
                    }
                    if (validDocUrl) {
                        const downloadedDoc = await downloadAsset(validDocUrl, 'pdf');
                        if (downloadedDoc) {
                            finalDownloads.push({ title: doc.title, url: downloadedDoc });
                        }
                    }
                }
            }

            const product: Product = {
                id: productId,
                brand,
                name: rawData.title,
                category: normalizedCategory,
                subCategory: subCategoryOverride,
                originalCategory: rawData.originalCategory,
                description: cleanedDescription,
                imagePath: imagePath,
                images: galleryPaths,
                datasheetPath: datasheetPath,
                sourceUrl: url,
                specs: rawData.specs || {},
                features: rawData.features || [],
                downloads: finalDownloads,
                videos: rawData.videos || [],
                lastUpdated: new Date().toISOString(),
            };

            await this.saveProduct(product);
            console.log(`💾 KAYDEDİLDİ: ${product.name}`);

            result.success = true;
            result.message = 'Başarıyla çekildi';
            result.data = product;

        } catch (error) {
            console.error('❌ SCRAPE HATASI:', error);
            result.message = error instanceof Error ? error.message : 'Bilinmeyen hata';
        }

        return result;
    }

    private static async saveProduct(product: Product) {
        try {
            const dbPath = path.join(process.cwd(), 'src', 'data', 'viktor.db');

            // Note: We use dynamic import or require to avoid breaking edge runtimes
            // but since this is called in Node.js action, require is fine.
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const Database = require('better-sqlite3');
            const db = new Database(dbPath);
            db.pragma('journal_mode = WAL');

            const insertStmt = db.prepare(`
                INSERT OR REPLACE INTO products (id, title, description, images, specs, features, downloads, videos, variants, category, brand, slug)
                VALUES (@id, @title, @description, @images, @specs, @features, @downloads, @videos, @variants, @category, @brand, @slug)
            `);

            // Use the deterministic ID created in scrape()
            const imagesStr = JSON.stringify(product.images || []);
            const specsStr = JSON.stringify(product.specs || {});
            const slugStr = product.id; // Original JSON used id for slug sometimes, but we use product.id as ID.

            const result = insertStmt.run({
                id: product.id,
                title: product.name,
                description: product.description,
                images: imagesStr,
                specs: specsStr,
                features: JSON.stringify(product.features || []),
                downloads: JSON.stringify(product.downloads || []),
                videos: JSON.stringify(product.videos || []),
                variants: JSON.stringify(product.variants || []),
                category: product.category,
                brand: product.brand,
                slug: slugStr
            });
            console.log(`[DEBUG] Insert Result Changes: ${result.changes}`);

            const check = db.prepare('SELECT count(*) as c FROM products WHERE brand = ?').get('Core');
            console.log(`[DEBUG] Verify Core count in this connection: ${check.c}`);

            db.close();
        } catch (err) {
            console.error('Veritabanı kayıt hatası:', err);
            throw new Error('Database save failed');
        }
    }
}