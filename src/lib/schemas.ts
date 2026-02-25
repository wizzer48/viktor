import { z } from 'zod';

export const ProductSchema = z.object({
    id: z.string().optional(), // Generated on server if missing
    brand: z.enum(['Legrand', 'Interra', 'EAE', 'Core', 'Viko', 'Schneider', 'Siemens', 'Abb', 'Zennio', 'Somfy', 'Dahua', 'Hikvision', 'Ajax', 'KnX', 'Panasonic', 'LG', 'Samsung', 'Daikin'] as const), // Add other brands as needed from sources.json
    name: z.string().min(2, "Product name must be at least 2 characters"),
    category: z.string().min(1, "Category is required"),
    description: z.string().optional(),
    specs: z.record(z.string(), z.string()).optional(),
    features: z.array(z.string()).optional(),
    downloads: z.array(z.object({ title: z.string(), url: z.string() })).optional(),
    videos: z.array(z.string()).optional(),
    variants: z.array(z.object({
        group: z.string().optional(),
        name: z.string(),
        hex: z.string().optional(),
        image: z.string().optional()
    })).optional(),
    // Files are handled separately in FormData but we can validate other fields here
});

export const ProjectSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Project name must be at least 2 characters"),
    location: z.string().optional(),
    year: z.string().regex(/^\d{4}$/, "Year must be a 4-digit number").optional(),
    description: z.string().optional(),
    tags: z.string().optional(), // Received as comma-separated string from FormData
});

export const ContactSchema = z.object({
    name: z.string().min(2, { message: 'İsim en az 2 karakter olmalıdır.' }),
    email: z.string().email({ message: 'Geçersiz e-posta adresi.' }),
    subject: z.string().min(1, { message: 'Lütfen bir konu seçiniz.' }),
    message: z.string().min(10, { message: 'Mesajınız en az 10 karakter olmalıdır.' }),
});
