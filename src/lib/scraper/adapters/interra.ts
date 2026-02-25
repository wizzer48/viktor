
import { BaseAdapter } from './base';
import { RawProductData } from '../types';
import * as cheerio from 'cheerio';
import { getBrowser, createPage } from '../puppeteer';

export class InterraAdapter extends BaseAdapter {
    // Override fetch to use Puppeteer with Stealth & Runtime Extraction
    async fetch(): Promise<void> {
        console.log('🌍 Launching Puppeteer for Interra (Stealth Mode)...');
        const browser = await getBrowser();
        const page = await createPage(browser);

        try {
            console.log(`🔗 Navigating to: ${this.options.url}`);

            // 1. Stealth Setup (Mobile Emulation)
            await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1');
            await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

            // 1.5 Inject Cookies (Manual Override)
            if (this.options.cookies && Array.isArray(this.options.cookies)) {
                console.log(`🍪 Injecting ${this.options.cookies.length} cookies from Manual Override...`);
                await page.setCookie(...this.options.cookies);
            }

            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => false });
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                window.navigator.chrome = { runtime: {} };
            });

            // 2. Session Warmup (Visit Root First)
            console.log('🌍 Visiting Root (/tr) to set session...');
            await page.goto('https://interratechnology.com/tr', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => console.warn('Root visit warning:', e.message));

            // 3. Navigate to Target
            console.log(`🔗 Navigating to Target: ${this.options.url}`);
            await page.goto(this.options.url, { waitUntil: 'domcontentloaded', timeout: 60000 });

            // 4. Product Page Verification (Wait for #product-show)
            try {
                console.log('⏳ Waiting for Product Container (#product-show)...');
                await page.waitForSelector('#product-show', { timeout: 15000 });
                console.log('✅ Product Container Loaded.');
            } catch {
                console.warn('⚠️ Product container not found. Checking for language screen...');

                // Fallback: Check if we are stuck on language screen
                const title = await page.title();
                if (title.includes('Select Language')) {
                    console.log('🚧 Stuck on Language Screen. Attempting Bypass...');
                    const trLink = await page.$('a[href*="/tr"]');
                    if (trLink) {
                        await page.evaluate((el: HTMLElement) => el.click(), trLink);
                        console.log('✅ Clicked "TR". Waiting for #product-show...');
                        try {
                            await page.waitForSelector('#product-show', { timeout: 15000 });
                        } catch { console.error('❌ Failed to load product page after bypass.'); }
                    }
                }
            }

            // 4. Runtime Data Extraction
            // We extract data directly from DOM to bypass hydration/serialization issues
            console.log('🕵️ Extracting data from Runtime DOM...');

            const data = await page.evaluate(() => {
                const getText = (sel: string) => document.querySelector(sel)?.textContent?.trim() || '';

                // User-Provided Selectors
                const SELECTORS = {
                    title: '#product-show > div > div > div.col-md-6.col-lg-7.order-md-0 > article > div > h1',
                    category: '#product-show > div > div > div.col-md-6.col-lg-7.order-md-0 > article > div > h4 > a',
                    description: '#product-show > div > div > div.col-md-6.col-lg-7.order-md-0 > div',
                    imageContainer: '#product-show > div > div > div.col-md-6.col-lg-5.order-md-1.product-image-col'
                };

                // Title
                const title = getText(SELECTORS.title) || document.title;

                // Category
                const category = getText(SELECTORS.category);

                // Description
                // The full description lives inside `.fr-view` sections on Interra pages
                // We try multiple selectors for robustness
                const descSelectors = [
                    '.fr-view',  // Primary: Froala editor content (full description)
                    '#product-show .fr-view',
                    SELECTORS.description, // Fallback: direct child divs
                ];

                let description = '';
                for (const sel of descSelectors) {
                    const elements = document.querySelectorAll(sel);
                    if (elements.length === 0) continue;

                    const parts = Array.from(elements).map(el => {
                        const clone = el.cloneNode(true) as HTMLElement;
                        // Remove unwanted elements
                        clone.querySelectorAll('style, script, hr, iframe, link, img').forEach(junk => junk.remove());
                        return clone.innerHTML.trim();
                    });

                    const joined = parts
                        .filter(part => part.length > 10)
                        .join('<br/>')
                        .replace(/^(<br\s*\/?>|\s)+/gi, '');

                    if (joined.length > description.length) {
                        description = joined; // Keep the longest/most complete result
                    }
                }

                // Images
                const imageContainer = document.querySelector(SELECTORS.imageContainer);
                const images = imageContainer
                    ? Array.from(imageContainer.querySelectorAll('img')).map((img: HTMLImageElement) => img.src)
                    : [];

                // Fallback for PDFs (Global search as they might be in tabs)
                const getPDFs = () => Array.from(document.querySelectorAll('a'))
                    .filter(a => a.href.toLowerCase().endsWith('.pdf'))
                    .map(a => a.href);

                return {
                    title,
                    description,
                    category,
                    images,
                    pdfs: getPDFs(),
                    specs: {}
                };
            });

            console.log('✅ Data Extracted:', {
                title: data.title,
                descLength: data.description?.length,
                images: data.images.length,
                pdfs: data.pdfs.length
            });

            // 5. Construct Synthetic HTML for Cheerio
            // This allows us to keep the standard BaseAdapter extraction methods working
            // by giving them a predictable structure.
            const syntheticHtml = `
                <html>
                    <body>
                        <h1 class="extracted-title">${data.title}</h1>
                        <div class="extracted-category">${data.category}</div>
                        <div class="extracted-description">${data.description}</div>
                        <div class="extracted-images">
                            ${(data.images || []).map((src: string) => `<img src="${src}" class="product-image" />`).join('')}
                        </div>
                        <div class="extracted-pdfs">
                             ${(data.pdfs || []).map((href: string) => `<a href="${href}">PDF</a>`).join('')}
                        </div>
                    </body>
                </html>
            `;

            this.html = syntheticHtml;
            this.$ = cheerio.load(this.html);

        } catch (error) {
            console.error('❌ Puppeteer Error:', error);
            throw error;
        } finally {
            await page.close();
        }
    }

    // Override Property Extractors to match our Synthetic HTML
    protected extractTitle(): string {
        return this.$ ? this.$('.extracted-title').first().text().trim() : '';
    }

    protected extractDescription(): string {
        // Return raw HTML as description to preserve formatting
        return this.$ ? (this.$('.extracted-description').html() || '') : '';
    }

    protected extractImage(): string {
        if (!this.$) return '';
        const firstImg = this.$('.extracted-images img').first().attr('src');
        return firstImg || '';
    }

    protected extractPdf(): string {
        if (!this.$) return '';
        const firstPdf = this.$('.extracted-pdfs a').first().attr('href');
        return firstPdf || '';
    }

    protected extractSpecs(): Record<string, string> {
        return {}; // Spec extraction is TBD
    }

    protected extractOriginalCategory(): string {
        return this.$ ? this.$('.extracted-category').text().trim() : 'Interra Product';
    }

    // Override scrapeRaw to handle list vs detail
    // Actually, BaseAdapter handles list. We only need to fix getImages list.
    override async scrapeRaw(): Promise<RawProductData> {
        const data = await super.scrapeRaw();

        // Fix images list
        const $ = this.$;
        if ($) {
            const images = $('.extracted-images img').map((_, el) => $(el).attr('src')).get();
            if (images.length > 0) {
                data.rawImages = images;
            }
        }
        return data;
    }
}