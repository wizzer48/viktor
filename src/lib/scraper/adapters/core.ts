import * as cheerio from 'cheerio';
import { RawProductData } from '../types';

export class CoreAdapter {
    protected $: cheerio.CheerioAPI;
    protected html: string;
    protected sourceUrl: string;

    constructor(html: string, sourceUrl: string = 'https://core.com.tr/products/') {
        this.html = html;
        this.sourceUrl = sourceUrl;
        this.$ = cheerio.load(this.html);
    }

    protected extractTitle(): string {
        const h1 = this.$('h1').first().text().trim();
        if (h1) return h1;

        const h2 = this.$('h2.fusion-title-heading, h2').first().text().trim();
        if (h2) return h2;

        const titleTag = this.$('title').first().text().split('-')[0].trim();
        if (titleTag) return titleTag;

        return 'Bilinmeyen Ürün';
    }

    protected extractDescription(): string {
        let desc = '';
        this.$('.fusion-text p, .fusion-text').each((_, el) => {
            const text = this.$(el).text().trim();
            if (text && text.length > 20 && !text.includes('Specifications') && !text.includes('Daha Fazla')) {
                desc += text + '\n\n';
            }
        });
        return desc.trim();
    }

    protected extractFeatures(): string[] {
        const features: string[] = [];
        this.$('.fusion-li-item-content, .fusion-checklist li, ul li').each((_, el) => {
            const text = this.$(el).text().trim();
            if (text.length > 5 && text.length < 150 && !features.includes(text) && !text.includes('Cart')) {
                features.push(text);
            }
        });
        return features;
    }

    protected extractDownloads(): { title: string, url: string }[] {
        const downloads: { title: string, url: string }[] = [];
        this.$('a[href*=".pdf"]').each((_, el) => {
            const url = this.$(el).attr('href');
            let title = this.$(el).text().trim() || 'Datasheet';

            // Clean up the text
            title = title.replace(/\s+/g, ' ');

            if (url && !downloads.find(d => d.url === url)) {
                downloads.push({ title, url });
            }
        });
        return downloads;
    }

    protected extractVideos(): string[] {
        const videos: string[] = [];
        this.$('iframe, video').each((_, el) => {
            let src = this.$(el).attr('src') || this.$(el).attr('data-src');
            if (src && src.includes('youtube.com') && !videos.includes(src)) {
                // Ensure it's a clean embed link
                if (src.includes('?')) {
                    src = src.split('?')[0];
                }
                videos.push(src);
            }
        });
        return videos;
    }

    protected extractSpecs(): Record<string, string> {
        // Since we are extracting features into a real array now,
        // specs can be left for future table extraction logic if they add standard tables.
        return {};
    }

    protected extractVariants() {
        // Best effort extraction based on typical Core HTML for finishes
        const variants: { group?: string; name: string; hex?: string; image?: string; }[] = [];
        this.$('.fusion-text ul li strong, .fusion-text p strong').each((_, el) => {
            const text = this.$(el).text().trim();
            if (text.toLowerCase().includes('finish') || text.toLowerCase().includes('kaplama') || text.toLowerCase().includes('renk')) {
                // Try to parse out colors
                const nextText = (el.nextSibling as unknown as { textContent?: string })?.textContent || this.$(el).parent().text();
                if (nextText) {
                    const colors = nextText.replace(text, '').split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 2);
                    colors.forEach((c: string) => {
                        variants.push({
                            group: text.replace(':', '').trim(),
                            name: c.replace(/:|\./g, '').trim(),
                            hex: '#cccccc', // Default, admin will refine
                            image: ''
                        });
                    });
                }
            }
        });
        return variants;
    }

    protected extractOriginalCategory(): string {
        return 'Core Akıllı Ev Sistemleri';
    }

    public async scrapeRaw(): Promise<RawProductData> {
        const title = this.extractTitle();
        const description = this.extractDescription();
        const originalCategory = this.extractOriginalCategory();
        const features = this.extractFeatures();
        const downloads = this.extractDownloads();
        const videos = this.extractVideos();
        const specs = this.extractSpecs();
        const variants = this.extractVariants();

        // Let's grab all images just in case
        const rawImages: string[] = [];
        this.$('img').each((_, el) => {
            const src = this.$(el).attr('data-src') || this.$(el).attr('data-orig-src') || this.$(el).attr('src');
            if (src && !rawImages.includes(src) && src.includes('uploads') && !src.includes('logo')) {
                rawImages.push(src);
            }
        });

        const rawImageUrl = rawImages.length > 0 ? rawImages[0] : '';

        return {
            title,
            description,
            originalCategory,
            rawImageUrl,
            rawImages,
            rawPdfUrl: '', // Using downloads array instead now
            sourceUrl: this.sourceUrl,
            specs,
            features,
            downloads,
            videos,
            variants
        };
    }
}
