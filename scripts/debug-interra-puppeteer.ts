
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const TARGET_URL = 'https://interratechnology.com/tr/urunler/knx-sistem-cihazlari/ix10-10-1-knx-dokunmatik-panel';
const SCREENSHOT_DIR = path.join(process.cwd(), 'debug_screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR);
}

async function run() {
    console.log('--- STARTING DETAILED PUPPETEER DEBUG ---');
    const browser = await puppeteer.launch({
        headless: true, // Set to false to see it if running locally, but here must be true or strictly controlled
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

    try {
        console.log('1. Navigating to URL...');
        await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log('2. Page Loaded. Taking Screenshot 1...');
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '1_initial_load.png'), fullPage: true });

        const title = await page.title();
        console.log('   Title:', title);

        const content = await page.content();
        if (content.includes('Select Language')) {
            console.log('3. "Select Language" Detected.');

            // Try to find the TR link
            const trSelector = 'a[href*="/tr"]';
            const trButton = await page.$(trSelector);

            if (trButton) {
                console.log('4. TR Button found. Clicking...');

                // Click and wait for navigation
                await Promise.all([
                    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }),
                    trButton.click()
                ]);

                console.log('5. Navigation complete. Taking Screenshot 2...');
                await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2_after_click.png'), fullPage: true });

                const newTitle = await page.title();
                console.log('   New Title:', newTitle);

                // Check if we are still on Select Language
                const newContent = await page.content();
                if (newContent.includes('Select Language')) {
                    console.error('❌ STILL on Language Selection screen.');
                } else {
                    console.log('✅ SUCCESS: Accessed Product Page.');
                    // Log gallery images check
                    const images = await page.$$eval('.product-primary-gallery-container img', imgs => imgs.map(img => img.src));
                    console.log('   Found Images:', images.length);
                }

            } else {
                console.error('❌ TR Button NOT found matching selector:', trSelector);
            }
        } else {
            console.log('✅ SUCCESS: No language screen detected.');
        }

    } catch (e) {
        console.error('❌ ERROR:', e);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'error_state.png') });
    } finally {
        await browser.close();
    }
}

run();
