import * as cheerio from 'cheerio';
import { ScraperEngine } from '../src/lib/scraper/engine';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runBulkSerista() {
    console.log("🚀 STARTING SERISTA BULK SCRAPE (4 PAGES) 🚀\n");

    const totalPages = 4;
    const allProductLinks = new Set<string>();

    // Step 1: Gather all product URLs from all pages
    for (let i = 1; i <= totalPages; i++) {
        const pageUrl = i === 1
            ? 'https://serista.com.tr/product-category/urunler/'
            : `https://serista.com.tr/product-category/urunler/page/${i}/`;

        console.log(`\n🔍 Fetching Page ${i}: ${pageUrl}`);
        try {
            const html = await fetch(pageUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' }
            }).then(r => r.text());

            const $ = cheerio.load(html);

            $('a').each((_, el) => {
                const href = $(el).attr('href');
                if (href && href.includes('/product/') && !href.includes('category')) {
                    // Extract clean URL without query parameters etc.
                    const cleanUrl = href.split('?')[0].split('#')[0];
                    allProductLinks.add(cleanUrl);
                }
            });
            console.log(`✅ Page ${i} processed. Total unique URLs so far: ${allProductLinks.size}`);
            await delay(1000); // Be gentle
        } catch (error) {
            console.error(`❌ Error fetching page ${i}:`, error);
        }
    }

    const targetUrls = Array.from(allProductLinks);
    console.log(`\n🎯 FOUND ${targetUrls.length} TOTAL PRODUCTS TO SCRAPE.\n`);

    // Step 2: Scrape each product
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < targetUrls.length; i++) {
        const url = targetUrls[i];
        console.log(`\n-------------------------------------------------------------`);
        console.log(`⏳ Scraping Product ${i + 1}/${targetUrls.length}: ${url}`);

        try {
            const result = await ScraperEngine.scrape(url, 'EAE');
            if (result.success) {
                successCount++;
            } else {
                failCount++;
            }
        } catch (error) {
            console.error(`❌ Fatal error scraping ${url}:`, error);
            failCount++;
        }

        // Wait 1.5 seconds between product scrapes
        await delay(1500);
    }

    console.log(`\n🎉 BULK SCRAPE COMPLETE!`);
    console.log(`---------------------------------`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`---------------------------------`);
}

runBulkSerista();
