
import puppeteer, { Browser, Page } from 'puppeteer';

let browserInstance: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
    if (browserInstance) return browserInstance;

    console.log('🚀 Puppeteer: Launching Browser...');
    browserInstance = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    });
    console.log('✅ Puppeteer: Browser Launched.');

    return browserInstance;
}

export async function closeBrowser() {
    if (browserInstance) {
        await browserInstance.close();
        browserInstance = null;
    }
}

export async function createPage(browser: Browser): Promise<Page> {
    const page = await browser.newPage();

    // Set a realistic User-Agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

    // Set viewport to a desktop resolution
    await page.setViewport({ width: 1920, height: 1080 });

    // Enable request interception to block unnecessary resources (optional, but good for speed)
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
            // We might need images for the gallery extraction if they are lazy loaded, 
            // but usually we just need the 'src' attribute which is in the DOM.
            // For Interra, let's allow everything first to be safe, then optimize.
            req.continue();
        } else {
            req.continue();
        }
    });

    return page;
}
