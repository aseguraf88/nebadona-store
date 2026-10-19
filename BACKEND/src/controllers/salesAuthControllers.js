import bcrypt from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import { ZodError } from 'zod'
import UserModel from '../models/UserModel.js'
import SalesLoginAttemptModel from '../models/SalesLoginAttemptModel.js'
import { salesLoginSchema } from '../schemas/salesAuthSchema.js'
import { formatZodError } from '../utils/formatZodError.js'
import {
    SALES_COOKIE_NAME,
    salesCookieOptions,
    signSalesToken,
} from '../services/salesSession.js'

// Login de la app de ventas (paso 67b): 5 intentos cada 15 minutos por
// email + IP. Por email + IP y no solo por email, para que alguien desde
// otra conexión no pueda bloquear a propósito a los vendedores
const MAX_ATTEMPTS = 5
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000

// Hash de un texto al azar que nadie conoce, con el mismo costo (10) que
// las contraseñas reales. Si la cuenta no existe se compara contra él,
// para que la respuesta tarde lo mismo y no revele qué emails existen.
// Se calcula al cargar el módulo, sin bloquear el arranque
const dummyHash = bcrypt.hash(randomUUID(), 10)

// Suma un intento en una sola operación: suma 1 si la ventana sigue
// abierta, o la reinicia en 1 si ya venció (el TTL puede tardar en borrar
// el documento). Si dos primeros intentos con la misma clave llegan a la
// vez, el upsert de uno puede chocar con el índice único (E11000): se
// reintenta una vez, y la segunda vez ya encuentra el documento
const bumpAttempt = async (key, now) => {
    const stillOpen = { $gt: ['$expiresAt', now] }
    // Update en forma de arreglo (pipeline): Mongoose 8 lo acepta sin
    // opciones y no lo castea. Si se sube a Mongoose 9, revisar si exige
    // updatePipeline: true
    const update = [
        {
            $set: {
                count: { $cond: [stillOpen, { $add: ['$count', 1] }, 1] },
                expiresAt: {
                    $cond: [
                        stillOpen,
                        '$expiresAt',
                        new Date(now.getTime() + ATTEMPT_WINDOW_MS),
                    ],
                },
            },
        },
    ]
    const options = {
        upsert: true,
        new: true,
        lean: true,
        setDefaultsOnInsert: false,
    }
    try {
        return await SalesLoginAttemptModel.findOneAndUpdate(
            { key },
            update,
            options,
        )
    } catch (error) {
        if (error?.code !== 11000) throw error
        return SalesLoginAttemptModel.findOneAndUpdate({ key }, update, options)
    }
}

export const salesLogin = async (req, res) => {
    try {
        const { email, password } = salesLoginSchema.parse(req.body)

        // Primero se suma el intento y después se revisa: dos intentos a
        // la vez no pueden pasar los dos con el contador en 4
        const key = `${email}|${req.ip}`
        const now = new Date()
        const attempt = await bumpAttempt(key, now)

        if (attempt.count > MAX_ATTEMPTS) {
            const seconds = Math.max(
                1,
                Math.ceil((new Date(attempt.expiresAt) - now) / 1000),
            )
            return res
                .set('Retry-After', String(seconds))
                .status(429)
                .json({
                    message:
                        'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
                })
        }

        // Solo cuentas de vendedor con código: el admin y los clientes no
        // inician sesión aquí
        const user = await UserModel.findOne({
            email,
            isSeller: true,
            isAdmin: { $ne: true },
            sellerCode: { $type: 'string' },
        })
            .select('password username sellerCode tokenVersion')
            .lean()

        // Siempre se llama a bcrypt, exista o no la cuenta
        const isPasswordValid = await bcrypt.compare(
            password,
            user?.password ?? (await dummyHash),
        )

        if (!user || !isPasswordValid) {
            return res.status(401).json({ message: 'Credenciales inválidas.' })
        }

        await SalesLoginAttemptModel.deleteOne({ key })

        const { token, expiresAt } = signSalesToken(user)

        res.cookie(SALES_COOKIE_NAME, token, {
            ...salesCookieOptions(),
            expires: expiresAt,
        })
            .status(200)
            .json({
                sellerCode: user.sellerCode,
                username: user.username,
                expiresAt,
            })
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json(formatZodError(error, req.body))
        }
        console.error('Error salesLogin:', error)
        return res
            .status(500)
            .json({ message: 'Error interno al iniciar sesión.' })
    }
}

// No pide sesión: borrar una cookie que no existe no hace daño. Usa los
// mismos atributos y el mismo path que al crearla, o el navegador no la
// borra
export const salesLogout = (req, res) => {
    res.clearCookie(SALES_COOKIE_NAME, salesCookieOptions())
        .status(200)
        .json({ message: 'Sesión de ventas cerrada.' })
}

// Va detrás de requireSeller. serverTime le sirve a la app para detectar
// un reloj del celular desfasado (control de 5 minutos del 67c)
export const salesMe = (req, res) => {
    res.status(200).json({
        sellerCode: req.seller.sellerCode,
        username: req.seller.username,
        expiresAt: req.salesSession.expiresAt,
        serverTime: new Date(),
    })
}
