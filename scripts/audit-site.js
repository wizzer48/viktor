const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set viewport to desktop size
    await page.setViewport({ width: 1280, height: 800 });

    const BASE_URL = 'http://localhost:3000';
    const OUTPUT_DIR = path.join(__dirname, 'audit-results');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR);
    }

    const routes = [
        { path: '/', name: 'home', expectedText: 'Geleceğin Teknolojisi' },
        { path: '/kurumsal', name: 'corporate', expectedText: 'Tarihçe' },
        { path: '/cozumler', name: 'solutions', expectedText: 'Sektörel Çözümler' },
        { path: '/referanslar', name: 'references', expectedText: 'Referans Projelerimiz' },
        { path: '/iletisim', name: 'contact', expectedText: 'İletişime Geçiniz' },
        { path: '/urunler', name: 'products', expectedText: 'System Components' }
    ];

    console.log('🚀 Starting Puppeteer Site Audit...');

    let successCount = 0;

    for (const route of routes) {
        try {
            console.log(`\nTesting: ${route.path}...`);
            await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle0', timeout: 10000 });

            // Check for expected text
            const content = await page.content();
            const passed = content.includes(route.expectedText);

            if (passed) {
                console.log(`✅ Content Verified: Found "${route.expectedText}"`);
                successCount++;

                // Screenshot
                const screenshotPath = path.join(OUTPUT_DIR, `${route.name}.png`);
                await page.screenshot({ path: screenshotPath, fullPage: true });
                console.log(`📸 Screenshot saved: ${screenshotPath}`);
            } else {
                console.error(`❌ Content Mismatch: Expected "${route.expectedText}" but not found.`);
            }

        } catch (error) {
            console.error(`❌ Failed to load ${route.path}:`, error.message);
        }
    }

    await browser.close();

    console.log(`\n🏁 Audit Complete. ${successCount}/${routes.length} pages verified successfully.`);

    if (successCount === routes.length) {
        process.exit(0);
    } else {
        process.exit(1);
    }

})();
