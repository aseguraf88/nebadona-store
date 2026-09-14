import { TbPhotoUp } from 'react-icons/tb'

const normalizeHexColor = (value = '') => {
    const trimmed = String(value || '').trim()

    if (!trimmed) return '#000000'
    if (/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(trimmed)) {
        return trimmed.toLowerCase()
    }

    return '#000000'
}

const hexToRgb = (hex) => {
    const normalizedHex = normalizeHexColor(hex).replace('#', '')

    if (normalizedHex.length === 3) {
        const expanded = normalizedHex
            .split('')
            .map((char) => `${char}${char}`)
            .join('')

        return {
            r: Number.parseInt(expanded.slice(0, 2), 16),
            g: Number.parseInt(expanded.slice(2, 4), 16),
            b: Number.parseInt(expanded.slice(4, 6), 16),
        }
    }

    return {
        r: Number.parseInt(normalizedHex.slice(0, 2), 16) || 0,
        g: Number.parseInt(normalizedHex.slice(2, 4), 16) || 0,
        b: Number.parseInt(normalizedHex.slice(4, 6), 16) || 0,
    }
}

const ProductPreviewCard = ({
    template,
    activeImage,
    currentImageIndex,
    setCurrentImageIndex,
    handleChangeImage,
    onOpenImageModal,
    isTitleEditing,
    setIsTitleEditing,
    isDescriptionEditing,
    setIsDescriptionEditing,
    isPriceEditing,
    setIsPriceEditing,
    titleInputRef,
    descriptionInputRef,
    priceInputRef,
    setTemplate,
    emptyDescription,
}) => {
    const colorOptions = Array.isArray(template.colors)
        ? template.colors.filter((item) => item?.hex).slice(0, 4)
        : []

    const primaryHex = normalizeHexColor(template.color || colorOptions[0]?.hex || '#000000')

    const visibleColorOptions = colorOptions.length
        ? colorOptions.map((item, index) => ({
              ...item,
              hex: normalizeHexColor(item.hex),
              selected: normalizeHexColor(item.hex) === primaryHex || index === 0,
          }))
        : template.color
          ? [
                {
                    name: 'Color principal',
                    hex: primaryHex,
                    selected: true,
                },
            ]
          : []

    return (
        <article className="card group relative mx-auto h-[27rem] w-full overflow-hidden bg-base-100 text-base-content shadow-lg">
            <button
                type="button"
                className="px-4 pt-4 text-left"
                onClick={onOpenImageModal}
            >
                <div className="relative h-56 w-full overflow-hidden rounded-xl border border-dashed border-base-300 bg-base-200">
                    {activeImage ? (
                        <img
                            src={activeImage}
                            alt={template.title}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-3 text-base-content/70">
                            <TbPhotoUp className="text-3xl" />
                            <span className="btn btn-sm btn-outline">
                                Cargar imagenes
                            </span>
                        </div>
                    )}

                    {template.images.length > 1 && (
                        <>
                            <div className="hidden sm:block">
                                <button
                                    type="button"
                                    className="btn btn-xs btn-circle absolute left-2 top-1/2 -translate-y-1/2"
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        event.preventDefault()
                                        handleChangeImage(-1)
                                    }}
                                >
                                    ❮
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-xs btn-circle absolute right-2 top-1/2 -translate-y-1/2"
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        event.preventDefault()
                                        handleChangeImage(1)
                                    }}
                                >
                                    ❯
                                </button>
                            </div>

                            <div className="sm:hidden">
                                <button
                                    type="button"
                                    className="btn btn-xs btn-circle absolute right-2 top-2"
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        event.preventDefault()
                                        handleChangeImage(-1)
                                    }}
                                >
                                    ↑
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-xs btn-circle absolute right-2 bottom-2"
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        event.preventDefault()
                                        handleChangeImage(1)
                                    }}
                                >
                                    ↓
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {visibleColorOptions.length > 0 && (
                    <div className="mt-2 flex justify-start">
                        <div
                            className="tooltip tooltip-right"
                            data-tip="Colores del producto"
                        >
                            <div className="inline-flex items-center gap-1 rounded-full px-2 py-1">
                                {visibleColorOptions.map((item, index) => {
                                    const normalizedHex = normalizeHexColor(item.hex)
                                    const isPrimary = normalizedHex === primaryHex || index === 0

                                    return (
                                        <span
                                            key={`${normalizedHex}-${index}`}
                                            className={`inline-block rounded-full border border-base-100/70 shadow-sm ${
                                                isPrimary ? 'h-4 w-4' : 'h-2.5 w-2.5'
                                            }`}
                                            style={{ backgroundColor: normalizedHex }}
                                            aria-hidden="true"
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {template.images.length > 1 && (
                    <div className="mt-2 flex justify-center gap-1.5 sm:hidden">
                        {template.images.map((image, index) => (
                            <button
                                key={image.id}
                                type="button"
                                className={`h-2.5 w-2.5 rounded-full ${
                                    index === currentImageIndex
                                        ? 'bg-primary'
                                        : 'bg-base-300'
                                }`}
                                onClick={(event) => {
                                    event.stopPropagation()
                                    event.preventDefault()
                                    setCurrentImageIndex(index)
                                }}
                                aria-label={`Imagen ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </button>

            <div className="card-body pb-20">
                {isTitleEditing ? (
                    <input
                        ref={titleInputRef}
                        value={template.title}
                        onChange={(event) =>
                            setTemplate((prev) => ({
                                ...prev,
                                title: event.target.value,
                            }))
                        }
                        onBlur={() => setIsTitleEditing(false)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                setIsTitleEditing(false)
                            }
                        }}
                        className="input input-bordered input-sm w-full"
                        autoFocus
                    />
                ) : (
                    <button
                        type="button"
                        className="card-title w-full text-left leading-tight text-base-content"
                        style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: '3.25rem',
                        }}
                        onClick={() => {
                            setIsTitleEditing(true)
                            setTimeout(() => {
                                titleInputRef.current?.focus()
                            }, 0)
                        }}
                    >
                        {template.title || 'Titulo'}
                    </button>
                )}

                {isDescriptionEditing ? (
                    <input
                        ref={descriptionInputRef}
                        value={template.description}
                        onChange={(event) =>
                            setTemplate((prev) => ({
                                ...prev,
                                description: event.target.value,
                            }))
                        }
                        onBlur={() => setIsDescriptionEditing(false)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                setIsDescriptionEditing(false)
                            }
                        }}
                        className="input input-bordered input-sm w-full"
                        placeholder="Descripcion"
                        autoFocus
                    />
                ) : (
                    <button
                        type="button"
                        className="w-full text-left text-sm text-base-content/75"
                        style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: '2.6rem',
                        }}
                        onClick={() => {
                            setIsDescriptionEditing(true)
                            setTimeout(() => {
                                descriptionInputRef.current?.focus()
                            }, 0)
                        }}
                    >
                        {template.description || emptyDescription}
                    </button>
                )}

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                    {isPriceEditing ? (
                        <input
                            ref={priceInputRef}
                            value={template.price}
                            onChange={(event) =>
                                setTemplate((prev) => ({
                                    ...prev,
                                    price: event.target.value.replace(
                                        /[^0-9]/g,
                                        '',
                                    ),
                                }))
                            }
                            onBlur={() => setIsPriceEditing(false)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    setIsPriceEditing(false)
                                }
                            }}
                            className="input input-bordered input-sm w-24"
                            autoFocus
                        />
                    ) : (
                        <button
                            type="button"
                            className="badge badge-warning px-4 py-3 text-lg font-normal text-base-content"
                            onClick={() => {
                                setIsPriceEditing(true)
                                setTimeout(() => {
                                    priceInputRef.current?.focus()
                                }, 0)
                            }}
                        >
                            ${template.price || '0000'}
                        </button>
                    )}

                    <button
                        type="button"
                        className="btn btn-sm border border-base-300 text-base-content md:btn-md"
                    >
                        + Agregar
                    </button>
                </div>
            </div>
        </article>
    )
}

export default ProductPreviewCard
