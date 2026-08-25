import { useEffect } from 'react'
import { COLOR_FAMILIES } from '../../../../constants/colorFamilies.js'

// --- FUNCIONES DE MAGIA PARA EL SKU ---
const formatSkuPart = (value = '') => {
    const cleanValue = String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .trim()
        .replace(/[^A-Z0-9\s]/g, '')
    if (!cleanValue) return ''
    const words = cleanValue.split(/\s+/)
    return words.length === 1
        ? words[0].substring(0, 3)
        : words.map((w) => w.charAt(0)).join('')
}

const generateLiveSku = (cat, fran, char, color, size) => {
    const parts = [
        formatSkuPart(cat),
        formatSkuPart(fran),
        formatSkuPart(char),
        formatSkuPart(color),
        String(size || '')
            .toUpperCase()
            .trim(),
    ]
    return parts.filter(Boolean).join('-')
}
// ----------------------------------------

const ProductAttributesForm = ({
    template,
    setTemplate,
    productCategories,
    designThemes,
    franchiseNames,
    currentProductTypeOptions = [],
    sizeOptions,
}) => {
    useEffect(() => {
        const newSku = generateLiveSku(
            template.product_category,
            template.franchise_name,
            template.character_name,
            template.colorFamily,
            template.size,
        )
        setTemplate((prev) => {
            if (prev.sku !== newSku && newSku !== '')
                return { ...prev, sku: newSku }
            return prev
        })
    }, [
        template.product_category,
        template.franchise_name,
        template.character_name,
        template.colorFamily,
        template.size,
        setTemplate,
    ])

    return (
        // Quitamos el ancho fijo. Ahora es "w-full" para adaptarse a la grilla responsiva.
        <div className="flex w-full flex-col gap-6 pb-12">
            {/* --- TARJETA 1: CLASIFICACIÓN --- */}
            <section className="card border border-base-300 bg-base-100 shadow-md">
                {/* Cabecera de tarjeta con color diferenciado */}
                <div className="border-b border-base-300 bg-base-200/50 px-6 py-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-base-content/80">
                        📦 Clasificación
                    </h3>
                </div>
                <div className="card-body gap-4 p-6 sm:grid sm:grid-cols-2">
                    <label className="form-control w-full">
                        <div className="label">
                            <span className="label-text font-semibold">
                                Categoría
                            </span>
                        </div>
                        <select
                            className="select select-bordered w-full bg-base-100"
                            value={template.product_category}
                            onChange={(e) =>
                                setTemplate((prev) => ({
                                    ...prev,
                                    product_category: e.target.value,
                                    sock_type: '',
                                }))
                            }
                        >
                            <option value="">Selecciona...</option>
                            {productCategories.map((item) => (
                                <option key={item._id} value={item.name}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="form-control w-full">
                        <div className="label">
                            <span className="label-text font-semibold">
                                Tipo
                            </span>
                        </div>
                        <select
                            className="select select-bordered w-full bg-base-100"
                            value={template.sock_type}
                            onChange={(e) =>
                                setTemplate((prev) => ({
                                    ...prev,
                                    sock_type: e.target.value,
                                }))
                            }
                            disabled={!template.product_category}
                        >
                            <option value="">
                                {template.product_category
                                    ? 'Selecciona tipo...'
                                    : 'Requiere categoría'}
                            </option>
                            {currentProductTypeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </section>

            {/* --- TARJETA 2: UNIVERSO Y DISEÑO --- */}
            <section className="card border border-base-300 bg-base-100 shadow-md">
                <div className="border-b border-base-300 bg-base-200/50 px-6 py-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-base-content/80">
                        🌌 Universo y Diseño
                    </h3>
                </div>
                <div className="card-body gap-4 p-6 sm:grid sm:grid-cols-2">
                    <label className="form-control w-full">
                        <div className="label">
                            <span className="label-text font-semibold">
                                Tema
                            </span>
                        </div>
                        <select
                            className="select select-bordered w-full bg-base-100"
                            value={template.design_theme}
                            onChange={(e) =>
                                setTemplate((prev) => ({
                                    ...prev,
                                    design_theme: e.target.value,
                                }))
                            }
                        >
                            <option value="">Opcional...</option>
                            {designThemes.map((item) => (
                                <option key={item._id} value={item.name}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="form-control w-full">
                        <div className="label">
                            <span className="label-text font-semibold">
                                Franquicia
                            </span>
                        </div>
                        <select
                            className="select select-bordered w-full bg-base-100"
                            value={template.franchise_name}
                            onChange={(e) =>
                                setTemplate((prev) => ({
                                    ...prev,
                                    franchise_name: e.target.value,
                                }))
                            }
                        >
                            <option value="">Opcional...</option>
                            {franchiseNames.map((item) => (
                                <option key={item._id} value={item.name}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="form-control w-full sm:col-span-2">
                        <div className="label">
                            <span className="label-text font-semibold">
                                Personaje
                            </span>
                        </div>
                        <input
                            type="text"
                            className="input input-bordered w-full bg-base-100"
                            placeholder="Ej. Goku Super Saiyan 2"
                            value={template.character_name || ''}
                            onChange={(e) =>
                                setTemplate((prev) => ({
                                    ...prev,
                                    character_name: e.target.value,
                                }))
                            }
                            disabled={!template.franchise_name}
                        />
                        {!template.franchise_name && (
                            <div className="label">
                                <span className="label-text-alt text-base-content/50">
                                    Selecciona una franquicia primero
                                </span>
                            </div>
                        )}
                    </label>
                </div>
            </section>

            {/* --- TARJETA 3: VARIANTES --- */}
            <section className="card border border-base-300 bg-base-100 shadow-md">
                <div className="border-b border-base-300 bg-base-200/50 px-6 py-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-base-content/80">
                        🎨 Variantes
                    </h3>
                </div>
                <div className="card-body gap-4 p-6 sm:grid sm:grid-cols-2">
                    <label className="form-control w-full">
                        <div className="label">
                            <span className="label-text font-semibold">
                                Color Principal
                            </span>
                        </div>
                        <select
                            className="select select-bordered w-full bg-base-100"
                            value={template.colorFamily || ''}
                            onChange={(e) =>
                                setTemplate((prev) => ({
                                    ...prev,
                                    colorFamily: e.target.value,
                                }))
                            }
                        >
                            <option value="">(Opcional) Sin color</option>
                            {COLOR_FAMILIES.map((color) => (
                                <option key={color.name} value={color.name}>
                                    {color.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="form-control w-full">
                        <div className="label">
                            <span className="label-text font-semibold">
                                Talla
                            </span>
                        </div>
                        <select
                            className="select select-bordered w-full bg-base-100"
                            value={template.size}
                            onChange={(e) =>
                                setTemplate((prev) => ({
                                    ...prev,
                                    size: e.target.value,
                                }))
                            }
                        >
                            <option value="">Selecciona talla...</option>
                            {sizeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </section>

            {/* --- TARJETA 4: INVENTARIO Y PRECIO --- */}
            <section className="card border border-base-300 bg-base-100 shadow-md">
                <div className="border-b border-base-300 bg-base-200/50 px-6 py-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-base-content/80">
                        💰 Inventario y Precio
                    </h3>
                </div>
                <div className="card-body gap-4 p-6">
                    <label className="form-control w-full mb-2">
                        <div className="label">
                            <span className="label-text font-semibold">
                                SKU (Identificador)
                            </span>
                        </div>
                        <input
                            type="text"
                            className="input input-bordered w-full bg-base-200 font-mono font-bold tracking-widest text-primary focus:bg-base-100"
                            placeholder="Autogenerado o Manual"
                            value={template.sku}
                            onChange={(e) =>
                                setTemplate((prev) => ({
                                    ...prev,
                                    sku: e.target.value,
                                }))
                            }
                        />
                        <div className="label">
                            <span className="label-text-alt text-base-content/60">
                                El SKU se genera automáticamente al completar
                                las tarjetas superiores.
                            </span>
                        </div>
                    </label>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-semibold">
                                    Stock Total
                                </span>
                            </div>
                            <input
                                type="number"
                                min="0"
                                className="input input-bordered w-full bg-base-100"
                                value={template.stock}
                                onChange={(e) =>
                                    setTemplate((prev) => ({
                                        ...prev,
                                        stock: e.target.value,
                                    }))
                                }
                            />
                        </label>

                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-semibold text-error">
                                    Precio de Oferta
                                </span>
                            </div>
                            <input
                                type="number"
                                min="0"
                                placeholder="Ej. 14990 (Opcional)"
                                className="input input-bordered w-full bg-base-100 font-medium text-error focus:border-error"
                                value={template.compareAtPrice}
                                onChange={(e) =>
                                    setTemplate((prev) => ({
                                        ...prev,
                                        compareAtPrice: e.target.value,
                                    }))
                                }
                            />
                        </label>
                    </div>
                </div>
            </section>

            {/* --- TARJETA 5: VISIBILIDAD --- */}
            <section className="card border border-base-300 bg-base-100 shadow-md">
                <div className="border-b border-base-300 bg-base-200/50 px-6 py-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-base-content/80">
                        👁️ Visibilidad y Etiquetas
                    </h3>
                </div>
                <div className="card-body gap-6 p-6">
                    <label className="form-control w-full">
                        <div className="label">
                            <span className="label-text font-semibold">
                                Tags de búsqueda (separados por coma)
                            </span>
                        </div>
                        <input
                            type="text"
                            className="input input-bordered w-full bg-base-100"
                            placeholder="Ej: anime, coleccion, regalo..."
                            value={template.tags}
                            onChange={(e) =>
                                setTemplate((prev) => ({
                                    ...prev,
                                    tags: e.target.value,
                                }))
                            }
                        />
                    </label>

                    <div className="flex flex-wrap gap-6 rounded-xl border border-base-200 bg-base-200/30 p-5">
                        <label className="flex cursor-pointer items-center gap-3">
                            <input
                                type="checkbox"
                                className="toggle toggle-primary toggle-md"
                                checked={Boolean(template.featured)}
                                onChange={(e) =>
                                    setTemplate((prev) => ({
                                        ...prev,
                                        featured: e.target.checked,
                                    }))
                                }
                            />
                            <span className="label-text font-medium">
                                Destacado
                            </span>
                        </label>
                        <label className="flex cursor-pointer items-center gap-3">
                            <input
                                type="checkbox"
                                className="toggle toggle-secondary toggle-md"
                                checked={Boolean(template.popular)}
                                onChange={(e) =>
                                    setTemplate((prev) => ({
                                        ...prev,
                                        popular: e.target.checked,
                                    }))
                                }
                            />
                            <span className="label-text font-medium">
                                Popular
                            </span>
                        </label>
                        <label className="flex cursor-pointer items-center gap-3">
                            <input
                                type="checkbox"
                                className="toggle toggle-success toggle-md"
                                checked={Boolean(template.isActive)}
                                onChange={(e) =>
                                    setTemplate((prev) => ({
                                        ...prev,
                                        isActive: e.target.checked,
                                    }))
                                }
                            />
                            <span className="label-text font-medium">
                                Activo en tienda
                            </span>
                        </label>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default ProductAttributesForm
