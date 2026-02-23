'use server';

import { ScraperEngine } from '@/lib/scraper/engine';
import { Brand } from '@/lib/scraper/types';

export async function scrapeProduct(url: string, brand: Brand) {
    return await ScraperEngine.scrape(url, brand);
}

export { getProducts, getProduct, addProduct, updateProduct, deleteProduct } from './product';
