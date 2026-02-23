
import * as cheerio from 'cheerio';

const TARGET_URL = 'https://interratechnology.com/tr/urunler/knx-sistem-cihazlari/ix10-10-1-knx-dokunmatik-panel';

async function run() {
    console.log('--- STARTING SCRAPER DEBUG ---');
    try {
        console.log('Fetching raw HTML...');
        const response = await fetch(TARGET_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Cookie': 'language=tr; culture=tr-TR; concrete5=12345'
            }
        });

        const html = await response.text();
        console.log('Status:', response.status);

        const $ = cheerio.load(html);
        const title = $('title').text();
        console.log('Page Title:', title);

        console.log('--- IMAGES ---');
        $('img').each((i, el) => {
            const src = $(el).attr('src');
            const cls = $(el).attr('class');
            const parentCls = $(el).parent().attr('class');
            if (i < 20) console.log(`[${i}] Src: ${src?.substring(0, 50)}... | Class: ${cls} | Parent: ${parentCls}`);
        });

        console.log('--- DIVS with "gallery" or "slider" ---');
        $('div[class*="gallery"], div[class*="slider"], div[class*="carousel"]').each((i, el) => {
            console.log(`[${i}] Class: ${$(el).attr('class')}`);
        });

    } catch (e) {
        console.error('ERROR:', e);
    }
}

run();
