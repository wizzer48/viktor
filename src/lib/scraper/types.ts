export type Brand = 'Legrand' | 'Interra' | 'EAE' | 'Core' | 'Hager' | 'Astrum' | 'Bticino' | string;

export interface RawProductData {
    title: string;
    description: string;
    originalCategory: string;
    rawImageUrl: string;
    rawImages?: string[]; // Multiple images support
    rawPdfUrl: string;
    sourceUrl: string;
    specs: Record<string, string>;
}

export interface Product {
    id: string; // SKU or generated UUID
    brand: Brand;
    name: string;
    category: string; // Normalized Category (from category-map.json)
    subCategory?: string; // Optional sub-category
    originalCategory: string; // Manufacturer Category
    description: string;

    // Media
    imagePath: string; // Primary image (legacy support)
    images?: string[]; // Multiple images support

    datasheetPath?: string; // Local path: /uploads/docs/xyz.pdf
    sourceUrl: string;
    price?: string;
    specs?: Record<string, string>; // Key-value pairs for technical specs
    lastUpdated: string; // ISO Date String
}

export interface ScraperOptions {
    url: string;
    brand: Brand;
    headers?: Record<string, string>;
    cookies?: any[]; // For bypassing auth/bot detection
}

export interface ScrapeResult {
    success: boolean;
    message: string;
    data?: Product;
}
