import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 6,
        maxLength: 254,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 6,
        maxLength: 254,
    },
    username: {
        type: String,
        default: '',
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 20,
    },
    isAdmin: {
        type: Boolean,
        default: false,
        required: true,
    },
    // Cuentas de la app de ventas (paso 67b), separadas de las del admin y
    // de los clientes. Las crea scripts/crear-vendedor.mjs. Las cuentas que
    // ya existían no tienen estos campos: se leen como no vendedor y
    // versión 0, sin migración
    isSeller: {
        type: Boolean,
        default: false,
    },
    // Letra de la serie de números de venta (A-0001, B-0001). Sin valor
    // por defecto: un null también entraría en el índice único de abajo
    sellerCode: {
        type: String,
        uppercase: true,
        trim: true,
        match: /^[A-Z]$/,
    },
    // Sube en 1 para cerrar todas las sesiones de ventas de la cuenta
    // (revocar, nueva contraseña): requireSeller rechaza los tokens con
    // otra versión
    tokenVersion: {
        type: Number,
        default: 0,
        min: 0,
    },
})

// Único solo entre las cuentas que tienen sellerCode: las demás no
// entran en el índice. Mongoose lo crea al conectar
UserSchema.index(
    { sellerCode: 1 },
    {
        unique: true,
        partialFilterExpression: { sellerCode: { $type: 'string' } },
    },
)

export default mongoose.model('User', UserSchema)
