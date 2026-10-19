import mongoose from 'mongoose'

// Intentos de login de la app de ventas (paso 67b), uno por email + IP.
// Viven en la base y no en memoria: en Vercel cada instancia tiene su
// propia memoria, así que un contador ahí se reiniciaría por instancia.
// La clave se crea aunque el email no sea de ninguna cuenta, para que el
// 429 no revele qué cuentas existen. MongoDB borra cada documento cuando
// pasa expiresAt (índice TTL), pero el borrado puede tardar hasta un
// minuto: el controlador no confía en eso y reinicia la ventana si
// expiresAt ya pasó
const SalesLoginAttemptSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
    },
    count: {
        type: Number,
        required: true,
        default: 0,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
})

SalesLoginAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model('SalesLoginAttempt', SalesLoginAttemptSchema)
