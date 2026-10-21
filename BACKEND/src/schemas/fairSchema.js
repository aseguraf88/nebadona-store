import z from 'zod'

// Límites del traspaso (Parte 1 del 67c-1). Si la prueba de 100 líneas
// (caso 18) pasa de unos 5 segundos, se baja MAX_TRANSFER_LINES
export const MAX_TRANSFER_LINES = 100
export const MAX_TRANSFER_QUANTITY = 1000

export const openFairSchema = z.object({
    name: z.string().trim().min(3).max(100),
})

// Un SKU repetido es un error y no se suma: el cuerpo es exactamente lo
// que queda registrado en el historial
export const transferSchema = z
    .object({
        requestId: z.uuid(),
        lines: z
            .array(
                z.object({
                    sku: z.string().trim().min(3).max(50).toUpperCase(),
                    quantity: z.number().int().min(1).max(MAX_TRANSFER_QUANTITY),
                }),
            )
            .min(1)
            .max(MAX_TRANSFER_LINES),
    })
    .superRefine((data, ctx) => {
        const seen = new Set()
        data.lines.forEach((line, index) => {
            if (seen.has(line.sku)) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['lines', index, 'sku'],
                    message: `SKU repetido en el traspaso: ${line.sku}. Junta las cantidades en una sola línea.`,
                })
            }
            seen.add(line.sku)
        })
    })

// before: el _id del último movimiento recibido (paginación)
export const movementsQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(200).default(50),
    before: z
        .string()
        .regex(/^[0-9a-f]{24}$/i)
        .optional(),
})
