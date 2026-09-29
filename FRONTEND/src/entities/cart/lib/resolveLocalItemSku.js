// SKU de un ítem del carrito local (invitado), para pasarlo al backend al
// iniciar sesión. Los ítems viejos, guardados antes de que existiera `sku`,
// se resuelven solo si no hay ambigüedad (el ítem guarda una copia del
// producto con sus `variants`): producto con una sola variante, o una única
// variante con la misma talla y color. Si no, null (el ítem no se pasa).
export const resolveLocalItemSku = (item) => {
    if (item?.sku) return item.sku

    const variants = Array.isArray(item?.variants) ? item.variants : []
    if (variants.length === 1) return variants[0].sku || null

    const matches = variants.filter(
        (v) =>
            (v.size || '') === (item.size || '') &&
            (v.baseColor || '') === (item.baseColor || ''),
    )
    return matches.length === 1 ? matches[0].sku || null : null
}
