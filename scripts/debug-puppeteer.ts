
import puppeteer from 'puppeteer';

const TARGET_URL = 'https://interratechnology.com/tr/urunler/knx-sistem-cihazlari/ix10-10-1-knx-dokunmatik-panel';

async function run() {
    console.log('--- STARTING PUPPETEER DEBUG ---');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        console.log('Navigating to:', TARGET_URL);
        await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

        const title = await page.title();
        console.log('Page Title:', title);

        const content = await page.content();
        if (content.includes('Select Language')) {
            console.log('STUCK ON LANGUAGE SELECTION');

            // Find language links
            const trLink = await page.$('a[href*="/tr"]');

            if (trLink) {
                console.log('Found TR link. Clicking and waiting for navigation...');

                await Promise.all([
                    page.waitForNavigation({ waitUntil: 'networkidle2' }),
                    trLink.click()
                ]);

                console.log('Clicked TR button. Navigation complete.');

                const newTitle = await page.title();
                console.log('New Page Title:', newTitle);

                const cookies = await page.cookies();
                console.log('CAPTURED COOKIES:', JSON.stringify(cookies, null, 2));

                const images = await page.$$eval('.product-primary-gallery-container img', imgs => imgs.map(img => img.src));
                console.log('Gallery Images:', images);
            } else {
                console.log('Could not find TR link.');
            }
        } else {
            console.log('SUCCESS! Accessed product page directly.');
            const cookies = await page.cookies();
            console.log('Cookies:', JSON.stringify(cookies, null, 2));
        }

    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        await browser.close();
    }
}

run();
