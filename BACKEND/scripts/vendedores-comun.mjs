// Utilidades de crear-vendedor.mjs y gestionar-vendedor.mjs (paso 67b).
// Se corren desde la carpeta BACKEND, en una ventana propia de PowerShell
// y no con "!" desde Claude Code: así nada de lo que se escribe o se
// muestra pasa por la conversación. Nunca imprimen contraseñas, hashes
// ni la cadena de conexión
import 'dotenv/config'
import dns from 'node:dns/promises'
import readline from 'node:readline/promises'
import mongoose from 'mongoose'

dns.setServers(['1.1.1.1', '8.8.8.8']) // igual que configdb.js

const CR = String.fromCharCode(13)
const LF = String.fromCharCode(10)
const CTRL_C = String.fromCharCode(3)
const BACKSPACE = String.fromCharCode(8)
const DELETE = String.fromCharCode(127)
const ESC = String.fromCharCode(27)

// Arma la cadena igual que configdb.js y conecta con autoIndex y
// autoCreate en false: el índice lo crea el backend desplegado, no el
// script. Según el código de Mongoose 8.24.1 eso alcanza aunque
// UserModel se compile al importarlo, antes de conectar: Model.init
// espera la conexión antes de leer autoCreate y lee autoIndex después,
// y openUri guarda las dos opciones antes de conectar. Depende de
// bufferCommands en su valor por defecto (true). Comprobado en base
// de prueba el 18 de octubre de 2026. Si la conexión falla, muestra
// solo el tipo de error: el mensaje completo podría traer partes de la
// cadena de conexión. Devuelve el nombre real de la base
export const connect = async () => {
    if (!process.env.MONGO_DB_URI) {
        throw new Error(
            'Falta MONGO_DB_URI. ¿Se corrió desde la carpeta BACKEND?',
        )
    }
    const uri = process.env.MONGO_DB_URI.replace(
        '<db_username>',
        process.env.MONGO_DB_USER,
    )
        .replace('<db_password>', process.env.MONGO_DB_PASSWORD)
        .replace('<db_name>', process.env.MONGO_DB_NAME)
    try {
        await mongoose.connect(uri, { autoIndex: false, autoCreate: false })
    } catch (error) {
        const code = error.code ? `, código ${error.code}` : ''
        throw new Error(`No se pudo conectar a la base (${error.name}${code}).`)
    }
    return mongoose.connection.db.databaseName
}

export const disconnect = () => mongoose.disconnect()

// Se niega a seguir si todavía no existe el índice único de sellerCode
// (UserModel.js): sin él, dos cuentas podrían quedar con la misma letra.
// Solo lee la lista de índices. Si la colección users no existe, el
// servidor responde con el error 26 (NamespaceNotFound): cuenta como
// "sin índice"
export const requireSellerCodeIndex = async () => {
    let indexes = []
    try {
        indexes = await mongoose.connection.db.collection('users').indexes()
    } catch (error) {
        if (error?.code !== 26) throw error
    }
    const found = indexes.some(
        (index) =>
            index.unique === true &&
            index.key?.sellerCode === 1 &&
            index.partialFilterExpression,
    )
    if (!found) {
        throw new Error(
            'La colección users no tiene el índice único de sellerCode. ' +
                'Despliega el backend del paso 67b y vuelve a intentar.',
        )
    }
}

// Ctrl+C: sin un oyente de 'SIGINT', readline solo pausa la entrada, la
// pregunta queda pendiente y la conexión a la base mantiene vivo el
// proceso. Con el oyente, la pregunta se cancela, main muestra "No se
// hizo: Cancelado." y el finally desconecta
const askVisible = async (question) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    const ac = new AbortController()
    rl.once('SIGINT', () => ac.abort())
    try {
        return (await rl.question(question, { signal: ac.signal })).trim()
    } catch (error) {
        if (error?.name === 'AbortError') throw new Error('Cancelado.')
        throw error
    } finally {
        rl.close()
    }
}

// Lee una línea sin mostrar lo que se escribe (ni asteriscos). Exige una
// terminal interactiva: con "!" desde Claude Code no lo es, y se niega
const askHidden = (question) =>
    new Promise((resolve, reject) => {
        const { stdin, stdout } = process
        if (!stdin.isTTY) {
            reject(
                new Error(
                    'Hace falta una terminal interactiva: corre el script en tu propia ventana de PowerShell.',
                ),
            )
            return
        }
        let value = ''
        const finish = (error) => {
            stdin.off('data', onData)
            stdin.setRawMode(false)
            stdin.pause()
            console.log()
            if (error) reject(error)
            else resolve(value)
        }
        const onData = (chunk) => {
            // Una flecha u otra tecla especial llega como ESC [ D: se
            // ignora completa. Un pegado nunca empieza con ESC
            if (chunk[0] === ESC) return
            for (const char of chunk) {
                if (char === CR || char === LF) return finish()
                if (char === CTRL_C) return finish(new Error('Cancelado.'))
                if (char === BACKSPACE || char === DELETE) {
                    value = value.slice(0, -1)
                } else if (char.charCodeAt(0) >= 32) {
                    value += char
                }
            }
        }
        stdout.write(question)
        stdin.setRawMode(true)
        stdin.setEncoding('utf8')
        stdin.resume()
        stdin.on('data', onData)
    })

// Dos veces y sin mostrarla. Mínimo 12 caracteres; máximo 72 bytes,
// porque bcrypt ignora lo que pasa de ahí
export const askNewPassword = async () => {
    const first = await askHidden('Contraseña nueva (no se muestra): ')
    if (first.length < 12) {
        throw new Error('La contraseña debe tener al menos 12 caracteres.')
    }
    if (Buffer.byteLength(first, 'utf8') > 72) {
        throw new Error('La contraseña es demasiado larga (máximo 72 bytes).')
    }
    const second = await askHidden('Repítela: ')
    if (first !== second) throw new Error('Las contraseñas no coinciden.')
    return first
}

export const confirmByTyping = async (sellerCode) => {
    const typed = await askVisible(
        `Para confirmar, escribe la letra del vendedor (${sellerCode}): `,
    )
    if (typed !== sellerCode) {
        throw new Error('Confirmación incorrecta: no se hizo ningún cambio.')
    }
}
