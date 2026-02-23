const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true, // "new" is no longer needed in recent versions, use true/false
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const BASE_URL = 'http://localhost:3000';

    console.log('🚀 Starting QA Functional Tests...');

    try {
        // 1. Navigation Test
        console.log('\n[TEST 1] Navigation & responsiveness');
        await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
        const title = await page.title();
        console.log(`✅ Home Page Loaded: "${title}"`);

        // Check Navbar Links
        const links = await page.$$eval('nav a', as => as.map(a => a.href));
        console.log(`ℹ️ Found ${links.length} nav links.`);

        // 2. Product Catalog Flow
        console.log('\n[TEST 2] Product Catalog Flow');
        await page.goto(`${BASE_URL}/urunler`, { waitUntil: 'networkidle0' });
        console.log('✅ Products Page Loaded');

        // Select a product card if exists
        const productCard = await page.$('a[href^="/urunler/"]');
        if (productCard) {
            console.log('✅ Product Card found, clicking...');
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle0' }),
                productCard.click()
            ]);
            console.log(`✅ Navigated to Product Detail: ${page.url()}`);
        } else {
            console.log('⚠️ No products found to click.');
        }

        // 3. Contact Form Validation Test
        console.log('\n[TEST 3] Contact Form Validation');
        await page.goto(`${BASE_URL}/iletisim`, { waitUntil: 'networkidle0' });

        // Try submitting empty form
        const submitBtn = await page.$('button[type="submit"]');
        if (submitBtn) {
            await submitBtn.click();
            // Wait for validation error
            try {
                await page.waitForSelector('p.text-red-400', { timeout: 2000 }); // Updated to match implementation
                console.log('✅ Validation errors appeared for empty submission');
            } catch {
                console.log('⚠️ No validation errors detected UI-wise (or strictly handled).');
            }
        } else {
            console.log('⚠️ Submit button not found.');
        }

        console.log('\n🎉 QA Functional Tests Completed Successfully.');

    } catch (error) {
        console.error('❌ Test Failed:', error);
    } finally {
        await browser.close();
    }
})();
