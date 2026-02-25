import puppeteer from 'puppeteer';
import { ScraperEngine } from '../src/lib/scraper/engine';

async function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeCoreBulk() {
    console.log("🚀 Başlatılıyor: Core Tekil Sayfa Scraper");

    const engine = new ScraperEngine();

    // Exact URLs provided by user
    const urls = [
        "https://core.com.tr/eclipse-touch-panel/",
        "https://core.com.tr/surfacetouchpanel/",
        "https://core.com.tr/thermostatic-push-button/",
        "https://core.com.tr/eclipse-room-controller/",
        "https://core.com.tr/eclipse-switch/",
        "https://core.com.tr/eclipse-thermostat/",
        "https://core.com.tr/surface-switch/",
        "https://core.com.tr/surface-grms-module/",
        "https://core.com.tr/streamer/",
        "https://core.com.tr/ac-knx-gateways/"
    ];

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 1080 });

        let processed = 0;

        for (const url of urls) {
            console.log(`\n📡 Bağlanılıyor: ${url}`);
            try {
                await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

                // Trigger English to Turkish translation via GTranslate
                await page.evaluate(() => {
                    document.cookie = 'googtrans=/en/tr; path=/';
                    document.cookie = 'googtrans=/en/tr; path=/; domain=core.com.tr';
                    if (typeof (window as any).doGTranslate === 'function') {
                        (window as any).doGTranslate('en|tr');
                    }
                });

                // Wait for translation to render
                await wait(4000);

                // Extract fully translated DOM
                const translatedHtml = await page.evaluate(() => document.body.innerHTML);

                if (!translatedHtml || translatedHtml.length < 500) {
                    console.error(`⚠️ Sayfa yüklenemedi: ${url}`);
                    continue;
                }

                console.log(`✅ Sayfa yüklendi, Adapter'e gönderiliyor...`);
                // Use engine to parse, download images, and save to SQLite
                const result = await ScraperEngine.scrapeHtml(translatedHtml, url, 'Core');

                if (result.success) {
                    processed++;
                    console.log(`💾 Başarıyla kaydedildi.`);
                } else {
                    console.error(`❌ Kayıt hatası:`, result.error);
                }

            } catch (err: any) {
                console.error(`❌ URL Hatası (${url}):`, err.message);
            }
        }

        console.log(`\n🎉 İşlem Tamamlandı. Toplam ${processed}/${urls.length} ürün başarıyla SQLite veritabanına kaydedildi.`);

    } catch (error) {
        console.error("Kritik Hata:", error);
    } finally {
        await browser.close();
    }
}

scrapeCoreBulk();
