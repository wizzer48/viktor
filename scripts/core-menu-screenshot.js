const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new', defaultViewport: { width: 1280, height: 800 } });
    const page = await browser.newPage();
    try {
        await page.goto('https://core.com.tr', { waitUntil: 'networkidle2' });

        // Find hamburger menu and click it
        console.log("Looking for hamburger menu...");
        await page.evaluate(() => {
            const btn = document.querySelector('.menu-toggle, .hamburger, [aria-label="Menu"]') || document.querySelector('header button');
            if (btn) btn.click();
        });

        await new Promise(r => setTimeout(r, 2000));

        await page.screenshot({ path: 'core-menu.png', fullPage: true });
        console.log("Screenshot saved to core-menu.png");

    } catch (err) {
        console.error(err);
    } finally {
        await browser.close();
    }
})();
