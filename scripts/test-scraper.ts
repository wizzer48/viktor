
import { ScraperEngine } from '../src/lib/scraper/engine';

const TARGET_URL = 'https://interratechnology.com/tr/urunler/knx-sistem-cihazlari/ix10-10-1-knx-dokunmatik-panel';

async function run() {
    console.log('--- STARTING SCRAPER TEST ---');
    try {
        console.log('Attempt 1: Standard Fetch');
        let result = await ScraperEngine.scrape(TARGET_URL, 'Interra');
        console.log('Attempt 1 Result Name:', result.data?.name);

        console.log('\nAttempt 2: With Cookies');
        result = await ScraperEngine.scrape(TARGET_URL, 'Interra', {
            'Cookie': 'language=tr; culture=tr-TR; concrete5=12345'
        });

        if (result.success && result.data?.name !== 'Select Language (TR)') {
            console.log('SUCCESS! Got Name:', result.data?.name);
            console.log('Specs:', JSON.stringify(result.data?.specs, null, 2));
        } else {
            console.log('Attempt 2 Result Name:', result.data?.name);
        }

    } catch (e) {
        console.error('ERROR:', e);
    }
}

run();
