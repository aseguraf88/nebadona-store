import z from 'zod'

export const designThemeSchema = z.object({
    name: z.string().trim().min(1, 'El nombre es requerido').max(100),
})
