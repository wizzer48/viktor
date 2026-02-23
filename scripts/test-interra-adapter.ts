
import { InterraAdapter } from '../src/lib/scraper/adapters/interra';

async function testInterra() {
    console.log('🧪 Testing Interra Adapter...');

    // Use a known product URL
    const url = 'https://interratechnology.com/tr/urunler/knx-sistem-cihazlari/knx-dokunmatik-paneller/ix10-dokunmatik-paneller/ix10-10-1-knx-dokunmatik-panel';
    // const url = 'https://interratechnology.com/tr/urunler/knx-sistem-cihazlari/knx-dokunmatik-paneller/ix10-dokunmatik-paneller/ix10-10-1-knx-dokunmatik-panel-beyaz';

    const adapter = new InterraAdapter({
        url: url,
        brandId: 'interra',
        categoryId: 'test-category'
    });

    try {
        await adapter.fetch();
        const data = await adapter.scrapeRaw();

        console.log('✅ Scrape Success!');
        console.log('--- DATA ---');
        console.log('Title:', data.title);
        console.log('Desc Length:', data.description?.length);
        console.log('Images:', data.rawImages?.length);
        console.log('PDFs:', data.pdfs?.length);
        console.log('Preview Desc:', data.description?.substring(0, 100));

    } catch (error) {
        console.error('❌ Scrape Failed:', error);
    }
}

testInterra();
