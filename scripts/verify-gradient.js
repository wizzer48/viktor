const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    const artifactsDir = 'C:\\Users\\egeha\\.gemini\\antigravity\\brain\\f5276de6-bc0a-4fd3-8003-21d2d87bcb32';
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Force Dark Mode preference
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);

    try {
        console.log("Navigating to home page...");
        await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle0' });

        // Ensure we are in dark mode (sometimes hydration overrides)
        await page.evaluate(() => {
            document.documentElement.classList.add('dark');
            document.documentElement.style.colorScheme = 'dark';
        });

        // Select the gradient text element
        const selector = 'h1 span.bg-clip-text';
        await page.waitForSelector(selector);

        // Get computed style for background image (which holds the gradient)
        const gradientStyle = await page.evaluate((sel) => {
            const el = document.querySelector(sel);
            const style = window.getComputedStyle(el);
            return {
                backgroundImage: style.backgroundImage,
                color: style.color, // Should be transparent
                webkitTextFillColor: style.webkitTextFillColor // Should be transparent
            };
        }, selector);

        console.log("Computed Styles (Dark Mode):");
        console.log(JSON.stringify(gradientStyle, null, 2));

        // Take a screenshot of the specific element
        const element = await page.$(selector);
        const screenshotPath = path.join(artifactsDir, 'dark-mode-gradient-verification.png');
        await element.screenshot({ path: screenshotPath });
        console.log(`Screenshot saved to: ${screenshotPath}`);

    } catch (error) {
        console.error("Error verifying gradient:", error);
    } finally {
        await browser.close();
    }
})();
