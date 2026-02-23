
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const MAP_FILE = path.join(DATA_DIR, 'category-map.json');

function audit() {
    console.log('--- STARTING DATA AUDIT ---');

    // Check Products
    if (fs.existsSync(PRODUCTS_FILE)) {
        try {
            const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
            const products = JSON.parse(data);
            console.log(`✅ products.json exists. Contains ${products.length} items.`);

            // Check for duplicate sourceUrls
            const urls = products.map((p: any) => p.sourceUrl);
            const duplicates = urls.filter((e: string, i: number, a: string[]) => a.indexOf(e) !== i);
            if (duplicates.length > 0) {
                console.warn(`⚠️ Found ${duplicates.length} duplicate products.`);
            } else {
                console.log('✅ No duplicate products found.');
            }
        } catch (e) {
            console.error('❌ products.json is corrupt:', e);
        }
    } else {
        console.warn('⚠️ products.json does not exist (Expected for new install).');
    }

    // Check Category Map
    if (fs.existsSync(MAP_FILE)) {
        try {
            const data = fs.readFileSync(MAP_FILE, 'utf-8');
            const map = JSON.parse(data);
            console.log(`✅ category-map.json exists. Contains ${Object.keys(map).length} mappings.`);
        } catch (e) {
            console.error('❌ category-map.json is corrupt:', e);
        }
    } else {
        console.warn('⚠️ category-map.json does not exist.');
    }

    console.log('--- AUDIT COMPLETE ---');
}

audit();
