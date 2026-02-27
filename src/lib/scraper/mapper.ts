import path from 'path';
import { Brand } from './types';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Database = require('better-sqlite3');

function getDb() {
    const dbPath = path.join(process.cwd(), 'src', 'data', 'viktor.db');
    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    return db;
}

interface GlobalRuleRow {
    target_category: string;
    keyword: string;
}

interface BrandRuleRow {
    brand: string;
    source_category: string;
    target_category: string;
}

export function normalizeCategory(brand: Brand, originalCategory: string): string {
    if (!originalCategory) return "Ev Çözümleri";

    const db = getDb();

    try {
        // 1. Check Brand Specific Rules first (High Priority)
        const brandRules = db.prepare(
            'SELECT source_category, target_category FROM category_brand_rules WHERE brand = ?'
        ).all(brand) as BrandRuleRow[];

        // Exact match check
        for (const rule of brandRules) {
            if (rule.source_category === originalCategory) {
                return rule.target_category;
            }
        }
        // Partial match check
        for (const rule of brandRules) {
            if (originalCategory.toLowerCase().includes(rule.source_category.toLowerCase())) {
                return rule.target_category;
            }
        }

        // 2. Check Global Rules (Keyword based)
        const globalRules = db.prepare(
            'SELECT target_category, keyword FROM category_global_rules'
        ).all() as GlobalRuleRow[];

        for (const rule of globalRules) {
            if (originalCategory.toLowerCase().includes(rule.keyword.toLowerCase())) {
                return rule.target_category;
            }
        }

        // 3. Fallback
        return "Ev Çözümleri";
    } finally {
        db.close();
    }
}
