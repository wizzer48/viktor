import * as cheerio from 'cheerio';
import { RawProductData, ScraperOptions } from '../types';

export abstract class BaseAdapter {
    protected options: ScraperOptions;
    protected $: cheerio.CheerioAPI | null = null;
    protected html: string = '';

    constructor(options: ScraperOptions) {
        this.options = options;
    }

    async fetch(): Promise<void> {
        try {
            const response = await fetch(this.options.url, {
                headers: {
                    // Kendimizi en güncel Chrome olarak tanıtıyoruz
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                    'Sec-Ch-Ua-Mobile': '?0',
                    'Sec-Ch-Ua-Platform': '"Windows"',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1',
                    ...this.options.headers // Custom headers override
                }
            });

            if (!response.ok) {
                // 403 hatası alırsak loglara detaylı düşsün
                if (response.status === 403) {
                    console.error(`🚨 ERİŞİM REDDEDİLDİ (403): ${this.options.url}`);
                    console.error('Bot korumasına takıldık. Header ayarları kontrol edilmeli.');
                }
                throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
            }

            this.html = await response.text();
            this.$ = cheerio.load(this.html);

        } catch (error) {
            console.error(`Fetch error in adapter:`, error);
            throw error;
        }
    }

    // Abstract methods
    protected abstract extractTitle(): string;
    protected abstract extractDescription(): string;
    protected abstract extractImage(): string;
    protected abstract extractPdf(): string;
    protected abstract extractOriginalCategory(): string;
    protected abstract extractSpecs(): Record<string, string>;

    async scrapeRaw(): Promise<RawProductData> {
        if (!this.$) {
            throw new Error('Content not fetched. Call fetch() first.');
        }

        const title = this.extractTitle();
        const description = this.extractDescription();
        const originalCategory = this.extractOriginalCategory();
        const rawImageUrl = this.extractImage();
        const rawPdfUrl = this.extractPdf();
        const specs = this.extractSpecs();

        return {
            title,
            description,
            originalCategory,
            rawImageUrl,
            rawPdfUrl,
            sourceUrl: this.options.url,
            specs
        };
    }
}