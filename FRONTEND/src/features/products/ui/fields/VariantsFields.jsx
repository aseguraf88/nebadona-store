import { TbWand } from 'react-icons/tb'

const VariantsFields = ({
    template,
    sizeOptions,
    handleVariantChange,
    removeVariant,
    autoGenerateSku,
    lastVariantRef,
}) => (
    <>
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
                                <select
                                    className="select select-xs select-bordered w-full"
                                    value={v.size}
                                    onChange={(e) =>
                                        handleVariantChange(
                                            idx,
                                            'size',
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="">N/A</option>
                                    {sizeOptions?.map((opt) => (
                                        <option
                                            key={opt}
                                            value={opt}
                                        >
                                            {opt}
                                        </option>
                                    ))}
                                </select>
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
                            <select
                                className="select select-sm select-bordered w-full"
                                value={v.size}
                                onChange={(e) =>
                                    handleVariantChange(
                                        idx,
                                        'size',
                                        e.target.value,
                                    )
                                }
                            >
                                <option value="">N/A</option>
                                {sizeOptions?.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
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
