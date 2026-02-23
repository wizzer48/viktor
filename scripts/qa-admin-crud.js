const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true, // Run visible for debugging if needed, true for automated
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
    const page = await browser.newPage();
    const BASE_URL = 'http://localhost:3000';

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    console.log('🚀 Starting Admin CRUD QA Test...');

    try {
        // 1. Authenticate
        console.log('🔑 Setting Auth Cookie...');
        await page.setCookie({
            name: 'viktor_admin_session',
            value: 'true',
            url: BASE_URL,
            httpOnly: true,
            secure: false
        });

        // 2. Go to Add Product
        console.log('➡️ Navigating to Add Product Page...');
        await page.goto(`${BASE_URL}/admin/ekle`, { waitUntil: 'networkidle0' });

        // Check if we are really on admin page (not redirected to login)
        if (page.url().includes('/login')) {
            throw new Error('Authentication failed - Redirected to Login');
        }
        console.log('✅ Access Granted');

        // 3. Fill Form
        console.log('📝 Filling Form...');
        await page.type('input[name="name"]', 'QA Automated Product');

        // Brand & Category are inputs with datalist, typing works
        await page.type('input[name="brand"]', 'Legrand');
        await page.type('input[name="category"]', 'Anahtar Priz');

        await page.type('textarea[name="description"]', 'Created by QA Automation Script');

        // 4. Submit
        console.log('💾 Submitting Form...');

        await page.evaluate(() => {
            const btn = document.querySelector('button[type="submit"]');
            if (btn) {
                console.log('Button found, disabled:', btn.disabled);
                btn.click();
            } else {
                console.error('Submit Button NOT found');
            }
        });

        // Wait longer
        await new Promise(r => setTimeout(r, 5000));

        // 5. Verify Success Message
        const successMsg = await page.$('.text-green-400'); // Based on ProductForm.tsx logic
        if (successMsg) {
            console.log('✅ Product Created Successfully (Success Message Found)');
        } else {
            console.log('⚠️ No Success Message Found - Checking Dashboard directly');
        }

        // 6. Verify in Dashboard
        console.log('➡️ Navigating to Dashboard...');
        await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle0' });

        // Find row
        const rowFound = await page.evaluate(() => {
            const tds = Array.from(document.querySelectorAll('td'));
            return tds.some(td => td.innerText.includes('QA Automated Product'));
        });

        if (rowFound) {
            console.log('✅ Product Found in Dashboard List');

            // 7. Delete Product
            console.log('🗑️ Deleting Product...');

            // Setup Dialog Handler
            page.on('dialog', async dialog => {
                console.log(`ℹ️ Dialog appeared: ${dialog.message()}`);
                await dialog.accept();
            });

            // Find Delete Button and Click in browser context
            const deleteResult = await page.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('tbody tr'));
                const targetRow = rows.find(r => r.innerText.includes('QA Automated Product'));
                if (targetRow) {
                    // Try to find the delete button. 
                    // In DeleteButton.tsx it renders a form with a button inside.
                    // The button has a trash icon (lucide-trash).
                    const deleteBtn = targetRow.querySelector('button');
                    // To be safe, let's find the button that likely deletes.
                    // The actions column has 3 buttons: Link, Edit, Delete.
                    // Delete is usually the last one or has specific class.
                    // DeleteButton.tsx has text-red-500.
                    const redBtn = targetRow.querySelector('button.text-red-500');
                    if (redBtn) {
                        redBtn.click();
                        return true;
                    }
                    return false;
                }
                return false;
            });

            if (!deleteResult) {
                throw new Error('Could not find or click delete button');
            }

            // Wait for deletion
            await new Promise(r => setTimeout(r, 3000));
            await page.reload({ waitUntil: 'networkidle0' });

            // Verify removal
            const rowStillExists = await page.evaluate(() => {
                const tds = Array.from(document.querySelectorAll('td'));
                return tds.some(td => td.innerText.includes('QA Automated Product'));
            });

            if (!rowStillExists) {
                console.log('✅ Product Deleted Successfully');
            } else {
                console.error('❌ Product still exists after deletion attempt');
            }

        } else {
            console.error('❌ Product NOT found in Dashboard List - Creation likely failed');
        }

    } catch (error) {
        console.error('❌ Test Failed:', error);
        await page.screenshot({ path: 'admin-qa-error.png' });
        console.log('📸 Error screenshot saved to admin-qa-error.png');
    } finally {
        await browser.close();
    }
})();
