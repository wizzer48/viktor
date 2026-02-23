const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    console.log('Starting visual audit...');

    // Explicitly set cache directory to avoid HOME issues if possible, 
    // though setting HOME env var in command line is the primary fix.
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        // executablePath: '...' // rely on auto-downloaded, or system chrome if needed
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        console.log('Navigating to http://127.0.0.1:3000...');
        await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle0' });

        // Check current theme
        const isDark = await page.evaluate(() => {
            return document.documentElement.classList.contains('dark') ||
                document.documentElement.style.colorScheme === 'dark';
        });

        console.log(`Current theme is: ${isDark ? 'Dark' : 'Light'}`);

        // If Dark, click the toggle to switch to Light
        if (isDark) {
            console.log('Switching to Light Mode...');
            // Assuming the toggle is the button in the navbar with the Sun/Moon icon
            // We search for a button that contains "Toggle theme" sr-only text or similar
            // based on the component we wrote: <span className="sr-only">Toggle theme</span>

            // Try to find the button by the screen reader text
            const toggleBtn = await page.$('button:has(.sr-only)');
            if (toggleBtn) {
                await toggleBtn.click();
                // Wait for transition
                await new Promise(r => setTimeout(r, 500));
            } else {
                console.error('Could not find theme toggle button.');
            }
        }

        // Verify Light Mode
        const afterToggleIsDark = await page.evaluate(() => {
            return document.documentElement.classList.contains('dark');
        });
        console.log(`Theme after toggle attempt: ${afterToggleIsDark ? 'Dark' : 'Light'}`);

        // Take Screenshot
        const outputPath = path.resolve(process.cwd(), 'audit-light-mode.png');
        await page.screenshot({ path: outputPath, fullPage: true });
        console.log(`Screenshot saved to: ${outputPath}`);

    } catch (error) {
        console.error('Audit failed:', error);
    } finally {
        await browser.close();
    }
})();
