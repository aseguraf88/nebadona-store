import z from 'zod'
import { COLOR_FAMILY_NAMES } from '../constants/colorFamilies.js'

const imageInputSchema = z.string().refine((value) => {
    if (value.startsWith('data:image/')) return true

    try {
        new URL(value)
        return true
    } catch {
        return false
    }
}, 'Formato de imagen invalido')

const colorOptionSchema = z.object({
    name: z.string().min(1).max(40),
    hex: z.string().regex(/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/, 'Color hexadecimal invalido'),
    percentage: z.number().min(0).max(100).optional(),
    source: z.enum(['auto', 'manual', 'fallback']).optional(),
    selected: z.boolean().optional(),
})

export const productSchema = z.object({
    name: z.string().min(3).max(50),
    description: z.string().min(20).max(200),
    price: z.number().min(0),
    stock: z.number().min(0),
    sku: z
        .string()
        .min(3)
        .max(50)
        .regex(/^[A-Za-z0-9-]+$/, 'SKU invalido. Usa solo letras, numeros y guiones.')
        .optional(),
    imageUrl: imageInputSchema.optional(),
    imageUrls: z.array(imageInputSchema).max(6).optional(),
    color: z.string().max(50).optional(),
    colors: z.array(colorOptionSchema).max(4).optional(),
    colorFamily: z
        .array(z.enum(COLOR_FAMILY_NAMES))
        .min(1, 'Debe incluir al menos una familia de color')
        .max(4, 'Maximo 4 familias de color')
        .optional(),
    featured: z.boolean().optional(),
    popular: z.boolean().optional(),
    compareAtPrice: z.number().min(0).optional().nullable(),
    tags: z.array(z.string().max(30)).max(10).optional(),
    isActive: z.boolean().optional(),
    size: z.string().max(100).optional(),
    sock_type: z.string().max(100).optional(),
    product_category: z.string().max(100).optional(),
    design_theme: z.string().max(100).optional(),
    franchise_name: z.string().max(100).optional(),
})
