
import { getBrowser, createPage } from '../src/lib/scraper/puppeteer';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = path.join(process.cwd(), 'debug_screenshots');
const LOG_FILE = path.join(process.cwd(), 'debug_network.log');

if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);

function log(msg: string) {
    fs.appendFileSync(LOG_FILE, msg + '\n');
    console.log(msg);
}

async function debugInterraCSR() {
    log('🚀 Starting Interra CSR Debug (Simple Inspector)...');
    const browser = await getBrowser();
    const page = await createPage(browser);

    const categoryUrl = 'https://interratechnology.com/tr/urunler/knx-sistem-cihazlari/knx-dokunmatik-paneller/ix10-dokunmatik-paneller';

    try {
        log('🕵️ Enabling Stealth & Mobile Emulation...');
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
            // @ts-ignore
            window.navigator.chrome = { runtime: {} };
        });

        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1');
        await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

        log('🌍 Visiting Root (/tr)...');
        await page.goto('https://interratechnology.com/tr', { waitUntil: 'networkidle2', timeout: 60000 });

        log(`🔗 Navigating to Category: ${categoryUrl}`);
        await page.goto(categoryUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        log('👀 Searching for Product Link...');
        let targetHref = '';
        const hrefs = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a'))
                .map(a => a.href)
                .filter(h => h.includes('/urunler/') && !h.includes(window.location.href) && h.length > window.location.href.length + 5);
        });

        if (hrefs.length > 0) {
            targetHref = hrefs[0];
            log(`🎯 Picking First Link: ${targetHref}`);
        } else {
            throw new Error('No product link found.');
        }

        log(`🔗 Navigating to Product: ${targetHref}`);
        await page.goto(targetHref, { waitUntil: 'networkidle2', timeout: 60000 });

        log('⏳ Waiting for Content...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        log('🕵️ Inspecting DOM for Description Text (Simple)...');
        const selectorInfo = await page.evaluate(() => {
            // Self-contained simple function

            // @ts-ignore
            const elements = document.querySelectorAll('*');
            for (let i = 0; i < elements.length; i++) {
                const el = elements[i];
                // Check direct text content (approximation)
                if (el.innerText && el.innerText.includes('tasarlanmış') && el.children.length < 5) {
                    return {
                        tag: el.tagName,
                        className: el.className,
                        id: el.id,
                        text: el.innerText.substring(0, 50)
                    };
                }
            }
            return null;
        });

        if (selectorInfo) {
            log(`🎯 FOUND SELECTOR IN RUNTIME:`);
            log(`Tag: ${selectorInfo.tag}`);
            log(`Class: ${selectorInfo.className}`);
            log(`ID: ${selectorInfo.id}`);
            log(`Text: ${selectorInfo.text}`);
        } else {
            log('❌ Could not find text in Runtime DOM.');
            const innerText = await page.evaluate(() => document.body.innerText);
            fs.writeFileSync(path.join(process.cwd(), 'debug_interra_fail_text.txt'), innerText);
        }

    } catch (error) {
        log(`❌ Critical Error: ${error}`);
    } finally {
        await page.close();
        log('🏁 Done.');
        process.exit(0);
    }
}

debugInterraCSR();
