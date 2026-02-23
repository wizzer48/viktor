
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const htmlPath = path.join(process.cwd(), 'debug_interra_final.html');
const html = fs.readFileSync(htmlPath, 'utf-8');
const $ = cheerio.load(html);

// Search for the text we know exists
const searchText = "tüm otomasyon";
const element = $(`*:contains("${searchText}")`).last(); // Last to get the deepest node

if (element.length > 0) {
    console.log('✅ Found element containing text!');
    console.log('--- Hierarchy ---');

    let current = element;
    const hierarchy = [];

    while (current.length > 0 && current[0].tagName !== 'html') {
        const tag = current[0].tagName;
        const id = current.attr('id') ? `#${current.attr('id')}` : '';
        const cls = current.attr('class') ? `.${current.attr('class').replace(/\s+/g, '.')}` : '';
        hierarchy.unshift(`${tag}${id}${cls}`);
        current = current.parent();
    }

    console.log(hierarchy.join(' > '));
    console.log('--- Content ---');
    console.log(element.text().trim().substring(0, 100) + '...');
} else {
    console.log('❌ Could not find text in HTML using Cheerio.');
}
