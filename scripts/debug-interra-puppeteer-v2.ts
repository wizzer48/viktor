
import puppeteer from 'puppeteer';

const PRODUCT_URL = 'https://interratechnology.com/tr/urunler/knx-sistem-cihazlari/ix10-10-1-knx-dokunmatik-panel';
const LANG_ROOT_URL = 'https://interratechnology.com/tr';

async function run() {
    console.log('--- STARTING PUPPETEER DEBUG V2 ---');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

    try {
        console.log('1. Navigating to Language Root:', LANG_ROOT_URL);
        await page.goto(LANG_ROOT_URL, { waitUntil: 'networkidle2', timeout: 60000 });

        let title = await page.title();
        console.log('   Root Title:', title);

        if (title.includes('Select Language')) {
            console.log('❌ Still on Language Selection at root. Trying to click...');
            const trLink = await page.$('a[href*="/tr"]');
            if (trLink) {
                await Promise.all([
                    page.waitForNavigation({ waitUntil: 'networkidle2' }),
                    trLink.click()
                ]);
                console.log('   Clicked TR on root.');
            }
        } else {
            console.log('✅ Access to Root /tr successful.');
        }

        // Log cookies
        const cookies = await page.cookies();
        console.log('   Cookies after root:', JSON.stringify(cookies.map(c => c.name), null, 2));

        console.log('2. Navigating to Product Page:', PRODUCT_URL);
        await page.goto(PRODUCT_URL, { waitUntil: 'networkidle2', timeout: 60000 });

        title = await page.title();
        console.log('   Product Page Title:', title);

        const content = await page.content();
        if (content.includes('Select Language')) {
            console.error('❌ STILL on Language Selection screen.');
        } else {
            console.log('✅ SUCCESS: Accessed Product Page.');
            const images = await page.$$eval('.product-primary-gallery-container img', imgs => imgs.map(img => img.src));
            console.log('   Found Images:', images.length);
        }

    } catch (e) {
        console.error('❌ ERROR:', e);
    } finally {
        await browser.close();
    }
}

run();
