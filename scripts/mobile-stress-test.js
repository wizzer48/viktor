const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const BASE_URL = 'http://localhost:3000';

    const viewports = [
        { width: 375, height: 667, name: 'iPhone SE' },
        { width: 768, height: 1024, name: 'iPad Mini' },
        { width: 412, height: 915, name: 'Pixel 7' }
    ];

    const routes = [
        { path: '/', name: 'Home' },
        { path: '/urunler', name: 'Products' },
        { path: '/iletisim', name: 'Contact' }
    ];

    console.log('🚀 Starting Mobile Stress Test...');

    for (const viewport of viewports) {
        console.log(`📱 Testing Viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
        await page.setViewport(viewport);

        for (const route of routes) {
            console.log(`   ➡️ Navigating to ${route.name}...`);
            await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle0' });

            const filename = `mobile_stress_${viewport.name.replace(/\s/g, '_')}_${route.name}.png`.toLowerCase();
            await page.screenshot({ path: filename, fullPage: true });
            console.log(`   📸 Screenshot saved: ${filename}`);
        }
    }

    console.log('✅ Mobile Stress Test Completed.');
    await browser.close();
})();
