// Reglas de stock que comparten la ficha, el modal, la tarjeta y /shop

const variantHasStock = (variant) => (variant?.stock || 0) > 0

// true si al menos una variante del producto tiene stock
export const hasStock = (product) =>
    (product?.variants || []).some(variantHasStock)

// Variante a preseleccionar al abrir la ficha o el modal: la primera con
// stock; si ninguna tiene, la primera (que va a mostrar "Agotado")
export const pickInitialVariant = (variants) =>
    (variants || []).find(variantHasStock) ?? variants?.[0] ?? null
