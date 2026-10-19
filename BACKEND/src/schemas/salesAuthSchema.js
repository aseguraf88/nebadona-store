import { z } from 'zod'

// Login de la app de ventas (paso 67b). El email va en minúscula, igual
// que en loginSchema (authSchema.js): el índice único de UserModel
// distingue mayúsculas. La contraseña solo pide al menos 1 carácter:
// el mínimo de 12 lo exige el script que crea la cuenta. Así cualquier
// intento con un email válido pasa por el contador de intentos y por
// bcrypt, y un intento corto no recibe una respuesta distinta
export const salesLoginSchema = z.object({
    email: z.email().toLowerCase().min(6).max(254),
    password: z.string().min(1).max(254),
})
