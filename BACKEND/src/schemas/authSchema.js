import { z } from 'zod'

export const registerSchema = z.object({
    username: z.string().min(3).max(20),
    // En minúscula: el login busca el email exacto, y el índice único de
    // UserModel distingue mayúsculas (Juan@ y juan@ serían dos cuentas)
    email: z.email().toLowerCase().min(6).max(254),
    password: z.string().min(6).max(254),
})

export const loginSchema = z.object({
    email: z.email().toLowerCase().min(6).max(254),
    password: z.string().min(6).max(254),
})
