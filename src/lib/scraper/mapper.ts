import categoryMap from '@/data/category-map.json';
import { Brand } from './types';

// Define the structure of the JSON file for type safety
interface CategoryMap {
    GlobalRules: Record<string, string[]>;
    BrandSpecific: Record<string, Record<string, string>>;
}

const mapData = categoryMap as CategoryMap;

export function normalizeCategory(brand: Brand, originalCategory: string): string {
    if (!originalCategory) return "Ev Çözümleri";

    // 1. Check Brand Specific Rules first (High Priority)
    if (mapData.BrandSpecific[brand]) {
        const brandRules = mapData.BrandSpecific[brand];
        // Exact match check
        if (brandRules[originalCategory]) {
            return brandRules[originalCategory];
        }
        // Partial match check
        for (const [key, value] of Object.entries(brandRules)) {
            if (originalCategory.toLowerCase().includes(key.toLowerCase())) {
                return value;
            }
        }
    }

    // 2. Check Global Rules (Keyword based)
    for (const [targetCategory, keywords] of Object.entries(mapData.GlobalRules)) {
        for (const keyword of keywords) {
            if (originalCategory.toLowerCase().includes(keyword.toLowerCase())) {
                return targetCategory;
            }
        }
    }

    // 3. Fallback
    return "Ev Çözümleri";
}
