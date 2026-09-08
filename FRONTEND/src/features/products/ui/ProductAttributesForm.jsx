import { useEffect, useState } from 'react'
import { AddEntityModal } from '../../products'
import { ProductImagesModal } from '../../products'

// Helper simple para autogenerar SKU de variante si se desea
const generateVariantSku = (handle, size, baseColor) => {
    if (!handle) return ''
    const sizePart = size ? `-${size.toUpperCase().trim()}` : ''
    const colorPart = baseColor
        ? `-${baseColor.substring(0, 3).toUpperCase().trim()}`
        : ''
    return `${handle.toUpperCase().trim()}${sizePart}${colorPart}`
}

const ProductAttributesForm = ({
    template,
    setTemplate,
    productCategories,
    designThemes,
    franchiseNames,
    sizeOptions,
    currentProductTypeOptions, // <-- Añadido aquí para que funcione la lista de Tipos
}) => {
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false)
    const [isFranchiseModalOpen, setIsFranchiseModalOpen] = useState(false)
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [dragIndex, setDragIndex] = useState(null)

    const [localThemes, setLocalThemes] = useState([])
    const [localFranchises, setLocalFranchises] = useState([])

    useEffect(() => {
        if (designThemes) setLocalThemes(designThemes)
        if (franchiseNames) setLocalFranchises(franchiseNames)
    }, [designThemes, franchiseNames])

    // LÓGICA DE IMÁGENES
    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files || [])
        if (!files.length) return
        setTemplate((prev) => ({
            ...prev,
            images: [
                ...prev.images,
                ...files
                    .slice(0, Math.max(0, 6 - prev.images.length))
                    .map((file) => ({
                        id: crypto.randomUUID(),
                        src: URL.createObjectURL(file),
                        file,
                        isObjectUrl: true,
                    })),
            ],
        }))
        event.target.value = ''
    }

    const handleRemoveImage = (id) => {
        setTemplate((prev) => {
            const imageToDelete = prev.images.find((image) => image.id === id)
            if (imageToDelete?.isObjectUrl)
                URL.revokeObjectURL(imageToDelete.src)
            return {
                ...prev,
                images: prev.images.filter((image) => image.id !== id),
            }
        })
    }

    const handleDropImage = (dropIndex) => {
        if (dragIndex === null || dragIndex === dropIndex) return
        setTemplate((prev) => {
            const reorderedImages = [...prev.images]
            const [draggedItem] = reorderedImages.splice(dragIndex, 1)
            reorderedImages.splice(dropIndex, 0, draggedItem)
            return { ...prev, images: reorderedImages }
        })
        setDragIndex(null)
    }

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

    // MANEJO DE VARIANTES
    const handleVariantChange = (index, field, value) => {
        setTemplate((prev) => {
            const newVariants = [...prev.variants]
            newVariants[index] = { ...newVariants[index], [field]: value }
            // Autogenera el SKU al definir talla o color si la variante no tiene uno
            if (
                (field === 'size' || field === 'baseColor') &&
                !newVariants[index].sku
            ) {
                newVariants[index].sku = generateVariantSku(
                    prev.handle,
                    newVariants[index].size,
                    newVariants[index].baseColor,
                )
            }
            return { ...prev, variants: newVariants }
        })
    }

    const addVariant = () => {
        setTemplate((prev) => ({
            ...prev,
            variants: [
                ...prev.variants,
                {
                    sku: '',
                    size: '',
                    baseColor: '',
                    designColors: [],
                    stock: 0,
                    price: '',
                },
            ],
        }))
    }

    const removeVariant = (index) => {
        if (template.variants.length === 1) return // Obliga a tener al menos 1
        setTemplate((prev) => {
            const newVariants = [...prev.variants]
            newVariants.splice(index, 1)
            return { ...prev, variants: newVariants }
        })
    }

    const hasImages = template.images && template.images.length > 0

    return (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            <div className="flex flex-col gap-6 lg:col-span-8">
                {/* 1. INFORMACIÓN PRINCIPAL */}
                <section className="card bg-base-100 shadow-sm ring-1 ring-base-200">
                    <div className="border-b border-base-200 px-6 py-4 flex items-center gap-2">
                        <i className="ti ti-file-description text-primary text-xl" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-base-content/80">
                            Información Principal
                        </h3>
                    </div>
                    <div className="card-body gap-5 p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="form-control w-full">
                                <div className="label">
                                    <span className="label-text font-semibold text-base-content/80">
                                        Handle (Cód. Agrupador){' '}
                                        <span className="text-error">*</span>
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    className="input input-bordered w-full bg-base-100/50 uppercase font-mono tracking-widest"
                                    placeholder="Ej. POL-SPI-01"
                                    value={template.handle}
                                    onChange={(e) =>
                                        setTemplate((prev) => ({
                                            ...prev,
                                            handle: e.target.value.toUpperCase(),
                                        }))
                                    }
                                />
                            </label>
                            <label className="form-control w-full">
                                <div className="label">
                                    <span className="label-text font-semibold text-base-content/80">
                                        Título del Producto{' '}
                                        <span className="text-error">*</span>
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    className="input input-bordered w-full bg-base-100/50"
                                    placeholder="Ej. Polera de Goku..."
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
                        </div>
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-semibold text-base-content/80">
                                    Descripción
                                </span>
                            </div>
                            <textarea
                                className="textarea textarea-bordered h-24 bg-base-100/50"
                                placeholder="Añade detalles, medidas..."
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

                {/* 2. MULTIMEDIA */}
                <section className="card bg-base-100 shadow-sm ring-1 ring-base-200">
                    <div className="border-b border-base-200 px-6 py-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <i className="ti ti-photo text-base-content/60 text-xl" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-base-content/80">
                                Imágenes
                            </h3>
                        </div>
                        {hasImages && (
                            <button
                                onClick={() => setIsImageModalOpen(true)}
                                className="btn btn-xs btn-outline btn-primary"
                            >
                                Editar Galería
                            </button>
                        )}
                    </div>
                    <div className="card-body p-6">
                        {!hasImages ? (
                            <div
                                onClick={() => setIsImageModalOpen(true)}
                                className="w-full border-2 border-dashed border-base-300 rounded-xl p-8 flex flex-col items-center cursor-pointer bg-base-200/20 hover:bg-base-200/50"
                            >
                                <i className="ti ti-cloud-upload text-4xl text-primary mb-2" />
                                <span className="font-bold text-base-content">
                                    Abrir galería
                                </span>
                            </div>
                        ) : (
                            <div
                                onClick={() => setIsImageModalOpen(true)}
                                className="grid grid-cols-3 sm:grid-cols-6 gap-3 cursor-pointer group relative"
                            >
                                {template.images.map((img, index) => (
                                    <div
                                        key={img.id}
                                        className="aspect-square rounded-lg border border-base-200 overflow-hidden relative bg-base-200"
                                    >
                                        <img
                                            src={img.src}
                                            alt={`Prod ${index}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* 3. PRECIOS GLOBALES */}
                <section className="card bg-base-200/20 border border-base-200 shadow-sm">
                    <div className="border-b border-base-200 px-6 py-4 flex items-center gap-2">
                        <i className="ti ti-cash text-base-content/60 text-xl" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-base-content/80">
                            Precios Globales
                        </h3>
                    </div>
                    <div className="card-body gap-4 p-6 grid grid-cols-1 sm:grid-cols-3">
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-semibold">
                                    Precio Base ($){' '}
                                    <span className="text-error">*</span>
                                </span>
                            </div>
                            <input
                                type="number"
                                className="input input-bordered w-full font-bold text-base-content"
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
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-semibold">
                                    Precio Oferta ($)
                                </span>
                            </div>
                            <input
                                type="number"
                                className="input input-bordered w-full text-error"
                                value={template.compareAtPrice}
                                onChange={(e) =>
                                    setTemplate((prev) => ({
                                        ...prev,
                                        compareAtPrice: e.target.value,
                                    }))
                                }
                            />
                        </label>
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-semibold">
                                    Costo Bodega ($)
                                </span>
                            </div>
                            <input
                                type="number"
                                className="input input-bordered w-full text-success"
                                value={template.cost_price}
                                onChange={(e) =>
                                    setTemplate((prev) => ({
                                        ...prev,
                                        cost_price: e.target.value,
                                    }))
                                }
                            />
                        </label>
                    </div>
                </section>

                {/* 4. VARIANTES (EL NUEVO CORAZÓN) */}
                <section className="card bg-base-100 border border-base-200 shadow-sm">
                    <div className="border-b border-base-200 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <i className="ti ti-box text-base-content/60 text-xl" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-base-content/80">
                                Variantes y Stock
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="btn btn-sm btn-primary btn-outline"
                        >
                            + Agregar Variante
                        </button>
                    </div>
                    <div className="card-body p-0 overflow-x-auto">
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
                                                    onClick={() =>
                                                        handleVariantChange(
                                                            idx,
                                                            'sku',
                                                            generateVariantSku(
                                                                template.handle,
                                                                v.size,
                                                                v.baseColor,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <i className="ti ti-wand" />
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
                                                        e.target.value.split(','),
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
                                                        Number(e.target.value),
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
                </section>

            </div>

            {/* COLUMNA DERECHA */}
            <div className="flex flex-col gap-6 lg:col-span-4">
                {/* ESTADO */}
                <section className="card bg-base-100 shadow-sm ring-1 ring-base-200">
                    <div className="border-b border-base-200 px-6 py-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-base-content/80">
                            Visibilidad
                        </h3>
                    </div>
                    <div className="card-body gap-4 p-6">
                        <label className="form-control w-full mb-2">
                            <div className="label">
                                <span className="label-text font-semibold">
                                    Estado de Publicación
                                </span>
                            </div>
                            <select
                                className={`select select-bordered w-full font-bold ${template.status === 'PUBLISHED' ? 'text-success' : 'text-warning'}`}
                                value={template.status}
                                onChange={(e) =>
                                    setTemplate((prev) => ({
                                        ...prev,
                                        status: e.target.value,
                                    }))
                                }
                            >
                                <option value="DRAFT">Borrador (Oculto)</option>
                                <option value="PUBLISHED">
                                    Publicado (Visible)
                                </option>
                            </select>
                        </label>

                        <label className="flex cursor-pointer items-center justify-between gap-3 border-t border-base-200 pt-4">
                            <span className="label-text font-medium text-base-content/80">
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
                            <span className="label-text font-medium text-base-content/80">
                                Popular
                            </span>
                            <input
                                type="checkbox"
                                className="toggle toggle-primary toggle-sm"
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
                </section>

                {/* ORGANIZACIÓN Y TAXONOMÍA */}
                <section className="card bg-base-100 shadow-sm ring-1 ring-base-200">
                    <div className="border-b border-base-200 px-6 py-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-base-content/80">
                            Organización
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
                                        sock_type: '', // Resetea el tipo si cambia la categoría
                                    }))
                                }
                            >
                                <option value="">Selecciona...</option>
                                {productCategories?.map((item) => (
                                    <option key={item._id} value={item.name}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {/* --- AQUÍ VOLVIÓ EL TIPO --- */}
                        <label className="form-control w-full animate-fadeIn">
                            <div className="label">
                                <span className="label-text font-semibold text-base-content/80">
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
                                {currentProductTypeOptions?.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </label>
                        {/* --------------------------- */}

                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-semibold">
                                    Género
                                </span>
                            </div>
                            <select
                                className="select select-bordered w-full bg-base-100"
                                value={template.gender}
                                onChange={(e) =>
                                    setTemplate((prev) => ({
                                        ...prev,
                                        gender: e.target.value,
                                    }))
                                }
                            >
                                <option value="unisex">Unisex</option>
                                <option value="men">Hombre</option>
                                <option value="women">Mujer</option>
                                <option value="kids">Niños</option>
                            </select>
                        </label>
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-semibold">
                                    Material
                                </span>
                            </div>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                placeholder="Ej. Algodón"
                                value={template.material || ''}
                                onChange={(e) =>
                                    setTemplate((prev) => ({
                                        ...prev,
                                        material: e.target.value,
                                    }))
                                }
                            />
                        </label>

                        <div className="divider my-0"></div>

                        <label className="form-control w-full">
                            <div className="label w-full flex justify-between items-center pr-1">
                                <span className="label-text font-semibold">
                                    Franquicia
                                </span>
                                <button
                                    type="button"
                                    className="btn btn-xs btn-circle btn-ghost text-primary"
                                    onClick={() =>
                                        setIsFranchiseModalOpen(true)
                                    }
                                >
                                    <i className="ti ti-plus" />
                                </button>
                            </div>
                            <select
                                className="select select-bordered w-full"
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
                                    Personaje
                                </span>
                            </div>
                            <input
                                type="text"
                                className="input input-bordered w-full"
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
                        <label className="form-control w-full">
                            <div className="label w-full flex justify-between items-center pr-1">
                                <span className="label-text font-semibold">
                                    Tema
                                </span>
                                <button
                                    type="button"
                                    className="btn btn-xs btn-circle btn-ghost text-primary"
                                    onClick={() => setIsThemeModalOpen(true)}
                                >
                                    <i className="ti ti-plus" />
                                </button>
                            </div>
                            <select
                                className="select select-bordered w-full"
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
                            <div className="label">
                                <span className="label-text font-semibold">
                                    Etiquetas (Tags)
                                </span>
                            </div>
                            <input
                                type="text"
                                className="input input-bordered w-full"
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
            </div>

            {/* MODALES MANTENIDOS INTACTOS */}
            <AddEntityModal
                isOpen={isThemeModalOpen}
                onClose={() => setIsThemeModalOpen(false)}
                onSave={handleSaveTheme}
                title="Agregar Tema"
                placeholder="Ej: Steampunk..."
            />
            <AddEntityModal
                isOpen={isFranchiseModalOpen}
                onClose={() => setIsFranchiseModalOpen(false)}
                onSave={handleSaveFranchise}
                title="Agregar Franquicia"
                placeholder="Ej: Marvel..."
            />
            <ProductImagesModal
                open={isImageModalOpen}
                template={template}
                setTemplate={setTemplate}
                setDragIndex={setDragIndex}
                handleDropImage={handleDropImage}
                handleImageUpload={handleImageUpload}
                handleRemoveImage={handleRemoveImage}
                onClose={() => setIsImageModalOpen(false)}
            />
        </div>
    )
}

export default ProductAttributesForm
