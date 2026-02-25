import { BaseAdapter } from './base';

export class EAEAdapter extends BaseAdapter {
    protected extractTitle(): string {
        if (!this.$) return '';
        const exactTitle = this.$('body > div').eq(8)
            .children('div').children('div')
            .children('div').eq(2)
            .find('h3').text().trim();
        return exactTitle || this.$('h3').first().text().trim();
    }

    protected extractDescription(): string {
        if (!this.$) return '';
        let descriptionHtml = '';
        const parentContainer = this.$('body > div').eq(8).children('div').children('div');
        const descriptionBlocks = parentContainer.children('div').slice(5, 13);

        descriptionBlocks.each((_, el) => {
            const block = this.$!(el).clone();
            block.find('img').remove();
            const htmlContent = block.html();
            if (htmlContent) {
                descriptionHtml += `<div>${htmlContent.trim()}</div>`;
            }
        });
        return descriptionHtml || '<p>Ürün açıklaması bulunamadı.</p>';
    }

    public extractImages(): string[] {
        if (!this.$) return [];
        const images: string[] = [];
        const mainImgAnchor = this.$('body > div').eq(8)
            .children('div').children('div')
            .children('div').eq(1)
            .find('div').eq(0).find('div').eq(2).find('div > a');

        const mainImgHref = mainImgAnchor.attr('href');
        const mainImgSrc = mainImgAnchor.find('img').attr('data-src') || mainImgAnchor.find('img').attr('src');
        const mainImage = mainImgHref || mainImgSrc;

        if (mainImage && !mainImage.includes('base64')) {
            images.push(mainImage.startsWith('http') ? mainImage : `https://eaetechnology.com${mainImage}`);
        }

        const parentContainer = this.$('body > div').eq(8).children('div').children('div');
        const descriptionBlocks = parentContainer.children('div').slice(5, 13);

        descriptionBlocks.find('img').each((_, el) => {
            const src = this.$!(el).attr('data-src') || this.$!(el).attr('src');
            if (src && !src.includes('base64')) {
                images.push(src.startsWith('http') ? src : `https://eaetechnology.com${src}`);
            }
        });
        return [...new Set(images)];
    }

    protected extractImage(): string {
        if (!this.$) return '';
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
        return 'KNX Dokunmatik Panel';
    }

    async scrapeRaw() {
        const raw = await super.scrapeRaw();
        raw.rawImages = this.extractImages();
        return raw;
    }
}
