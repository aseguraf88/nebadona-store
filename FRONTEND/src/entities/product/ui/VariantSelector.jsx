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

    const findVariant = (size, color) =>
        variants.find(
            (v) =>
                (!hasSizes || v.size === size) &&
                (!hasColors || v.baseColor === color),
        )

    return (
        <div className="flex flex-col gap-4">
            {hasSizes && (
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-base-content/70 uppercase tracking-widest">
                        Talla
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {uniqueSizes.map((size) => {
                            const matching = findVariant(size, selectedVariant?.baseColor)
                            const isSelected = selectedVariant?.size === size
                            const outOfStock = matching ? matching.stock === 0 : true

                            return (
                                <button
                                    key={size}
                                    type="button"
                                    disabled={outOfStock}
                                    onClick={() => matching && onSelect(matching)}
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
                            const matching = findVariant(selectedVariant?.size, color)
                            const isSelected = selectedVariant?.baseColor === color
                            const outOfStock = matching ? matching.stock === 0 : true

                            return (
                                <button
                                    key={color}
                                    type="button"
                                    disabled={outOfStock}
                                    onClick={() => matching && onSelect(matching)}
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
