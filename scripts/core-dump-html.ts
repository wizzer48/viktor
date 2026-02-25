import puppeteer from 'puppeteer';
import fs from 'fs';

async function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    try {
        await page.setViewport({ width: 1280, height: 1080 });
        await page.goto('https://core.com.tr/products/', { waitUntil: 'networkidle2' });

        console.log("Scrolling...");
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 400;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve(true);
                    }
                }, 100);
            });
        });

        await wait(2000);

        const data = await page.evaluate(() => {
            const columns = Array.from(document.querySelectorAll('.fusion-layout-column'));
            const results: any[] = [];

            columns.forEach(col => {
                results.push({
                    classes: col.className,
                    html: col.innerHTML.substring(0, 1500) // First 1500 chars to avoid massive file sizes
                });
            });
            return results;
        });

        fs.writeFileSync('core-dump-html.json', JSON.stringify(data, null, 2));
        console.log(`Saved ${data.length} columns to core-dump-html.json`);
    } finally {
        await browser.close();
    }
}

run();
