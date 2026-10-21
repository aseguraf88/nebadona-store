import FairStockModel from '../models/FairStockModel.js'
import ProductModel from '../models/ProductModel.js'

// Hermana de adjustVariantStock (variantStock.js) para el stock de la
// feria (paso 67c-1): misma forma de llamarla y de responder, pero sobre
// FairStock (una fila por feria y sku) en vez de variants.$.stock.
//
// mode:
// - 'conditional': solo descuenta si alcanza (stock >= cantidad) y nunca
//   crea la fila. La usará la devolución del sobrante a la web al cerrar
//   la feria (67e).
// - 'allowNegative': aplica siempre y, si la fila no existe, la crea
//   (upsert). El traspaso suma así; las ventas (67c) restarán así: vender
//   algo que no se traspasó deja la fila en negativo, que se revisa al
//   cierre.
// $inc no pasa por los validadores de Mongoose: en el modo condicional el
// mínimo lo garantiza el filtro. Con session, todo ocurre dentro de esa
// transacción; dos upsert simultáneos de una misma fila nueva chocan como
// conflicto transitorio y la transacción se reintenta.
//
// Devuelve:
// - { status: 'ok', stock }            stock resultante
// - { status: 'insufficient', stock }  stock actual, sin cambios
// - { status: 'not_found' }            no hay fila (solo en conditional)
export const adjustFairStock = async ({
    fairId,
    sku,
    delta,
    mode,
    productId = null,
    session = null,
}) => {
    if (!Number.isInteger(delta) || delta === 0) {
        throw new Error(`adjustFairStock: delta inválido (${delta})`)
    }
    if (mode !== 'conditional' && mode !== 'allowNegative') {
        throw new Error(`adjustFairStock: mode inválido (${mode})`)
    }

    const filter = { fair: fairId, sku }
    if (mode === 'conditional' && delta < 0) {
        filter.stock = { $gte: -delta }
    }
    const upsert = mode === 'allowNegative'
    const update = { $inc: { stock: delta } }
    if (upsert) update.$setOnInsert = { product: productId }

    const updated = await FairStockModel.findOneAndUpdate(filter, update, {
        new: true,
        upsert,
        session,
        lean: true,
    })
    if (updated) return { status: 'ok', stock: updated.stock }

    // Sin efecto (solo en conditional): o no hay fila, o no alcanzaba
    const current = await FairStockModel.findOne(
        { fair: fairId, sku },
        { stock: 1 },
        { session, lean: true },
    )
    if (!current) return { status: 'not_found' }
    return { status: 'insufficient', stock: current.stock }
}

// Traspaso en lote (paso 67c-1): las mismas dos operaciones que
// adjustVariantStock en 'conditional' y adjustFairStock en
// 'allowNegative', pero con una ida y vuelta por lado en vez de una por
// línea. Solo dentro de una transacción (session obligatoria): si algo
// no coincide, quien llama lanza y se deshace todo. variantStock.js no se
// toca.
//
// Cómo se sabe si todas las líneas se aplicaron, sin depender del orden:
// cada operación encuentra a lo sumo un documento (variants.sku y
// {fair, sku} son únicos), así que la suma de coincidencias del lote es
// igual a la cantidad de líneas solo si todas coincidieron.

// Baja de la web con la misma condición que adjustVariantStock en
// 'conditional': la variante del sku con stock >= cantidad. Devuelve true
// si se aplicaron todas las líneas
export const decrementWebStockBulk = async ({ lines, session }) => {
    if (!session) {
        throw new Error('decrementWebStockBulk: requiere session (una transacción)')
    }
    const result = await ProductModel.bulkWrite(
        lines.map(({ sku, quantity }) => ({
            updateOne: {
                filter: {
                    variants: { $elemMatch: { sku, stock: { $gte: quantity } } },
                },
                update: { $inc: { 'variants.$.stock': -quantity } },
            },
        })),
        { session, ordered: true },
    )
    return result.matchedCount === lines.length
}

// Suma a la feria con upsert y $inc, como adjustFairStock en
// 'allowNegative' (la fila nueva nace con su producto). Devuelve el stock
// resultante por sku, o null si alguna línea no se aplicó
export const incrementFairStockBulk = async ({
    fairId,
    lines,
    productIdBySku,
    session,
}) => {
    if (!session) {
        throw new Error('incrementFairStockBulk: requiere session (una transacción)')
    }
    const result = await FairStockModel.bulkWrite(
        lines.map(({ sku, quantity }) => ({
            updateOne: {
                filter: { fair: fairId, sku },
                update: {
                    $inc: { stock: quantity },
                    $setOnInsert: { product: productIdBySku.get(sku) ?? null },
                },
                upsert: true,
            },
        })),
        { session, ordered: true },
    )
    if (result.matchedCount + result.upsertedCount !== lines.length) return null

    const rows = await FairStockModel.find(
        { fair: fairId, sku: { $in: lines.map((line) => line.sku) } },
        { sku: 1, stock: 1 },
        { session, lean: true },
    )
    return new Map(rows.map((row) => [row.sku, row.stock]))
}
