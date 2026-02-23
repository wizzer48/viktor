
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const TARGET_URL = 'https://interratechnology.com/tr/urunler/knx-sistem-cihazlari/ix10-10-1-knx-dokunmatik-panel';
const OUT_FILE = path.join(process.cwd(), 'debug_interra.html');

async function run() {
    console.log('--- DUMPING INTERRA HTML ---');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

    try {
        await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });

        const content = await page.content();
        fs.writeFileSync(OUT_FILE, content);
        console.log(`✅ HTML dumped to ${OUT_FILE}`);

    } catch (e) {
        console.error('❌ ERROR:', e);
    } finally {
        await browser.close();
    }
}

run();
