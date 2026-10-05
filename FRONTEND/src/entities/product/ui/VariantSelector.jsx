const badgeClasses = (isSelected, outOfStock) =>
    `badge badge-lg p-4 rounded-xl font-bold capitalize cursor-pointer transition-all ${
        isSelected ? 'badge-primary' : 'badge-outline border-base-300'
    } ${outOfStock ? 'opacity-30 cursor-not-allowed line-through' : ''}`

/**
 * Selector de variante (talla / color). Si el producto solo tiene una
 * variante, no renderiza nada — no tiene sentido pedirle al cliente que
 * elija entre una sola opción.
 */
const VariantSelector = ({ variants, selectedVariant, onSelect }) => {
    if (!Array.isArray(variants) || variants.length <= 1) return null

    const hasSizes = variants.some((v) => v.size)
    const hasColors = variants.some((v) => v.baseColor)

    const uniqueSizes = [...new Set(variants.map((v) => v.size).filter(Boolean))]
    const uniqueColors = [...new Set(variants.map((v) => v.baseColor).filter(Boolean))]

    // Una talla (o un color) se marca agotada solo si NINGUNA variante con
    // ese valor tiene stock. Antes se miraba solo la combinación con el color
    // (o la talla) elegido, y una talla con stock en otro color salía tachada
    const inStock = (v) => (v.stock || 0) > 0
    const sizeHasStock = (size) => variants.some((v) => v.size === size && inStock(v))
    const colorHasStock = (color) =>
        variants.some((v) => v.baseColor === color && inStock(v))

    // Al tocar una talla: la del color elegido si tiene stock; si no, la
    // primera de esa talla con stock. Lo mismo al tocar un color
    const pickForSize = (size) =>
        variants.find(
            (v) => v.size === size && v.baseColor === selectedVariant?.baseColor && inStock(v),
        ) ?? variants.find((v) => v.size === size && inStock(v))
    const pickForColor = (color) =>
        variants.find(
            (v) => v.baseColor === color && v.size === selectedVariant?.size && inStock(v),
        ) ?? variants.find((v) => v.baseColor === color && inStock(v))

    return (
        <div className="flex flex-col gap-4">
            {hasSizes && (
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-base-content/70 uppercase tracking-widest">
                        Talla
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {uniqueSizes.map((size) => {
                            const isSelected = selectedVariant?.size === size
                            const outOfStock = !sizeHasStock(size)

                            return (
                                <button
                                    key={size}
                                    type="button"
                                    disabled={outOfStock}
                                    onClick={() => {
                                        const next = pickForSize(size)
                                        if (next) onSelect(next)
                                    }}
                                    className={badgeClasses(isSelected, outOfStock)}
                                >
                                    {size}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {hasColors && (
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-base-content/70 uppercase tracking-widest">
                        Color
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {uniqueColors.map((color) => {
                            const isSelected = selectedVariant?.baseColor === color
                            const outOfStock = !colorHasStock(color)

                            return (
                                <button
                                    key={color}
                                    type="button"
                                    disabled={outOfStock}
                                    onClick={() => {
                                        const next = pickForColor(color)
                                        if (next) onSelect(next)
                                    }}
                                    className={badgeClasses(isSelected, outOfStock)}
                                >
                                    {color}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default VariantSelector
