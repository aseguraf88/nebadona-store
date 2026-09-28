import { TbWand, TbLock } from 'react-icons/tb'

// Selector de Talla: bloqueado a una sola opción si el Estándar de talla la
// fija; si no, libre con SIZE_OPTIONS, sumando el valor actual cuando no
// está en la lista (ej. "39-43" de un CSV, o la talla fija de un estándar
// anterior) para no mostrar "N/A" sobre un dato que sí existe.
const SizeSelect = ({ className, value, onChange, sizeOptions, lockedSize }) => {
    if (lockedSize) {
        return (
            <select className={className} value={lockedSize.code} disabled>
                <option value={lockedSize.code}>{lockedSize.code}</option>
            </select>
        )
    }
    const hasCustomValue = Boolean(value) && !sizeOptions?.includes(value)
    return (
        <select className={className} value={value} onChange={onChange}>
            <option value="">N/A</option>
            {hasCustomValue && <option value={value}>{value}</option>}
            {sizeOptions?.map((opt) => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    )
}

const VariantsFields = ({
    template,
    sizeOptions,
    lockedSize,
    handleVariantChange,
    removeVariant,
    autoGenerateSku,
    lastVariantRef,
}) => (
    <>
        {lockedSize && (
            <p className="flex items-center gap-1.5 px-4 pt-3 text-xs text-base-content/60">
                <TbLock className="shrink-0" />
                La talla está fijada por el Estándar de talla elegido:{' '}
                {lockedSize.label}.
            </p>
        )}

        {/* TABLA — solo desktop/tablet, sin cambios respecto a la de siempre */}
        <div className="card-body p-0 overflow-x-auto hidden md:block">
            <table className="table table-sm w-full">
                <thead className="bg-base-200/50">
                    <tr>
                        <th>SKU</th>
                        <th>Talla</th>
                        <th>Color Base</th>
                        <th>Diseño (Separar por coma)</th>
                        <th className="w-20">Stock</th>
                        <th className="w-10"></th>
                    </tr>
                </thead>
                <tbody>
                    {template.variants.map((v, idx) => (
                        <tr key={idx}>
                            <td>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="text"
                                        className="input input-sm input-bordered w-full font-mono uppercase"
                                        value={v.sku}
                                        onChange={(e) =>
                                            handleVariantChange(
                                                idx,
                                                'sku',
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                        placeholder="SKU"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-xs btn-ghost text-primary"
                                        title="Autogenerar SKU"
                                        onClick={() => autoGenerateSku(idx)}
                                    >
                                        <TbWand />
                                    </button>
                                </div>
                            </td>
                            <td>
                                <SizeSelect
                                    className="select select-xs select-bordered w-full"
                                    value={v.size}
                                    onChange={(e) =>
                                        handleVariantChange(
                                            idx,
                                            'size',
                                            e.target.value,
                                        )
                                    }
                                    sizeOptions={sizeOptions}
                                    lockedSize={lockedSize}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    className="input input-xs input-bordered w-24 lowercase"
                                    value={v.baseColor}
                                    onChange={(e) =>
                                        handleVariantChange(
                                            idx,
                                            'baseColor',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Ej. azul"
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    className="input input-xs input-bordered w-full lowercase"
                                    value={
                                        Array.isArray(
                                            v.designColors,
                                        )
                                            ? v.designColors.join(
                                                  ',',
                                              )
                                            : ''
                                    }
                                    onChange={(e) =>
                                        handleVariantChange(
                                            idx,
                                            'designColors',
                                            e.target.value.split(
                                                ',',
                                            ),
                                        )
                                    }
                                    placeholder="Ej. rojo, blanco"
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className="input input-xs input-bordered w-20 font-bold"
                                    value={v.stock}
                                    onChange={(e) =>
                                        handleVariantChange(
                                            idx,
                                            'stock',
                                            e.target.value,
                                        )
                                    }
                                    onFocus={(e) =>
                                        e.target.select()
                                    }
                                    onBlur={(e) =>
                                        handleVariantChange(
                                            idx,
                                            'stock',
                                            Number(
                                                e.target.value,
                                            ) || 0,
                                        )
                                    }
                                    min="0"
                                />
                            </td>
                            <td>
                                <button
                                    type="button"
                                    className="btn btn-xs btn-circle btn-ghost text-error"
                                    onClick={() =>
                                        removeVariant(idx)
                                    }
                                    disabled={
                                        template.variants.length ===
                                        1
                                    }
                                >
                                    ✕
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* TARJETAS — solo mobile, una por variante */}
        <div className="md:hidden flex flex-col gap-3 p-4">
            {template.variants.map((v, idx) => (
                <div
                    key={idx}
                    ref={
                        idx === template.variants.length - 1
                            ? lastVariantRef
                            : null
                    }
                    className="border border-base-200 rounded-xl p-3 flex flex-col gap-3 relative bg-base-100"
                >
                    <button
                        type="button"
                        className="btn btn-xs btn-circle btn-ghost text-error absolute top-2 right-2"
                        onClick={() => removeVariant(idx)}
                        disabled={template.variants.length === 1}
                    >
                        ✕
                    </button>

                    <div className="flex items-center gap-1 pr-8">
                        <input
                            type="text"
                            className="input input-sm input-bordered w-full font-mono uppercase"
                            value={v.sku}
                            onChange={(e) =>
                                handleVariantChange(
                                    idx,
                                    'sku',
                                    e.target.value.toUpperCase(),
                                )
                            }
                            placeholder="SKU"
                        />
                        <button
                            type="button"
                            className="btn btn-sm btn-ghost text-primary"
                            title="Autogenerar SKU"
                            onClick={() => autoGenerateSku(idx)}
                        >
                            <TbWand />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <label className="form-control w-full">
                            <span className="label-text text-xs font-semibold text-base-content/60 mb-1">
                                Talla
                            </span>
                            <SizeSelect
                                className="select select-sm select-bordered w-full"
                                value={v.size}
                                onChange={(e) =>
                                    handleVariantChange(
                                        idx,
                                        'size',
                                        e.target.value,
                                    )
                                }
                                sizeOptions={sizeOptions}
                                lockedSize={lockedSize}
                            />
                        </label>
                        <label className="form-control w-full">
                            <span className="label-text text-xs font-semibold text-base-content/60 mb-1">
                                Color Base
                            </span>
                            <input
                                type="text"
                                className="input input-sm input-bordered w-full lowercase"
                                value={v.baseColor}
                                onChange={(e) =>
                                    handleVariantChange(
                                        idx,
                                        'baseColor',
                                        e.target.value,
                                    )
                                }
                                placeholder="Ej. azul"
                            />
                        </label>
                    </div>

                    <label className="form-control w-full">
                        <span className="label-text text-xs font-semibold text-base-content/60 mb-1">
                            Diseño (separar por coma)
                        </span>
                        <input
                            type="text"
                            className="input input-sm input-bordered w-full lowercase"
                            value={
                                Array.isArray(v.designColors)
                                    ? v.designColors.join(',')
                                    : ''
                            }
                            onChange={(e) =>
                                handleVariantChange(
                                    idx,
                                    'designColors',
                                    e.target.value.split(','),
                                )
                            }
                            placeholder="Ej. rojo, blanco"
                        />
                    </label>

                    <label className="form-control w-full">
                        <span className="label-text text-xs font-semibold text-base-content/60 mb-1">
                            Stock
                        </span>
                        <input
                            type="number"
                            className="input input-sm input-bordered w-full font-bold"
                            value={v.stock}
                            onChange={(e) =>
                                handleVariantChange(
                                    idx,
                                    'stock',
                                    e.target.value,
                                )
                            }
                            onFocus={(e) => e.target.select()}
                            onBlur={(e) =>
                                handleVariantChange(
                                    idx,
                                    'stock',
                                    Number(e.target.value) || 0,
                                )
                            }
                            min="0"
                        />
                    </label>
                </div>
            ))}
        </div>
    </>
)

export default VariantsFields
