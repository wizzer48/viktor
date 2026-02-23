import { Brand, Product, ScrapeResult } from './types';
import { BaseAdapter } from './adapters/base';
import { InterraAdapter } from './adapters/interra';
import { EAEAdapter } from './adapters/eae';
import { GenericFallbackAdapter } from './adapters/generic';
import { downloadAsset } from './downloader';
import { normalizeCategory } from './mapper';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const DATA_FILE = path.join(DATA_DIR, 'products.json');

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
    static async scrape(url: string, brand: Brand, headers?: Record<string, string>, cookies?: any[], categoryOverride?: string, subCategoryOverride?: string): Promise<ScrapeResult> {
        console.log(`\n🚀 BAŞLATILIYOR: ${brand} - ${url}`);
        const result: ScrapeResult = { success: false, message: '' };

        try {
            // 1. Select Adapter
            let adapter: BaseAdapter;
            const options = { url, brand, headers, cookies };
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
            // Klasör var mı kontrol et, yoksa oluştur
            await fs.mkdir(DATA_DIR, { recursive: true });

            try {
                await fs.access(DATA_FILE);
            } catch {
                await fs.writeFile(DATA_FILE, '[]', 'utf-8');
            }

            const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
            let products: Product[] = [];
            try {
                products = JSON.parse(fileContent);
            } catch {
                products = [];
            }

            const existingIndex = products.findIndex(p => p.sourceUrl === product.sourceUrl);
            if (existingIndex > -1) {
                const id = products[existingIndex].id;
                products[existingIndex] = { ...products[existingIndex], ...product, id, lastUpdated: new Date().toISOString() };
            } else {
                products.push(product);
            }

            await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2), 'utf-8');
        } catch (err) {
            console.error('Veritabanı kayıt hatası:', err);
            throw new Error('Database save failed');
        }
    }
}