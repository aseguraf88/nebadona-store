import z from 'zod'

export const productCategorySchema = z.object({
    name: z.string().trim().min(1, 'El nombre es requerido').max(100),
})
