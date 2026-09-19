import './config/env.js'
import { connectDB, disconnectDB } from './config/configdb.js'
import app from './app.js'

const PORT = 3001

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en puerto: ${PORT}`)
        })
    })
    .catch((error) => {
        console.error('No se pudo conectar a MongoDB, cerrando:', error)
        disconnectDB()
        process.exit(1)
    })
