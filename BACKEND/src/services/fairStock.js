import FairStockModel from '../models/FairStockModel.js'

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
