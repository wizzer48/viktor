import { BaseAdapter } from './base';

export class EAEAdapter extends BaseAdapter {
    protected extractTitle(): string {
        if (!this.$) return '';
        return this.$('.product-name').text().trim() ||
            this.$('h1').first().text().trim() ||
            this.$('title').text().trim();
    }

    protected extractDescription(): string {
        if (!this.$) return '';
        return this.$('#tab-description').text().trim() ||
            this.$('.product-short-description').text().trim() ||
            this.$('meta[name="description"]').attr('content') || '';
    }

    protected extractImage(): string {
        if (!this.$) return '';
        return this.$('.product-image-gallery img').first().attr('src') ||
            this.$('.main-image img').attr('src') ||
            this.$('meta[property="og:image"]').attr('content') || '';
    }

    protected extractPdf(): string {
        if (!this.$) return '';
        let pdf = '';
        this.$('#tab-documents a, .downloads-section a').each((_, el) => {
            const href = this.$!(el).attr('href');
            if (href && href.endsWith('.pdf')) {
                pdf = href;
                return false;
            }
        });
        return pdf;
    }

    protected extractOriginalCategory(): string {
        if (!this.$) return 'General';
        const breadcrumb = this.$('.breadcrumbs').text().trim();
        if (breadcrumb) {
            return breadcrumb.split('/').pop()?.trim() || breadcrumb;
        }
        return 'EAE Product';
    }

    protected extractSpecs(): Record<string, string> {
        const specs: Record<string, string> = {};
        if (!this.$) return specs;

        this.$('#tab-specification table tr').each((_, el) => {
            const key = this.$!(el).find('td').first().text().trim();
            const val = this.$!(el).find('td').last().text().trim();
            if (key && val && key !== val) {
                specs[key] = val;
            }
        });
        return specs;
    }
}
