import puppeteer from 'puppeteer';
import fs from 'fs';

async function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    console.log("Taking screenshot...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    try {
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto('https://core.com.tr/products/', { waitUntil: 'networkidle2' });
        await wait(5000);
        await page.screenshot({ path: 'core-screenshot.png', fullPage: true });
        console.log("Screenshot saved to core-screenshot.png");
    } finally {
        await browser.close();
    }
}

run();
