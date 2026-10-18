import ProductModel from '../models/ProductModel.js'

// Cambia el stock de una variante, buscada por sku, en una sola operación
// atómica ($inc): dos cambios simultáneos no se pisan (antes se leía, se
// restaba y se guardaba el valor final con save(), y uno de los dos se
// perdía). El índice único de variants.sku garantiza un solo producto.
//
// mode:
// - 'conditional': solo descuenta si alcanza (stock >= cantidad); nunca
//   deja el stock bajo cero. Lo usan la aprobación de órdenes web y, más
//   adelante, el traspaso a la feria.
// - 'allowNegative': aplica el cambio siempre (restaurar al salir de
//   approved; las ventas de la feria sobre su propio stock).
// $inc no pasa por los validadores de Mongoose (el min: 0 del modelo): en
// el modo condicional el mínimo lo garantiza el filtro.
//
// Devuelve:
// - { status: 'ok', stock }            stock resultante
// - { status: 'insufficient', stock }  stock actual, sin cambios
// - { status: 'not_found' }            ninguna variante con ese sku
// Con session, todo ocurre dentro de esa transacción: una segunda llamada
// por el mismo sku ve lo que descontó la primera.
export const adjustVariantStock = async ({ sku, delta, mode, session = null }) => {
    if (!Number.isInteger(delta) || delta === 0) {
        throw new Error(`adjustVariantStock: delta inválido (${delta})`)
    }
    if (mode !== 'conditional' && mode !== 'allowNegative') {
        throw new Error(`adjustVariantStock: mode inválido (${mode})`)
    }

    const variantFilter = { sku }
    if (mode === 'conditional' && delta < 0) {
        variantFilter.stock = { $gte: -delta }
    }
    const onlyThisVariant = { variants: { $elemMatch: { sku } } }

    const updated = await ProductModel.findOneAndUpdate(
        { variants: { $elemMatch: variantFilter } },
        { $inc: { 'variants.$.stock': delta } },
        { new: true, projection: onlyThisVariant, session, lean: true },
    )
    if (updated) return { status: 'ok', stock: updated.variants[0].stock }

    // Sin efecto: o no existe el sku, o no alcanzaba el stock
    const current = await ProductModel.findOne(
        { 'variants.sku': sku },
        onlyThisVariant,
        { session, lean: true },
    )
    if (!current) return { status: 'not_found' }
    return { status: 'insufficient', stock: current.variants[0].stock }
}
