import * as cheerio from 'cheerio';
import fs from 'fs';

const html = fs.readFileSync('core-single-dump.html', 'utf-8');
const $ = cheerio.load(html);

console.log('--- DEEP DOM STRUCTURAL ANALYSIS ---');
console.log('PDF Data Sheets:', $('a[href*=".pdf"]').length);
console.log('Tables:', $('table').length);
console.log('Lists (ul/ol):', $('ul').length + $('ol').length);
console.log('Videos/Iframes:', $('video, iframe').length);
console.log('SVG Icons within content:', $('.fusion-text svg, .fusion-column svg').length);

// Extract bullet points as potential features
const features: string[] = [];
$('.fusion-li-item-content, .fusion-checklist li, ul li').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 5 && text.length < 150 && !features.includes(text) && !text.includes('Cart')) {
        features.push(text);
    }
});
console.log('\n--- EXTRACTED FEATURES/SPECS ---');
console.log(features.slice(0, 5), '... (Total: ' + features.length + ')');

// Check for Data Sections (e.g. Dimensions, Wiring)
const subheadings: string[] = [];
$('h3, h4, h5').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 3 && !subheadings.includes(text)) {
        subheadings.push(text);
    }
});
console.log('\n--- SUBHEADINGS (POTENTIAL TABS/SECTIONS) ---');
console.log(subheadings);
