const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\egeha\\.gemini\\antigravity\\brain\\f5276de6-bc0a-4fd3-8003-21d2d87bcb32';
const PAGES = [
    { path: '/', name: 'home' },
    { path: '/kurumsal', name: 'corporate' },
    { path: '/cozumler', name: 'solutions' },
    { path: '/referanslar', name: 'references' },
    { path: '/iletisim', name: 'contact' },
    { path: '/urunler', name: 'products' }
];

async function checkPort(port) {
    try {
        const response = await fetch(`http://127.0.0.1:${port}`);
        return response.ok || response.status < 500;
    } catch {
        return false;
    }
}

(async () => {
    console.log('Starting full site visual audit...');

    // Detect Port
    let port = 3000;
    if (await checkPort(3001)) port = 3001;
    else if (await checkPort(3000)) port = 3000;
    else {
        console.error('Could not detect running Next.js server on 3000 or 3001');
        process.exit(1);
    }
    const BASE_URL = `http://127.0.0.1:${port}`;
    console.log(`Targeting server at ${BASE_URL}`);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        for (const p of PAGES) {
            const url = `${BASE_URL}${p.path}`;
            console.log(`Auditing ${p.name} (${url})...`);

            await page.goto(url, { waitUntil: 'networkidle0' });

            // 1. Capture Dark Mode (Default)
            // Ensure we are in dark mode (if system default is light, we might be in light, so allow reset)
            // Ideally we force dark mode first.
            await page.evaluate(() => {
                document.documentElement.classList.add('dark');
                document.documentElement.style.colorScheme = 'dark';
                localStorage.setItem('theme', 'dark');
            });
            await new Promise(r => setTimeout(r, 500)); // wait for transition

            const darkShotPath = path.join(ARTIFACT_DIR, `${p.name}-dark.png`);
            await page.screenshot({ path: darkShotPath, fullPage: true });
            console.log(`  Saved Dark Mode: ${path.basename(darkShotPath)}`);

            // 2. Capture Light Mode
            await page.evaluate(() => {
                document.documentElement.classList.remove('dark');
                document.documentElement.style.colorScheme = 'light';
                localStorage.setItem('theme', 'light');
            });
            await new Promise(r => setTimeout(r, 500)); // wait for transition

            const lightShotPath = path.join(ARTIFACT_DIR, `${p.name}-light.png`);
            await page.screenshot({ path: lightShotPath, fullPage: true });
            console.log(`  Saved Light Mode: ${path.basename(lightShotPath)}`);

            // Reset to dark for next page intuition
            await page.evaluate(() => {
                document.documentElement.classList.add('dark');
            });
        }

    } catch (error) {
        console.error('Audit failed:', error);
    } finally {
        await browser.close();
    }
})();
