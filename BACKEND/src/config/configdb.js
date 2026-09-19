import 'dotenv/config'
import dns from 'node:dns/promises'
import mongoose from 'mongoose'

dns.setServers(['1.1.1.1', '8.8.8.8']) // [1](https://www.muhammadhuzaifa.com/blog/fix-mongodb-querysrv-econnrefused-nodejs-atlas-dns-error)[2](https://dev.to/sampatakumar_sv_b10a6ce2/mongoose-econnrefused-error-querysrv-4kp0)

let isConnected = false

export const connectDB = async () => {
    if (isConnected) return
    try {
        const dbURI = process.env.MONGO_DB_URI.replace(
            '<db_username>',
            process.env.MONGO_DB_USER
        )
            .replace('<db_password>', process.env.MONGO_DB_PASSWORD)
            .replace('<db_name>', process.env.MONGO_DB_NAME)

        await mongoose.connect(dbURI)
        isConnected = true
        console.log('✅ Conectado a MongoDB')
    } catch (error) {
        console.error('❌ Error MongoDB:', error)
        throw error
    }
}

export const disconnectDB = async () => {
    try {
        await mongoose.disconnect()
        console.log('Base de datos MongoDB desconectada.')
    } catch (error) {
        console.log('Error al desconectarse desde MongoDB: ', error)
    }
}

// import mongoose from 'mongoose'

// export const connectDB = async () => {
//     try {
//         const dbURI = process.env.MONGO_DB_URI.replace(
//             '<db_username>',
//             process.env.MONGO_DB_USER
//         )
//             .replace('<db_password>', process.env.MONGO_DB_PASSWORD)
//             .replace('<db_name>', process.env.MONGO_DB_NAME)

//         await mongoose.connect(dbURI)
//         console.log('Conectado a mongodb')
//     } catch (error) {
//         console.error(error)
//     }
// }
