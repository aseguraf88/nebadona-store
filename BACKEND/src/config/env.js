import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const REQUIRED_STRING_VARS = [
    'MONGO_DB_URI',
    'MONGO_DB_USER',
    'MONGO_DB_PASSWORD',
    'MONGO_DB_NAME',
    'FRONTEND_URL',
]

const requiredVarsShape = Object.fromEntries(
    REQUIRED_STRING_VARS.map((name) => [
        name,
        z.string().min(1, `${name} es requerido`),
    ])
)

const envSchema = z
    .object({
        ...requiredVarsShape,
        JWT_SECRET: z
            .string()
            .min(16, 'JWT_SECRET debe tener al menos 16 caracteres'),
        CLOUDINARY_URL: z.string().optional(),
        CLOUDINARY_CLOUD_NAME: z.string().optional(),
        CLOUDINARY_API_KEY: z.string().optional(),
        CLOUDINARY_API_SECRET: z.string().optional(),
        NODE_ENV: z
            .enum(['development', 'production', 'test'])
            .default('development'),
    })
    .refine(
        (data) =>
            Boolean(data.CLOUDINARY_URL) ||
            (Boolean(data.CLOUDINARY_CLOUD_NAME) &&
                Boolean(data.CLOUDINARY_API_KEY) &&
                Boolean(data.CLOUDINARY_API_SECRET)),
        {
            message:
                'Falta configuración de Cloudinary: CLOUDINARY_URL, o las tres variables CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET juntas',
            path: ['CLOUDINARY_URL'],
        }
    )

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
    console.error('❌ Variables de entorno inválidas o faltantes:')
    console.error(parsed.error.flatten().fieldErrors)
    process.exit(1)
}

export const env = parsed.data
