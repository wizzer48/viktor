import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src', 'data', 'viktor.db');
const jsonPath = path.join(process.cwd(), 'src', 'data', 'products.json');

console.log('Migrating products to SQLite...');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Ensure table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    images TEXT,
    specs TEXT,
    category TEXT,
    brand TEXT,
    slug TEXT
  );
`);

const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO products (id, title, description, images, specs, category, brand, slug)
  VALUES (@id, @title, @description, @images, @specs, @category, @brand, @slug)
`);

try {
    if (fs.existsSync(jsonPath)) {
        const rawData = fs.readFileSync(jsonPath, 'utf8');
        const products = JSON.parse(rawData);

        let count = 0;
        const insertMany = db.transaction((items) => {
            for (const item of items) {
                // Map fields based on prompt and existing structure
                const id = item.id || item.slug || Math.random().toString(36).substring(7);
                const title = item.title || item.name || '';
                const description = item.description || '';
                const category = item.category || '';
                const brand = item.brand || '';
                const slug = item.slug || item.id || '';

                // Ensure arrays/objects are stringified
                const images = typeof item.images === 'string' ? item.images : JSON.stringify(item.images || []);
                const specs = typeof item.specs === 'string' ? item.specs : JSON.stringify(item.specs || {});

                insertStmt.run({
                    id,
                    title,
                    description,
                    images,
                    specs,
                    category,
                    brand,
                    slug
                });
                count++;
            }
        });

        insertMany(products);
        console.log(`Successfully migrated ${count} products to SQLite.`);
    } else {
        console.log('No products.json found, skipping data transfer.');
    }
} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
} finally {
    db.close();
}
