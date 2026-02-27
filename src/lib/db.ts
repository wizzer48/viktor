import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Database = require('better-sqlite3');

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'viktor.db');

let _migrated = false;

export function getDb() {
    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    if (!_migrated) {
        runMigrations(db);
        _migrated = true;
    }

    return db;
}

function runMigrations(db: ReturnType<typeof Database>) {
    // --- Products (already exists, just ensure) ---
    db.exec(`
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            title TEXT,
            description TEXT,
            images TEXT,
            specs TEXT,
            category TEXT,
            brand TEXT,
            slug TEXT,
            features TEXT,
            downloads TEXT,
            videos TEXT,
            variants TEXT
        );
    `);

    // --- Category Mapping: Global Rules ---
    db.exec(`
        CREATE TABLE IF NOT EXISTS category_global_rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            target_category TEXT NOT NULL,
            keyword TEXT NOT NULL
        );
    `);

    // --- Category Mapping: Brand-Specific Rules ---
    db.exec(`
        CREATE TABLE IF NOT EXISTS category_brand_rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand TEXT NOT NULL,
            source_category TEXT NOT NULL,
            target_category TEXT NOT NULL
        );
    `);

    // --- Quotes ---
    db.exec(`
        CREATE TABLE IF NOT EXISTS quotes (
            id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'new',
            customer_name TEXT NOT NULL,
            customer_company TEXT,
            customer_email TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            notes TEXT
        );
    `);

    // --- Quote Items ---
    db.exec(`
        CREATE TABLE IF NOT EXISTS quote_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quote_id TEXT NOT NULL,
            product_id TEXT,
            product_name TEXT NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            brand TEXT,
            FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
        );
    `);

    // --- Projects ---
    db.exec(`
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            location TEXT,
            year TEXT,
            description TEXT,
            tags TEXT,
            image_path TEXT
        );
    `);

    // --- Sources ---
    db.exec(`
        CREATE TABLE IF NOT EXISTS sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand TEXT NOT NULL,
            name TEXT NOT NULL,
            url TEXT NOT NULL
        );
    `);
}
