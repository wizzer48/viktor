import * as cheerio from 'cheerio';

async function analyzeSerista() {
    console.log("--- SECURE SERISTA ANALYSIS ---");
    const listingUrl = 'https://serista.com.tr/product-category/urunler/';
    let html = await fetch(listingUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => r.text());
    let $ = cheerio.load(html);

    // List products
    const productLinks = new Set<string>();
    $('a').each((_, el) => {
        const href = $(el).attr('href');
        if (href && href.includes('/product/') && !href.includes('category')) {
            productLinks.add(href);
        }
    });
    console.log(`[LISTING] Product URLs on Page 1: ${productLinks.size}`);

    // Pagination
    let totalPages = 1;
    $('.page-numbers').each((_, el) => {
        const num = parseInt($(el).text(), 10);
        if (!isNaN(num) && num > totalPages) {
            totalPages = num;
        }
    });
    console.log(`[LISTING] Total Pages Found: ${totalPages}`);

    console.log("\n[PRODUCT] Analyzing: mona-dokunmatik-anahtar");
    const sampleProduct1 = 'https://serista.com.tr/product/mona-dokunmatik-anahtar/';
    html = await fetch(sampleProduct1, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => r.text());
    $ = cheerio.load(html);

    const title = $('h1.product_title').text().trim();
    console.log(`Title: ${title ? 'SUCCESS (' + title + ')' : 'FAIL'}`);

    const images: string[] = [];
    $('.woocommerce-product-gallery__image img, .wp-post-image').each((_, el) => {
        const src = $(el).attr('data-large_image') || $(el).attr('src');
        if (src && !images.includes(src)) images.push(src);
    });
    console.log(`Images Found: ${images.length} (First: ${images[0]})`);

    const shortDesc = $('.woocommerce-product-details__short-description').html()?.trim() || '';
    const fullDesc = $('#tab-description').html()?.trim() || '';
    console.log(`Short Desc Length: ${shortDesc.length} chars`);
    console.log(`Full Desc Length: ${fullDesc.length} chars`);

    const category = $('.posted_in a').first().text().trim();
    console.log(`Category: ${category}`);

    console.log("\n[PRODUCT 2] Validating consistency...");
    const linksArray = Array.from(productLinks);
    if (linksArray.length > 0) {
        html = await fetch(linksArray[0], { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => r.text());
        $ = cheerio.load(html);
        console.log(`Title 2: ${$('h1.product_title').text().trim()}`);
        console.log(`Images 2: ${$('.woocommerce-product-gallery__image img, .wp-post-image').length} images`);
        console.log(`Full Desc 2: ${$('#tab-description').text().trim().length} chars`);
    }
}

analyzeSerista();
