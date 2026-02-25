import * as cheerio from 'cheerio';
import { BaseAdapter } from './base';

export class SeristaAdapter extends BaseAdapter {
    async fetch(): Promise<void> {
        // Serista CDN has an anomaly: if we send full Chrome headers (Sec-Fetch etc.)
        // it serves EAE Teknoloji's HTML instead of Serista's!
        // We override fetch to use absolute minimum headers.
        try {
            const response = await fetch(this.options.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
            }

            this.html = await response.text();
            this.$ = cheerio.load(this.html);
        } catch (error) {
            console.error(`Fetch error in SeristaAdapter:`, error);
            throw error;
        }
    }

    protected extractTitle(): string {
        if (!this.$) return '';
        const t1 = this.$('h1.product_title').text().trim();
        const t2 = this.$('h1').first().text().trim();
        return t1 || t2 || '';
    }

    protected extractDescription(): string {
        if (!this.$) return '';

        const shortDesc = this.$('.woocommerce-product-details__short-description').html()?.trim() || '';
        const fullDesc = this.$('#tab-description').html()?.trim() || '';

        if (shortDesc && fullDesc) {
            return `<div class="short-desc mb-4">${shortDesc}</div><div class="full-desc">${fullDesc}</div>`;
        }

        return fullDesc || shortDesc || '<p>Ürün açıklaması bulunamadı.</p>';
    }

    public extractImages(): string[] {
        if (!this.$) return [];
        const images: string[] = [];

        // Select both the main product gallery images AND any inline images placed within the description tabs
        this.$('.woocommerce-product-gallery__image img, .wp-post-image, #slider img, figure img, #tab-description img, .woocommerce-Tabs-panel--description img, .woocommerce-product-details__short-description img').each((_, el) => {
            const src = this.$!(el).attr('data-large_image') || this.$!(el).attr('src');
            // Filter out tracking pixels or tiny icons usually not containing uploads
            if (src && !images.includes(src) && src.includes('uploads')) {
                images.push(src.startsWith('http') ? src : `https://serista.com.tr${src}`);
            }
        });

        return [...new Set(images)];
    }

    protected extractImage(): string {
        const images = this.extractImages();
        return images.length > 0 ? images[0] : '';
    }

    protected extractPdf(): string {
        return '';
    }

    protected extractSpecs(): Record<string, string> {
        return {};
    }

    protected extractOriginalCategory(): string {
        if (!this.$) return 'Unknown';
        // Handle WooCommerce categories or breadcrumbs
        const cat1 = this.$('.posted_in a').first().text().trim();
        const breadcrumb = this.$('.woocommerce-breadcrumb a').last().text().trim();
        return cat1 || breadcrumb || 'Unknown';
    }

    async scrapeRaw() {
        const raw = await super.scrapeRaw();
        raw.rawImages = this.extractImages();
        return raw;
    }
}
