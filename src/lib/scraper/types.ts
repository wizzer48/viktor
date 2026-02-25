export type Brand = 'Legrand' | 'Interra' | 'EAE' | 'Serista' | 'Core' | 'Hager' | 'Astrum' | 'Bticino' | string;

export interface Variant {
    group?: string;
    name: string;
    hex?: string;
    image?: string;
}

export interface RawProductData {
    title: string;
    description: string;
    originalCategory: string;
    rawImageUrl: string;
    rawImages?: string[]; // Multiple images support
    rawPdfUrl: string;
    sourceUrl: string;
    specs: Record<string, string>;
    features?: string[];
    downloads?: { title: string; url: string; }[];
    videos?: string[];
    variants?: Variant[];
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
    features?: string[]; // Rich feature bullet points
    downloads?: { title: string; url: string; }[]; // PDF links
    videos?: string[]; // Video embeds
    variants?: Variant[]; // Color and Material variants
    lastUpdated: string; // ISO Date String
}

export interface ScraperOptions {
    url: string;
    brand: Brand;
    headers?: Record<string, string>;
    cookies?: { name: string; value: string; domain: string }[]; // For bypassing auth/bot detection
}

export interface ScrapeResult {
    success: boolean;
    message: string;
    data?: Product;
}
