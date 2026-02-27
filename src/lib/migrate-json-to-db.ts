/**
 * One-time migration script: JSON → SQLite
 * Run with: npx ts-node --project tsconfig.json src/lib/migrate-json-to-db.ts
 * Or via: node -e "require('./src/lib/migrate-json-to-db')"
 */

import path from 'path';
import fs from 'fs';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Database = require('better-sqlite3');

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'viktor.db');
const DATA_DIR = path.join(process.cwd(), 'src', 'data');

function migrate() {
    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    console.log('🧠 Starting JSON → SQLite migration...\n');

    // ─── 1. Category Map ───
    const categoryMapPath = path.join(DATA_DIR, 'category-map.json');
    if (fs.existsSync(categoryMapPath)) {
        const catMap = JSON.parse(fs.readFileSync(categoryMapPath, 'utf-8'));

        // Ensure tables exist
        db.exec(`CREATE TABLE IF NOT EXISTS category_global_rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            target_category TEXT NOT NULL,
            keyword TEXT NOT NULL
        )`);
        db.exec(`CREATE TABLE IF NOT EXISTS category_brand_rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand TEXT NOT NULL,
            source_category TEXT NOT NULL,
            target_category TEXT NOT NULL
        )`);

        // Check if already seeded
        const existingGlobal = db.prepare('SELECT COUNT(*) as cnt FROM category_global_rules').get() as { cnt: number };
        if (existingGlobal.cnt === 0) {
            const insertGlobal = db.prepare('INSERT INTO category_global_rules (target_category, keyword) VALUES (?, ?)');
            const globalTx = db.transaction(() => {
                for (const [targetCategory, keywords] of Object.entries(catMap.GlobalRules)) {
                    for (const keyword of keywords as string[]) {
                        insertGlobal.run(targetCategory, keyword);
                    }
                }
            });
            globalTx();
            const count = db.prepare('SELECT COUNT(*) as cnt FROM category_global_rules').get() as { cnt: number };
            console.log(`  ✅ category_global_rules: ${count.cnt} rows inserted`);

            const insertBrand = db.prepare('INSERT INTO category_brand_rules (brand, source_category, target_category) VALUES (?, ?, ?)');
            const brandTx = db.transaction(() => {
                for (const [brand, rules] of Object.entries(catMap.BrandSpecific)) {
                    for (const [source, target] of Object.entries(rules as Record<string, string>)) {
                        insertBrand.run(brand, source, target);
                    }
                }
            });
            brandTx();
            const bcount = db.prepare('SELECT COUNT(*) as cnt FROM category_brand_rules').get() as { cnt: number };
            console.log(`  ✅ category_brand_rules: ${bcount.cnt} rows inserted`);
        } else {
            console.log('  ⏭️  category rules already seeded, skipping');
        }
    } else {
        console.log('  ⚠️  category-map.json not found, skipping');
    }

    // ─── 2. Quotes ───
    const quotesPath = path.join(DATA_DIR, 'quotes.json');
    if (fs.existsSync(quotesPath)) {
        db.exec(`CREATE TABLE IF NOT EXISTS quotes (
            id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'new',
            customer_name TEXT NOT NULL,
            customer_company TEXT,
            customer_email TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            notes TEXT
        )`);
        db.exec(`CREATE TABLE IF NOT EXISTS quote_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quote_id TEXT NOT NULL,
            product_id TEXT,
            product_name TEXT NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            brand TEXT,
            FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
        )`);

        const existingQuotes = db.prepare('SELECT COUNT(*) as cnt FROM quotes').get() as { cnt: number };
        if (existingQuotes.cnt === 0) {
            const quotes = JSON.parse(fs.readFileSync(quotesPath, 'utf-8'));
            if (Array.isArray(quotes) && quotes.length > 0) {
                const insertQuote = db.prepare(`INSERT INTO quotes (id, created_at, status, customer_name, customer_company, customer_email, customer_phone, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
                const insertItem = db.prepare(`INSERT INTO quote_items (quote_id, product_id, product_name, quantity, brand) VALUES (?, ?, ?, ?, ?)`);

                const tx = db.transaction(() => {
                    for (const q of quotes) {
                        insertQuote.run(q.id, q.createdAt, q.status || 'new', q.customer.name, q.customer.company || '', q.customer.email, q.customer.phone, q.notes || '');
                        if (Array.isArray(q.items)) {
                            for (const item of q.items) {
                                insertItem.run(q.id, item.id || '', item.name, item.quantity || 1, item.brand || '');
                            }
                        }
                    }
                });
                tx();
                console.log(`  ✅ quotes: ${quotes.length} rows inserted`);
            } else {
                console.log('  ⏭️  quotes.json is empty');
            }
        } else {
            console.log('  ⏭️  quotes already seeded, skipping');
        }
    } else {
        console.log('  ⚠️  quotes.json not found, skipping');
    }

    // ─── 3. Sources ───
    const sourcesPath = path.join(DATA_DIR, 'sources.json');
    if (fs.existsSync(sourcesPath)) {
        db.exec(`CREATE TABLE IF NOT EXISTS sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand TEXT NOT NULL,
            name TEXT NOT NULL,
            url TEXT NOT NULL
        )`);

        const existingSources = db.prepare('SELECT COUNT(*) as cnt FROM sources').get() as { cnt: number };
        if (existingSources.cnt === 0) {
            const sourcesData = JSON.parse(fs.readFileSync(sourcesPath, 'utf-8'));
            const insertSource = db.prepare('INSERT INTO sources (brand, name, url) VALUES (?, ?, ?)');

            const tx = db.transaction(() => {
                for (const [brand, entries] of Object.entries(sourcesData)) {
                    for (const entry of entries as { name: string; url: string }[]) {
                        insertSource.run(brand, entry.name, entry.url);
                    }
                }
            });
            tx();
            const count = db.prepare('SELECT COUNT(*) as cnt FROM sources').get() as { cnt: number };
            console.log(`  ✅ sources: ${count.cnt} rows inserted`);
        } else {
            console.log('  ⏭️  sources already seeded, skipping');
        }
    } else {
        console.log('  ⚠️  sources.json not found, skipping');
    }

    // ─── 4. Projects ───
    const projectsPath = path.join(DATA_DIR, 'projects.json');
    if (fs.existsSync(projectsPath)) {
        db.exec(`CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            location TEXT,
            year TEXT,
            description TEXT,
            tags TEXT,
            image_path TEXT
        )`);

        const projectsData = JSON.parse(fs.readFileSync(projectsPath, 'utf-8'));
        if (Array.isArray(projectsData) && projectsData.length > 0) {
            const insertProject = db.prepare(`INSERT OR IGNORE INTO projects (id, name, location, year, description, tags, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)`);
            const tx = db.transaction(() => {
                for (const p of projectsData) {
                    insertProject.run(p.id, p.name, p.location || '', p.year || '', p.description || '', JSON.stringify(p.tags || []), p.imagePath || '/placeholder.svg');
                }
            });
            tx();
            console.log(`  ✅ projects: ${projectsData.length} rows inserted`);
        } else {
            console.log('  ⏭️  projects.json is empty');
        }
    } else {
        console.log('  ⚠️  projects.json not found, skipping');
    }

    db.close();
    console.log('\n🎉 Migration complete!');
}

migrate();
