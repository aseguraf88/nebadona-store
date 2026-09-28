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
}, 'Formato de imagen inválido')

const SIZE_STANDARD_IDS = [
    'bebe_0_6',
    'bebe_6_12',
    'bebe_12_24',
    'nino_2_4',
    'nino_5_7',
    'nino_8_10',
    'personalizado',
    'internacional',
]

// Talla EU de calzado, entera, dentro del tramo que cubren las opciones
const sizeRangeNumber = z.number().int().min(15).max(49).nullable().optional()

const productBaseSchema = z.object({
    handle: z.string().min(3).max(50).toUpperCase(),
    name: z.string().min(3).max(100),
    description: z.string().max(1000).optional().default(''),

    product_category: z.string().min(2).max(100).toLowerCase(),
    sock_type: z.string().max(100).nullable().optional(),
    gender: z.enum(['men', 'women', 'unisex', 'kids', 'babies']).default('unisex'),
    material: z.string().max(100).toLowerCase().nullable().optional(),
    fit_type: z.string().max(100).nullable().optional(),
    specifications: z.string().max(500).nullable().optional(),
    decoration_technique: z.string().max(100).nullable().optional(),
    size_standard: z.enum(SIZE_STANDARD_IDS).nullable().optional(),
    size_range_min: sizeRangeNumber,
    size_range_max: sizeRangeNumber,
    franchise_name: z.string().max(100).toLowerCase().nullable().optional(),
    character_name: z.string().max(100).toLowerCase().nullable().optional(),
    design_theme: z.string().max(100).toLowerCase().nullable().optional(),

    price: z.number().min(0),
    compareAtPrice: z.number().min(0).nullable().optional(),
    cost_price: z.number().min(0).nullable().optional(),

    imageUrl: z.union([imageInputSchema, z.literal('')]).optional(),
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

// El rango solo existe para Talla Única ('personalizado'). Se evalúa solo si
// size_standard viene en los datos (una edición que no lo toca, pasa).
const checkSizeRange = (data, ctx) => {
    if (data.size_standard === undefined) return
    const hasMin = data.size_range_min != null
    const hasMax = data.size_range_max != null
    if (data.size_standard === 'personalizado') {
        if (!hasMin || !hasMax) {
            ctx.addIssue({
                code: 'custom',
                path: ['size_range_min'],
                message: 'Talla Única requiere rango mínimo y máximo.',
            })
        } else if (data.size_range_min >= data.size_range_max) {
            ctx.addIssue({
                code: 'custom',
                path: ['size_range_min'],
                message: 'El rango mínimo debe ser menor que el máximo.',
            })
        }
    } else if (hasMin || hasMax) {
        ctx.addIssue({
            code: 'custom',
            path: ['size_range_min'],
            message: 'Solo Talla Única admite rango personalizado.',
        })
    }
}

export const productSchema = productBaseSchema.superRefine(checkSizeRange)

// En Zod 4, .partial() descarta los refine (probado): la edición arma su
// propio esquema con la misma regla aplicada después del .partial().
export const productUpdateSchema = productBaseSchema
    .partial()
    .superRefine(checkSizeRange)
