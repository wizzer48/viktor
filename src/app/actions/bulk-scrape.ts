'use server';

import { getBrowser, createPage } from '@/lib/scraper/puppeteer';
import { ScraperEngine } from '@/lib/scraper/engine';
import { Brand } from '@/lib/scraper/types';

/**
 * Step 1: Quick call — detect how many pages exist and collect URLs from page 1 only
 */
export async function detectCategoryPages(categoryUrl: string, cookies?: any[]): Promise<{
    success: boolean;
    totalPages: number;
    firstPageUrls: string[];
    message: string;
}> {
    try {
        const browser = await getBrowser();
        const page = await createPage(browser);

        try {
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
            await page.setViewport({ width: 1280, height: 900 });

            if (cookies && Array.isArray(cookies)) {
                await page.setCookie(...cookies);
            }

            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => false });
            });

            const baseUrl = categoryUrl.split('?')[0];
            await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });

            // Detect total pages
            const totalPages = await page.evaluate(() => {
                const pageLinks = Array.from(document.querySelectorAll('.page-link'));
                let maxPage = 1;
                for (const link of pageLinks) {
                    const num = parseInt(link.textContent?.trim() || '', 10);
                    if (!isNaN(num) && num > maxPage) maxPage = num;
                }
                return maxPage;
            });

            // Collect URLs from page 1
            const firstPageUrls = await extractProductLinks(page);

            return {
                success: true,
                totalPages,
                firstPageUrls,
                message: `${totalPages} sayfa tespit edildi, sayfa 1'den ${firstPageUrls.length} ürün bulundu`,
            };
        } finally {
            await page.close();
        }
    } catch (error) {
        return { success: false, totalPages: 0, firstPageUrls: [], message: error instanceof Error ? error.message : 'Bilinmeyen hata' };
    }
}

/**
 * Step 2: Collect URLs from a SINGLE page (called repeatedly from client)
 */
export async function collectPageUrls(categoryUrl: string, pageNum: number, cookies?: any[]): Promise<{
    success: boolean;
    urls: string[];
    message: string;
}> {
    try {
        const browser = await getBrowser();
        const page = await createPage(browser);

        try {
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
            await page.setViewport({ width: 1280, height: 900 });

            if (cookies && Array.isArray(cookies)) {
                await page.setCookie(...cookies);
            }

            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => false });
            });

            const baseUrl = categoryUrl.split('?')[0];
            const pageUrl = pageNum > 1 ? `${baseUrl}?page=${pageNum}` : baseUrl;
            await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 });

            const urls = await extractProductLinks(page);

            return { success: true, urls, message: `Sayfa ${pageNum}: ${urls.length} ürün` };
        } finally {
            await page.close();
        }
    } catch (error) {
        return { success: false, urls: [], message: error instanceof Error ? error.message : 'Bilinmeyen hata' };
    }
}

/** Shared helper: extract product card links from the currently loaded page, filtered to categoryPath */
async function extractProductLinks(page: Awaited<ReturnType<typeof createPage>>, categoryPath?: string): Promise<string[]> {
    // Scroll to load lazy content
    for (let s = 0; s < 5; s++) {
        await page.evaluate(() => window.scrollBy(0, 600));
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    const allLinks = await page.evaluate(() => {
        // Interra: .product-container-row > .content-box-col > .content-box > .content-box-image > a
        const cardLinks = Array.from(
            document.querySelectorAll('.product-container-row .content-box-image a')
        ).map(a => (a as HTMLAnchorElement).href);

        // Fallback for other sites
        if (cardLinks.length === 0) {
            const fallback = Array.from(
                document.querySelectorAll('.content-box a[href*="/urunler/"]')
            ).map(a => (a as HTMLAnchorElement).href);
            return [...new Set(fallback)];
        }

        return [...new Set(cardLinks)];
    });

    // Filter: only keep URLs that belong to the entered category path
    if (categoryPath) {
        return allLinks.filter(url => {
            try {
                return new URL(url).pathname.startsWith(categoryPath);
            } catch { return false; }
        });
    }

    return allLinks;
}

/**
 * Step 3: Scrape a single product URL
 */
export async function scrapeSingleProduct(
    url: string,
    brand: Brand,
    cookies?: any[],
    categoryOverride?: string,
    subCategoryOverride?: string
): Promise<{ success: boolean; name: string; message: string }> {
    try {
        const result = await ScraperEngine.scrape(url, brand, undefined, cookies, categoryOverride, subCategoryOverride);
        return {
            success: result.success,
            name: result.data?.name || 'Bilinmeyen',
            message: result.message
        };
    } catch (error) {
        return {
            success: false,
            name: '',
            message: error instanceof Error ? error.message : 'Bilinmeyen hata'
        };
    }
}
