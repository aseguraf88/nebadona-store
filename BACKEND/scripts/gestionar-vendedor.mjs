// Gestiona una cuenta de la app de ventas (paso 67b). Desde BACKEND:
//   node scripts/gestionar-vendedor.mjs --codigo A --revocar [--dry-run]
//   node scripts/gestionar-vendedor.mjs --codigo A --nueva-contrasena [--dry-run]
//   node scripts/gestionar-vendedor.mjs --codigo A --desbloquear [--dry-run]
// Una acción por vez:
// - --revocar: sube tokenVersion en 1. Todas las sesiones de ventas de
//   la cuenta dejan de valer en su próxima petición.
// - --nueva-contrasena: pide la nueva (oculta, dos veces), la guarda y
//   además sube tokenVersion.
// - --desbloquear: borra los contadores de intentos de login de la
//   cuenta, desde todas las IP.
// Solo actúa sobre cuentas con isSeller: true e isAdmin distinto de
// true: el admin y los clientes nunca se tocan. Con --dry-run muestra
// el estado y lo que haría, sin pedir la contraseña ni escribir nada
import { parseArgs } from 'node:util'
import bcrypt from 'bcryptjs'
import UserModel from '../src/models/UserModel.js'
import SalesLoginAttemptModel from '../src/models/SalesLoginAttemptModel.js'
import {
    askNewPassword,
    confirmByTyping,
    connect,
    disconnect,
} from './vendedores-comun.mjs'

const USAGE =
    'Uso: node scripts/gestionar-vendedor.mjs --codigo <letra> (--revocar | --nueva-contrasena | --desbloquear) [--dry-run]'
const ACTIONS = ['revocar', 'nueva-contrasena', 'desbloquear']

// Los argumentos no se repiten en los errores: si alguien escribiera ahí
// una contraseña por error, no quedaría en pantalla
const readArgs = () => {
    let values
    try {
        ;({ values } = parseArgs({
            options: {
                codigo: { type: 'string' },
                revocar: { type: 'boolean', default: false },
                'nueva-contrasena': { type: 'boolean', default: false },
                desbloquear: { type: 'boolean', default: false },
                'dry-run': { type: 'boolean', default: false },
            },
            strict: true,
        }))
    } catch {
        throw new Error(`Argumentos inválidos. ${USAGE}`)
    }
    const sellerCode = (values.codigo || '').trim().toUpperCase()
    if (!/^[A-Z]$/.test(sellerCode)) {
        throw new Error(`--codigo debe ser una sola letra (A-Z). ${USAGE}`)
    }
    const chosen = ACTIONS.filter((action) => values[action])
    if (chosen.length !== 1) {
        throw new Error(`Indica una sola acción. ${USAGE}`)
    }
    return { sellerCode, action: chosen[0], dryRun: values['dry-run'] }
}

// Claves de SalesLoginAttempt de un email: todas empiezan con "email|"
// (salesAuthControllers.js). '}' es el carácter siguiente a '|', así que
// este rango toma justo esas claves, sin expresiones regulares
const attemptKeysOf = (email) => ({
    key: { $gte: email + '|', $lt: email + '}' },
})

const main = async () => {
    const { sellerCode, action, dryRun } = readArgs()

    const dbName = await connect()
    console.log(`Base: ${dbName}`)

    const sellerFilter = { sellerCode, isSeller: true, isAdmin: { $ne: true } }
    const seller = await UserModel.findOne(sellerFilter)
        .select('email username sellerCode tokenVersion')
        .lean()
    if (!seller) {
        throw new Error(
            `No hay ninguna cuenta de vendedor con código ${sellerCode}. No se tocó nada.`,
        )
    }
    const version = seller.tokenVersion ?? 0
    const attempts = await SalesLoginAttemptModel.countDocuments(
        attemptKeysOf(seller.email),
    )

    console.log('Cuenta:')
    console.log(`  email:         ${seller.email}`)
    console.log(`  nombre:        ${seller.username}`)
    console.log(`  código:        ${seller.sellerCode}`)
    console.log(`  tokenVersion:  ${version}`)
    console.log(`  contadores de intentos de login: ${attempts}`)

    const plan = {
        revocar: `subir tokenVersion de ${version} a ${version + 1}: se cierran todas sus sesiones de ventas.`,
        'nueva-contrasena': `pedir la contraseña nueva, guardarla y subir tokenVersion de ${version} a ${version + 1}.`,
        desbloquear: `borrar ${attempts} contador(es) de intentos de login.`,
    }
    console.log(`Acción: ${plan[action]}`)
    if (dryRun) {
        console.log('--dry-run: no se pidió la contraseña ni se escribió nada.')
        return
    }

    if (action === 'desbloquear') {
        await confirmByTyping(sellerCode)
        const { deletedCount } = await SalesLoginAttemptModel.deleteMany(
            attemptKeysOf(seller.email),
        )
        console.log(`Contadores borrados: ${deletedCount}.`)
        return
    }

    const update = { $inc: { tokenVersion: 1 } }
    if (action === 'nueva-contrasena') {
        const password = await askNewPassword()
        update.$set = { password: await bcrypt.hash(password, 10) }
    }
    await confirmByTyping(sellerCode)

    // El filtro repite las condiciones de vendedor: si la cuenta cambió
    // mientras corría el script, no se toca
    const updated = await UserModel.findOneAndUpdate(
        { _id: seller._id, ...sellerFilter },
        update,
        { new: true, projection: { tokenVersion: 1 }, lean: true },
    )
    if (!updated) {
        throw new Error(
            'La cuenta cambió o dejó de ser de vendedor mientras corría el script. No se tocó nada.',
        )
    }
    console.log(
        action === 'revocar'
            ? `Sesiones revocadas: tokenVersion ahora es ${updated.tokenVersion}.`
            : `Contraseña cambiada y sesiones revocadas: tokenVersion ahora es ${updated.tokenVersion}. ` +
                  'La contraseña no se mostró ni se guardó en ningún archivo.',
    )
}

try {
    await main()
} catch (error) {
    console.error(`No se hizo: ${error.message}`)
    process.exitCode = 1
} finally {
    await disconnect()
}
