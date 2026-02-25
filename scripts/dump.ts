import fs from 'fs/promises';

async function dump() {
    const url = 'https://serista.com.tr/product/mona-dokunmatik-anahtar/';
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const text = await res.text();
    await fs.writeFile('serista-raw.html', text);
    console.log("HTML length:", text.length, "bytes saved to serista-raw.html");
}

dump();
