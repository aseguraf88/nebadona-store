// Crea una cuenta de la app de ventas (paso 67b). Desde BACKEND:
//   node scripts/crear-vendedor.mjs --email ventas-a@nebadon.cl --codigo A --nombre Alejandro --dry-run
//   node scripts/crear-vendedor.mjs --email ventas-a@nebadon.cl --codigo A --nombre Alejandro
// Con --dry-run solo revisa y muestra qué haría: no pide la contraseña
// ni escribe nada. Sin --dry-run pide la contraseña (oculta, dos veces)
// y que se escriba la letra para confirmar. Solo crea: nunca modifica
// una cuenta que ya existe, sea de vendedor, de admin o de cliente
import { parseArgs } from 'node:util'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import UserModel from '../src/models/UserModel.js'
import {
    askNewPassword,
    confirmByTyping,
    connect,
    disconnect,
    requireSellerCodeIndex,
} from './vendedores-comun.mjs'

const USAGE =
    'Uso: node scripts/crear-vendedor.mjs --email <email> --codigo <letra> --nombre <nombre> [--dry-run]'

// Los argumentos no se repiten en los errores: si alguien escribiera ahí
// una contraseña por error, no quedaría en pantalla
const readArgs = () => {
    let values
    try {
        ;({ values } = parseArgs({
            options: {
                email: { type: 'string' },
                codigo: { type: 'string' },
                nombre: { type: 'string' },
                'dry-run': { type: 'boolean', default: false },
            },
            strict: true,
        }))
    } catch {
        throw new Error(`Argumentos inválidos. ${USAGE}`)
    }
    const email = z.email().toLowerCase().min(6).max(254).safeParse(values.email)
    if (!email.success) throw new Error(`Falta --email o no es válido. ${USAGE}`)
    const sellerCode = (values.codigo || '').trim().toUpperCase()
    if (!/^[A-Z]$/.test(sellerCode)) {
        throw new Error(`--codigo debe ser una sola letra (A-Z). ${USAGE}`)
    }
    const username = (values.nombre || '').trim()
    if (username.length < 3 || username.length > 20) {
        throw new Error(`--nombre debe tener entre 3 y 20 caracteres. ${USAGE}`)
    }
    return {
        email: email.data,
        sellerCode,
        username,
        dryRun: values['dry-run'],
    }
}

const main = async () => {
    const { email, sellerCode, username, dryRun } = readArgs()

    const dbName = await connect()
    console.log(`Base: ${dbName}`)
    await requireSellerCodeIndex()

    const byEmail = await UserModel.findOne({ email })
        .select('isSeller sellerCode')
        .lean()
    if (byEmail) {
        throw new Error(
            byEmail.isSeller
                ? `Ya existe una cuenta de vendedor con ese email (código ${byEmail.sellerCode}).`
                : 'Ese email ya es de una cuenta que no es de vendedor (admin o cliente). No se toca.',
        )
    }
    const byCode = await UserModel.findOne({ sellerCode }).select('email').lean()
    if (byCode) {
        throw new Error(`El código ${sellerCode} ya es de otra cuenta (${byCode.email}).`)
    }

    console.log('Cuenta a crear:')
    console.log(`  email:       ${email}`)
    console.log(`  nombre:      ${username}`)
    console.log(`  código:      ${sellerCode}`)
    console.log('  isSeller:    true')
    console.log('  isAdmin:     false')
    if (dryRun) {
        console.log('--dry-run: no se pidió la contraseña ni se escribió nada.')
        return
    }

    const password = await askNewPassword()
    await confirmByTyping(sellerCode)

    try {
        const created = await UserModel.create({
            email,
            username,
            password: await bcrypt.hash(password, 10),
            isAdmin: false,
            isSeller: true,
            sellerCode,
            tokenVersion: 0,
        })
        console.log(
            `Cuenta creada: ${created.email}, código ${created.sellerCode}. ` +
                'La contraseña no se mostró ni se guardó en ningún archivo.',
        )
    } catch (error) {
        if (error?.code === 11000) {
            throw new Error(
                'Otra cuenta tomó ese email o ese código mientras corría el script. No se creó nada.',
            )
        }
        throw error
    }
}

try {
    await main()
} catch (error) {
    console.error(`No se hizo: ${error.message}`)
    process.exitCode = 1
} finally {
    await disconnect()
}
