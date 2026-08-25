import dotenv from 'dotenv'
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
dotenv.config()

// Crear cliente con la configuración del access token
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
})

// Envolver las operaciones que usamos en la app para mantener compatibilidad
const api = {
    preferences: {
        create: (payload) => new Preference(client).create({ body: payload }),
    },
    payment: {
        get: (id) => new Payment(client).get({ id }),
    },
}

export default api
