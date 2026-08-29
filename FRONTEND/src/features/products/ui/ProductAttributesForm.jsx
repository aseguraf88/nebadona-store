import { useEffect, useState } from 'react'
import { COLOR_FAMILIES } from '../../../entities/product'
import { normalizeCategoryKey } from '../../../entities/product'
import { AddEntityModal } from '../../products'

const formatSkuPart = (value = '') => {
    if (!value) return ''
    const cleanValue = String(value)
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
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false)
    const [isFranchiseModalOpen, setIsFranchiseModalOpen] = useState(false)

    const [localThemes, setLocalThemes] = useState([])
    const [localFranchises, setLocalFranchises] = useState([])

    useEffect(() => {
        if (designThemes) setLocalThemes(designThemes)
        if (franchiseNames) setLocalFranchises(franchiseNames)
    }, [designThemes, franchiseNames])

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

    const selectedColorObj = COLOR_FAMILIES.find(
        (c) => c.name === template.colorFamily,
    )

    const handleSaveTheme = (newThemeName) => {
        const newObj = { _id: Date.now().toString(), name: newThemeName }
        setLocalThemes((prev) => [...prev, newObj])
        setTemplate((prev) => ({ ...prev, design_theme: newThemeName }))
    }

    const handleSaveFranchise = (newFranchiseName) => {
        const newObj = { _id: Date.now().toString(), name: newFranchiseName }
        setLocalFranchises((prev) => [...prev, newObj])
        setTemplate((prev) => ({ ...prev, franchise_name: newFranchiseName }))
    }

    // 🔥 2. LÓGICA DE RENDERIZADO CONDICIONAL
    // Obtenemos la categoría limpia (ej: "Zapatos" -> "zapatos")
    const categoryKey = normalizeCategoryKey(template.product_category || '')
    // Definimos qué categorías necesitan talla
    const categoriesWithSizes = [
        'calceta',
        'calcetas',
        'calcetin',
        'calcetines',
        'polera',
        'poleras',
        'poleron',
        'polerones',
        'camisa',
        'camisas',
        'zapato',
        'zapatos',
    ]
    // Booleano que nos dice si debemos mostrar las tallas o no
    const showSizes = categoriesWithSizes.includes(categoryKey)

    // 🔥 3. Si la categoría no usa talla, la limpiamos del template para no mandar datos basura a la DB
    useEffect(() => {
        if (!showSizes && template.size !== '') {
            setTemplate((prev) => ({ ...prev, size: '' }))
        }
    }, [showSizes, template.size, setTemplate])

    return (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            <div className="flex flex-col gap-6 lg:col-span-8">
                {/* --- INFORMACIÓN PRINCIPAL --- */}
                <section className="card border border-base-200 bg-base-100 shadow-sm">
                    <div className="border-b border-base-200 bg-base-200/30 px-6 py-4">
                        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-base-content/80">
                            📝 Información Principal
                        </h3>
                    </div>
                    <div className="card-body gap-5 p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <label className="form-control w-full sm:col-span-3">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Título del Producto{' '}
                                        <span className="text-error">*</span>
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    className="input input-bordered w-full bg-base-100"
                                    placeholder="Ej. Polera de Goku Super Saiyan..."
                                    value={
                                        template.title === 'Titulo'
                                            ? ''
                                            : template.title
                                    }
                                    onChange={(e) =>
                                        setTemplate((prev) => ({
                                            ...prev,
                                            title: e.target.value,
                                        }))
                                    }
                                />
                            </label>
                            <label className="form-control w-full">
                                <div className="label">
                                    <span className="label-text font-semibold">
                                        Precio ($){' '}
                                        <span className="text-error">*</span>
                                    </span>
                                </div>
                                <input
                                    type="number"
                                    className="input input-bordered w-full bg-base-100 font-bold text-primary"
                                    placeholder="Ej. 14990"
                                    value={
                                        template.price === '0000'
                                            ? ''
                                            : template.price
                                    }
                                    onChange={(e) =>
                                        setTemplate((prev) => ({
                                            ...prev,
                                            price: e.target.value,
                                        }))
                                    }
                                />
                            </label>
                        </div>
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-semibold">
                                    Descripción
                                </span>
                            </div>
                            <textarea
                                className="textarea textarea-bordered h-32 bg-base-100"
                                placeholder="Añade los detalles del producto, materiales, medidas..."
                                value={
                                    template.description ===
                                    'Producto editable desde dashboard. Descripcion base para crear o editar productos sin bloquear el guardado.'
                                        ? ''
                                        : template.description
                                }
                                onChange={(e) =>
                                    setTemplate((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                            />
                        </label>
                    </div>
                </section>

                {/* --- VARIANTES (COLORES Y TALLAS) --- */}
                <section className="card border border-base-200 bg-base-100 shadow-sm">
                    <div className="border-b border-base-200 bg-base-200/30 px-6 py-4">
                        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-base-content/80">
                            🎨 Variantes
                        </h3>
                    </div>
                    <div className="card-body gap-4 p-6 sm:grid sm:grid-cols-2">
                        {/* Selector de Color (Si no hay tallas, ocupa todo el ancho) */}
                        <label
                            className={`form-control w-full ${!showSizes ? 'sm:col-span-2' : ''}`}
                        >
                            <div className="label flex justify-start gap-2 items-center">
                                <span className="label-text font-semibold">
                                    Color Principal
                                </span>
                                {selectedColorObj && (
                                    <span
                                        className="h-4 w-4 rounded-full border border-base-300 shadow-sm transition-all"
                                        style={{
                                            background:
                                                selectedColorObj.hex ||
                                                'linear-gradient(45deg, #f87171, #fbbf24, #34d399, #60a5fa, #c084fc)',
                                        }}
                                        title={template.colorFamily}
                                    />
                                )}
                            </div>
                            <select
                                className="select select-bordered w-full bg-base-100"
                                value={template.colorFamily}
                                onChange={(e) =>
                                    setTemplate((prev) => ({
                                        ...prev,
                                        colorFamily: e.target.value,
                                    }))
                                }
                            >
                                <option value="">🚫 Sin color</option>
                                {COLOR_FAMILIES.map((color) => (
                                    <option key={color.name} value={color.name}>
                                        {color.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {/* 🔥 4. OCULTAMOS LAS TALLAS SI ES BILLETERA, TAZÓN, ETC. */}
                        {showSizes && (
                            <label className="form-control w-full animate-fadeIn">
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
                                    <option value="">
                                        Selecciona talla...
                                    </option>
                                    {sizeOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}
                    </div>
                </section>

                {/* --- INVENTARIO Y PRECIO --- */}
                <section className="card border border-base-200 bg-base-100 shadow-sm">
                    {/* ... (El resto del componente sigue exactamente igual) ... */}
                    <div className="border-b border-base-200 bg-base-200/30 px-6 py-4">
                        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-base-content/80">
                            💰 Inventario y Descuentos
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
                                    El SKU se autogenera inteligentemente al
                                    completar la categoría y diseño.
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
                                    placeholder="Ej. 9990 (Opcional)"
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
            </div>

            {/* ==========================================
                COLUMNA DERECHA (35% del ancho en desktop)
            ========================================== */}
            <div className="flex flex-col gap-6 lg:col-span-4">
                {/* --- VISIBILIDAD --- */}
                <section className="card border border-base-200 bg-base-100 shadow-sm">
                    <div className="border-b border-base-200 bg-base-200/30 px-6 py-4">
                        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-base-content/80">
                            👁️ Estado
                        </h3>
                    </div>
                    <div className="card-body gap-4 p-6">
                        <div className="flex flex-col gap-4 rounded-xl border border-base-200 bg-base-200/30 p-5">
                            <label className="flex cursor-pointer items-center justify-between gap-3">
                                <span className="label-text font-medium">
                                    Activo en tienda
                                </span>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-success toggle-sm"
                                    checked={Boolean(template.isActive)}
                                    onChange={(e) =>
                                        setTemplate((prev) => ({
                                            ...prev,
                                            isActive: e.target.checked,
                                        }))
                                    }
                                />
                            </label>
                            <label className="flex cursor-pointer items-center justify-between gap-3">
                                <span className="label-text font-medium">
                                    Destacado
                                </span>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-primary toggle-sm"
                                    checked={Boolean(template.featured)}
                                    onChange={(e) =>
                                        setTemplate((prev) => ({
                                            ...prev,
                                            featured: e.target.checked,
                                        }))
                                    }
                                />
                            </label>
                            <label className="flex cursor-pointer items-center justify-between gap-3">
                                <span className="label-text font-medium">
                                    Popular
                                </span>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-secondary toggle-sm"
                                    checked={Boolean(template.popular)}
                                    onChange={(e) =>
                                        setTemplate((prev) => ({
                                            ...prev,
                                            popular: e.target.checked,
                                        }))
                                    }
                                />
                            </label>
                        </div>

                        <label className="form-control w-full mt-2">
                            <div className="label">
                                <span className="label-text font-semibold">
                                    Etiquetas (Tags)
                                </span>
                            </div>
                            <input
                                type="text"
                                className="input input-bordered input-sm w-full bg-base-100"
                                placeholder="Ej: anime, regalo..."
                                value={template.tags}
                                onChange={(e) =>
                                    setTemplate((prev) => ({
                                        ...prev,
                                        tags: e.target.value,
                                    }))
                                }
                            />
                        </label>
                    </div>
                </section>

                {/* --- CLASIFICACIÓN --- */}
                <section className="card border border-base-200 bg-base-100 shadow-sm">
                    <div className="border-b border-base-200 bg-base-200/30 px-6 py-4">
                        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-base-content/80">
                            📦 Jerarquía
                        </h3>
                    </div>
                    <div className="card-body gap-4 p-6">
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-semibold">
                                    Categoría{' '}
                                    <span className="text-error">*</span>
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

                {/* --- UNIVERSO Y DISEÑO --- */}
                <section className="card border border-base-200 bg-base-100 shadow-sm">
                    <div className="border-b border-base-200 bg-base-200/30 px-6 py-4">
                        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-base-content/80">
                            🌌 Colección
                        </h3>
                    </div>
                    <div className="card-body gap-4 p-6">
                        <label className="form-control w-full">
                            <div className="label w-full flex justify-between items-center pr-1">
                                <span className="label-text font-semibold">
                                    Tema
                                </span>
                                <button
                                    type="button"
                                    className="btn btn-xs btn-circle btn-ghost text-primary hover:bg-primary/10"
                                    title="Crear nuevo Tema"
                                    onClick={() => setIsThemeModalOpen(true)}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="w-5 h-5"
                                    >
                                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                    </svg>
                                </button>
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
                                {localThemes.map((item) => (
                                    <option key={item._id} value={item.name}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="form-control w-full">
                            <div className="label w-full flex justify-between items-center pr-1">
                                <span className="label-text font-semibold">
                                    Franquicia
                                </span>
                                <button
                                    type="button"
                                    className="btn btn-xs btn-circle btn-ghost text-primary hover:bg-primary/10"
                                    title="Crear nueva Franquicia"
                                    onClick={() =>
                                        setIsFranchiseModalOpen(true)
                                    }
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="w-5 h-5"
                                    >
                                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                    </svg>
                                </button>
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
                                {localFranchises.map((item) => (
                                    <option key={item._id} value={item.name}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-semibold">
                                    Personaje / Motivo
                                </span>
                            </div>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-base-100"
                                placeholder="Ej. Goku..."
                                value={template.character_name || ''}
                                onChange={(e) =>
                                    setTemplate((prev) => ({
                                        ...prev,
                                        character_name: e.target.value,
                                    }))
                                }
                                disabled={!template.franchise_name}
                            />
                        </label>
                    </div>
                </section>
            </div>

            <AddEntityModal
                isOpen={isThemeModalOpen}
                onClose={() => setIsThemeModalOpen(false)}
                onSave={handleSaveTheme}
                title="Agregar Nuevo Tema"
                placeholder="Ej: Steampunk, Minimalista..."
            />

            <AddEntityModal
                isOpen={isFranchiseModalOpen}
                onClose={() => setIsFranchiseModalOpen(false)}
                onSave={handleSaveFranchise}
                title="Agregar Nueva Franquicia"
                placeholder="Ej: Star Wars, Marvel..."
            />
        </div>
    )
}

export default ProductAttributesForm
