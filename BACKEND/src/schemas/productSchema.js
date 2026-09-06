import z from 'zod'

const variantSchema = z.object({
    sku: z.string().min(3).max(50).toUpperCase(),
    size: z.string().max(20).toUpperCase().nullable().optional(),
    baseColor: z.string().max(50).toLowerCase().nullable().optional(),
    designColors: z.array(z.string().toLowerCase()).optional().default([]),
    stock: z.number().min(0),
    price: z.number().min(0).nullable().optional(),
})

const imageInputSchema = z.string().refine((value) => {
    if (value.startsWith('data:image/')) return true
    try {
        new URL(value)
        return true
    } catch {
        return false
    }
}, 'Invalid image format')

export const productSchema = z.object({
    handle: z.string().min(3).max(50).toUpperCase(),
    name: z.string().min(3).max(100),
    description: z.string().max(1000).optional().default(''),

    product_category: z.string().min(2).max(100).toLowerCase(),
    gender: z.enum(['men', 'women', 'unisex', 'kids']).default('unisex'),
    material: z.string().max(100).toLowerCase().nullable().optional(),
    franchise_name: z.string().max(100).toLowerCase().nullable().optional(),
    character_name: z.string().max(100).toLowerCase().nullable().optional(),
    design_theme: z.string().max(100).toLowerCase().nullable().optional(),

    price: z.number().min(0),
    compareAtPrice: z.number().min(0).nullable().optional(),
    cost_price: z.number().min(0).nullable().optional(),

    imageUrl: imageInputSchema.optional(),
    imageUrls: z.array(imageInputSchema).max(6).optional(),
    isActive: z.boolean().optional(),
    featured: z.boolean().optional(),
    popular: z.boolean().optional(),
    tags: z.array(z.string()).optional().default([]),

    variants: z.array(variantSchema).min(1, 'At least one variant is required'),
    attributes: z
        .array(
            z.object({
                key: z.string(),
                value: z.string(),
            })
        )
        .optional()
        .default([]),

    status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
})
