'use server';

import { ScraperEngine } from '@/lib/scraper/engine';
import { Brand, ScrapeResult } from '@/lib/scraper/types';

export async function scrapeProductAction(url: string, brand: Brand, cookies?: any[]): Promise<ScrapeResult> {
    if (!url) {
        return { success: false, message: 'URL is required' };
    }

    try {
        const result = await ScraperEngine.scrape(url, brand, undefined, cookies);
        return result;
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}
