const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    try {
        await page.goto('https://core.com.tr/products/', { waitUntil: 'networkidle2' });

        console.log("Attempting GTranslate API...");
        await page.evaluate(() => {
            if (typeof doGTranslate === 'function') {
                doGTranslate('en|tr');
            } else {
                // Try cookie fallback
                document.cookie = 'googtrans=/en/tr; path=/';
                document.cookie = 'googtrans=/en/tr; path=/; domain=core.com.tr';
            }
        });

        // Wait for translation to process or reload if we set cookie
        await new Promise(r => setTimeout(r, 1000));
        await page.reload({ waitUntil: 'networkidle2' });

        const content = await page.evaluate(() => {
            return {
                title: document.title,
                gtranslateLink: document.querySelector('.glink')?.outerHTML
            };
        });
        console.log("Translated DOM:", content);

        // What are the products anyway?
        const products = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.dt-product-title, .product-title, h3')).map(e => e.innerText).slice(0, 5);
        });
        console.log("Products:", products);
    } catch (err) {
        console.error(err);
    } finally {
        await browser.close();
    }
})();
