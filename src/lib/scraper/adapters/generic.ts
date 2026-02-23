import { BaseAdapter } from './base';

export class GenericFallbackAdapter extends BaseAdapter {
    protected extractTitle(): string {
        return this.$ ? (this.$('h1').first().text().trim() || this.$('title').text().trim()) : 'No Title';
    }

    protected extractDescription(): string {
        return this.$ ? (this.$('meta[name="description"]').attr('content') || this.$('p').first().text().trim()) : '';
    }

    protected extractImage(): string {
        return this.$ ? (this.$('meta[property="og:image"]').attr('content') || this.$('img').first().attr('src') || '') : '';
    }

    protected extractPdf(): string {
        let pdfUrl = '';
        if (this.$) {
            this.$('a[href$=".pdf"]').each((i, el) => {
                const href = this.$!(el).attr('href');
                if (href && !pdfUrl) pdfUrl = href;
            });
        }
        return pdfUrl;
    }

    protected extractOriginalCategory(): string {
        return this.$ ? (this.$('.breadcrumb').text().trim() || 'General') : 'General';
    }

    protected extractSpecs(): Record<string, string> {
        return {};
    }
}
