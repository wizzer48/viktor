const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new', defaultViewport: { width: 1280, height: 800 } });
    const page = await browser.newPage();
    try {
        await page.goto('https://core.com.tr', { waitUntil: 'networkidle2' });

        await page.evaluate(() => {
            const btn = document.querySelector('.menu-toggle, .hamburger, header button, .mobile-menu');
            if (btn) btn.click();
        });
        await new Promise(r => setTimeout(r, 2000));

        const menuHtml = await page.evaluate(() => {
            const menu = document.querySelector('.mobile-menu, nav, #menu, .header-menu, .gtranslate_wrapper');
            return menu ? menu.innerHTML : document.body.innerHTML.substring(0, 2000);
        });

        // Also dump specifically any elements with 'tr' or 'turkish' or 'türkçe' (case-insensitive) text or attributes
        const trElements = await page.evaluate(() => {
            const all = Array.from(document.querySelectorAll('*'));
            const matches = [];
            for (let el of all) {
                const text = (el.innerText || '').toLowerCase();
                const html = (el.outerHTML || '').toLowerCase();
                if (el.tagName === 'A' || el.tagName === 'BUTTON' || el.tagName === 'SPAN') {
                    if (text.includes('türkçe') || text === 'tr' || html.includes('gtranslate')) {
                        matches.push(el.outerHTML);
                    }
                }
            }
            return matches.filter(v => v.includes('<a')).slice(0, 10);
        });

        console.log("Found TR matches:", trElements);

    } catch (err) {
        console.error(err);
    } finally {
        await browser.close();
    }
})();
