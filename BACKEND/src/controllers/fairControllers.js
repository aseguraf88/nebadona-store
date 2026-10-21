import mongoose from 'mongoose'
import { ZodError } from 'zod'
import FairModel from '../models/FairModel.js'
import FairStockModel from '../models/FairStockModel.js'
import FairMovementModel from '../models/FairMovementModel.js'
import ProductModel from '../models/ProductModel.js'
import {
    decrementWebStockBulk,
    incrementFairStockBulk,
} from '../services/fairStock.js'
import {
    openFairSchema,
    transferSchema,
    movementsQuerySchema,
} from '../schemas/fairSchema.js'
import { formatZodError } from '../utils/formatZodError.js'

// Error con respuesta propia: se lanza dentro de la transacción para
// deshacerla entera y se traduce a respuesta fuera de ella (mismo patrón
// que OrderStatusConflict en orderControllers.js)
class FairRequestError extends Error {
    constructor(status, message) {
        super(message)
        this.name = 'FairRequestError'
        this.status = status
    }
}

const fairNotFound = (res) =>
    res.status(404).json({ message: 'Feria no encontrada.' })

// "Nombre (talla, color)"; solo el nombre si la variante no tiene ninguno
const variantLabel = (name, variant) => {
    const detail = [variant.size, variant.baseColor].filter(Boolean).join(', ')
    return detail ? `${name} (${detail})` : name
}

// Producto y variante de cada sku pedido, en una sola consulta. Sin
// cost_price (select: false en el modelo y fuera de la proyección)
const variantsBySku = async (skus, session = null) => {
    const products = await ProductModel.find(
        { 'variants.sku': { $in: skus } },
        { name: 1, variants: 1 },
        { session, lean: true },
    )
    const bySku = new Map()
    for (const product of products) {
        for (const variant of product.variants) {
            if (skus.includes(variant.sku)) {
                bySku.set(variant.sku, { product, variant })
            }
        }
    }
    return bySku
}

// Mismo traspaso: misma feria y exactamente las mismas líneas
const isSameTransfer = (movements, fairId, lines) =>
    movements.length === lines.length &&
    movements.every(
        (m) => m.type === 'transfer' && String(m.fair) === String(fairId),
    ) &&
    lines.every((line) =>
        movements.some(
            (m) => m.sku === line.sku && m.fairDelta === line.quantity,
        ),
    )

// Respuesta del traspaso, en el orden de las líneas pedidas. En una
// repetición, los saldos son los de cuando se aplicó (vienen del historial)
const transferBody = (fair, requestId, lines, movements, replayed) => ({
    fair: { _id: fair._id, name: fair.name, status: fair.status },
    requestId,
    replayed,
    lines: lines.map((line) => {
        const m = movements.find((movement) => movement.sku === line.sku)
        return {
            sku: m.sku,
            label: m.label,
            quantity: m.fairDelta,
            webStock: m.webStockAfter,
            fairStock: m.fairStockAfter,
        }
    }),
})

// POST /api/fair: abre una feria. La segunda abierta choca con el índice
// único parcial de FairModel (E11000)
export const openFair = async (req, res) => {
    try {
        const { name } = openFairSchema.parse(req.body)
        const fair = await FairModel.create({ name, openedBy: req.user._id })
        return res.status(201).json({ fair })
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json(formatZodError(error, req.body))
        }
        if (error?.code === 11000) {
            return res.status(409).json({
                message: 'Ya hay una feria abierta: solo puede haber una a la vez.',
            })
        }
        console.error('Error openFair:', error)
        return res.status(500).json({ message: 'Error al abrir la feria.' })
    }
}

// POST /api/fair/:fairId/transfers: de la web a la feria, todo o nada.
// La web baja con 'conditional' (nunca bajo cero) y la feria sube; un SKU
// inexistente (400) o uno que no alcanza (409) deshace todas las líneas.
// Idempotente por requestId: un reintento con las mismas líneas responde
// 200 con replayed: true y no vuelve a aplicar nada
export const createTransfer = async (req, res) => {
    try {
        const { fairId } = req.params
        if (!mongoose.isValidObjectId(fairId)) return fairNotFound(res)
        const { requestId, lines } = transferSchema.parse(req.body)

        let result = null
        await mongoose.connection.transaction(async (session) => {
            // El driver puede reintentar el callback ante un error
            // transitorio: cada intento empieza de cero
            result = null

            const fair = await FairModel.findById(fairId, null, {
                session,
                lean: true,
            })
            if (!fair) throw new FairRequestError(404, 'Feria no encontrada.')

            const previous = await FairMovementModel.find({ requestId }, null, {
                session,
                lean: true,
            })
            if (previous.length > 0) {
                if (!isSameTransfer(previous, fair._id, lines)) {
                    throw new FairRequestError(
                        409,
                        'Ese requestId ya se usó con otros datos. No se traspasó nada.',
                    )
                }
                result = {
                    status: 200,
                    body: transferBody(fair, requestId, lines, previous, true),
                }
                return
            }

            if (fair.status !== 'open') {
                throw new FairRequestError(
                    409,
                    'La feria está cerrada: no admite traspasos.',
                )
            }

            // Una lectura de los productos de todas las líneas, dentro de la
            // transacción: nombra lo que falla antes de escribir y da el
            // producto, la etiqueta y el stock web de cada línea. Se revisan
            // todas para nombrar juntos los problemas
            const bySku = await variantsBySku(
                lines.map((line) => line.sku),
                session,
            )
            const missing = lines
                .filter((line) => !bySku.has(line.sku))
                .map((line) => line.sku)
            if (missing.length > 0) {
                throw new FairRequestError(
                    400,
                    `SKU inexistente: ${missing.join(', ')}. No se traspasó nada.`,
                )
            }
            const insufficient = lines
                .filter((line) => bySku.get(line.sku).variant.stock < line.quantity)
                .map(
                    (line) =>
                        `${line.sku} (disponible ${bySku.get(line.sku).variant.stock}, pedido ${line.quantity})`,
                )
            if (insufficient.length > 0) {
                throw new FairRequestError(
                    409,
                    `No alcanza: ${insufficient.join('; ')}. No se traspasó nada.`,
                )
            }

            // Web y feria en un lote cada una. La baja lleva la misma
            // condición que adjustVariantStock: si otra petición cambió ese
            // stock después de la lectura, la transacción choca y se
            // reintenta desde el principio. Si aun así una línea no
            // coincide, se deshace todo
            if (!(await decrementWebStockBulk({ lines, session }))) {
                throw new FairRequestError(
                    409,
                    'El stock de la web cambió durante el traspaso. Vuelve a intentarlo; no se traspasó nada.',
                )
            }
            const productIdBySku = new Map(
                [...bySku].map(([sku, found]) => [sku, found.product._id]),
            )
            const fairStockBySku = await incrementFairStockBulk({
                fairId: fair._id,
                lines,
                productIdBySku,
                session,
            })
            if (!fairStockBySku) {
                throw new Error('incrementFairStockBulk: no se aplicaron todas las líneas')
            }

            const movements = lines.map(({ sku, quantity }) => {
                const found = bySku.get(sku)
                return {
                    fair: fair._id,
                    type: 'transfer',
                    requestId,
                    sku,
                    product: found.product._id,
                    label: variantLabel(found.product.name, found.variant),
                    fairDelta: quantity,
                    webDelta: -quantity,
                    fairStockAfter: fairStockBySku.get(sku),
                    // La lectura es de esta misma transacción y la baja
                    // coincidió: el saldo es lo leído menos lo traspasado
                    webStockAfter: found.variant.stock - quantity,
                    createdBy: req.user._id,
                }
            })
            const saved = await FairMovementModel.insertMany(movements, {
                session,
            })
            result = {
                status: 201,
                body: transferBody(
                    fair,
                    requestId,
                    lines,
                    saved.map((m) => m.toObject()),
                    false,
                ),
            }
        })

        return res.status(result.status).json(result.body)
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json(formatZodError(error, req.body))
        }
        if (error instanceof FairRequestError) {
            return res.status(error.status).json({ message: error.message })
        }
        // Índice único de requestId: otra petición con el mismo requestId
        // alcanzó a registrarse primero
        if (error?.code === 11000) {
            return res.status(409).json({
                message:
                    'Ese traspaso ya se registró. Recarga la página para ver el stock actual.',
            })
        }
        console.error('Error createTransfer:', error)
        return res
            .status(500)
            .json({ message: 'Error al traspasar a la feria.' })
    }
}

// GET /api/fair/current: la feria abierta y su stock, con el stock web
// actual de cada sku. { fair: null } si no hay ninguna abierta
export const getCurrentFair = async (req, res) => {
    try {
        const fair = await FairModel.findOne({ status: 'open' }).lean()
        if (!fair) return res.status(200).json({ fair: null, stock: [], totalUnits: 0 })

        const rows = await FairStockModel.find({ fair: fair._id })
            .sort({ sku: 1 })
            .lean()
        const bySku = await variantsBySku(rows.map((row) => row.sku))
        const stock = rows.map((row) => {
            const found = bySku.get(row.sku)
            return {
                sku: row.sku,
                product: row.product ?? null,
                name: found?.product.name ?? null,
                size: found?.variant.size ?? null,
                baseColor: found?.variant.baseColor ?? null,
                fairStock: row.stock,
                // null si la variante ya no existe en la web
                webStock: found ? found.variant.stock : null,
            }
        })
        const totalUnits = stock.reduce((sum, row) => sum + row.fairStock, 0)
        return res.status(200).json({ fair, stock, totalUnits })
    } catch (error) {
        console.error('Error getCurrentFair:', error)
        return res
            .status(500)
            .json({ message: 'Error al obtener la feria.' })
    }
}

// GET /api/fair/:fairId/movements?limit=50&before=<_id>: del más nuevo al
// más viejo. nextBefore es el before de la página siguiente (null si no
// hay más)
export const getFairMovements = async (req, res) => {
    try {
        const { fairId } = req.params
        if (!mongoose.isValidObjectId(fairId)) return fairNotFound(res)
        const { limit, before } = movementsQuerySchema.parse(req.query)

        const fair = await FairModel.findById(fairId, { _id: 1 }).lean()
        if (!fair) return fairNotFound(res)

        const filter = { fair: fair._id }
        if (before) filter._id = { $lt: new mongoose.Types.ObjectId(before) }
        const movements = await FairMovementModel.find(filter)
            .sort({ _id: -1 })
            .limit(limit)
            .populate('createdBy', 'username')
            .lean()
        const nextBefore =
            movements.length === limit ? movements[movements.length - 1]._id : null
        return res.status(200).json({ movements, nextBefore })
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json(formatZodError(error, req.query))
        }
        console.error('Error getFairMovements:', error)
        return res
            .status(500)
            .json({ message: 'Error al obtener los movimientos.' })
    }
}
