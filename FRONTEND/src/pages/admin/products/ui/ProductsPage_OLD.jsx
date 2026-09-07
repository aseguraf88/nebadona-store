import { useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useProduct } from '../../../../entities/product'
import {
    getProductTypesByCategory,
    SIZE_OPTIONS,
} from '../../../../entities/product'
// Asegúrate de que esta ruta sea la correcta hacia tu ProductCard real
import { ProductCard } from '../../../../entities/product'
import { ProductAttributesForm } from '../../../../features/products'
import { CatalogManagerModal } from '../../../../features/products'
import { ProductEditModal } from '../../../../features/products'
import { CsvImportModal } from '../../../../features/products'
import { ConfirmationModal } from '../../../../shared/ui'

const buildImageFromUrl = (url) => ({
    id: crypto.randomUUID(),
    src: url,
    file: null,
    isObjectUrl: false,
})

const EMPTY_TEMPLATE = {
    handle: '', // NUEVO
    title: 'Titulo',
    description:
        'Producto editable desde dashboard. Descripcion base para crear o editar productos sin bloquear el guardado.',
    product_category: '',
    gender: 'unisex', // NUEVO
    material: '', // NUEVO
    franchise_name: '',
    character_name: '',
    design_theme: '',
    price: '0000', // Precio Base
    compareAtPrice: '',
    cost_price: '', // NUEVO
    tags: '',
    featured: false,
    popular: false,
    isActive: true,
    status: 'DRAFT', // NUEVO
    images: [],
    // EL NUEVO CORAZÓN DEL PRODUCTO:
    variants: [
        {
            sku: '',
            size: '',
            baseColor: '',
            designColors: [],
            stock: 0,
            price: '',
        },
    ],
}

const normalizeTemplateColors = (value) => {
    if (Array.isArray(value?.colors) && value.colors.length) return value.colors

    if (value?.color) {
        return [
            {
                name: value.color,
                hex: value.color,
                percentage: 100,
                source: 'manual',
                selected: true,
            },
        ]
    }

    return []
}

const normalizeTemplate = (value) => ({
    handle: value.handle || '',
    title: value.title || 'Titulo',
    description: value.description || '',
    product_category: value.product_category || '',
    gender: value.gender || 'unisex',
    material: value.material || '',
    franchise_name: value.franchise_name || '',
    character_name: value.character_name || '',
    design_theme: value.design_theme || '',
    price: value.price || '0000',
    compareAtPrice: value.compareAtPrice || '',
    cost_price: value.cost_price || '',
    tags: value.tags || '',
    featured: Boolean(value.featured),
    popular: Boolean(value.popular),
    isActive: Boolean(value.isActive),
    status: value.status || 'DRAFT', // 🔥 ¡EL CABLE DEL ESTADO!
    variants: Array.isArray(value.variants)
        ? value.variants
        : EMPTY_TEMPLATE.variants,
    images: Array.isArray(value.images)
        ? value.images.map((image) => image.src)
        : [],
})

const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })

const ProductsPage = () => {
    const {
        products,
        productsLoading,
        fetchProducts,
        createProduct,
        updateProduct,
        productCategories,
        designThemes,
        franchiseNames,
        createProductCategory,
        updateProductCategory,
        deleteProductCategory,
        createDesignTheme,
        updateDesignTheme,
        deleteDesignTheme,
        createFranchiseName,
        updateFranchiseName,
        deleteFranchiseName,
    } = useProduct()

    const [activeMode, setActiveMode] = useState('create')
    const [selectedProductId, setSelectedProductId] = useState(null)
    const [template, setTemplate] = useState(EMPTY_TEMPLATE)
    const [savedTemplate, setSavedTemplate] = useState(EMPTY_TEMPLATE)

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
    const [isFranchiseModalOpen, setIsFranchiseModalOpen] = useState(false)
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false)
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
    const [isCsvModalOpen, setIsCsvModalOpen] = useState(false)

    const [isSaving, setIsSaving] = useState(false)
    const [editSearch, setEditSearch] = useState('')
    const [categoryDraft, setCategoryDraft] = useState('')
    const [franchiseDraft, setFranchiseDraft] = useState('')
    const [themeDraft, setThemeDraft] = useState('')
    const [editingCategoryId, setEditingCategoryId] = useState('')
    const [editingCategoryName, setEditingCategoryName] = useState('')
    const [editingFranchiseId, setEditingFranchiseId] = useState('')
    const [editingFranchiseName, setEditingFranchiseName] = useState('')
    const [editingThemeId, setEditingThemeId] = useState('')
    const [editingThemeName, setEditingThemeName] = useState('')
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        open: false,
        entityType: '',
        id: '',
        name: '',
    })

    const openCreateTemplate = () => {
        setActiveMode('create')
        setSelectedProductId(null)
        setTemplate(EMPTY_TEMPLATE)
        setSavedTemplate(EMPTY_TEMPLATE)
        setCurrentImageIndex(0)
    }

    const openEditSelector = () => {
        setIsEditModalOpen(true)
        setEditSearch('')
    }

    const filteredProducts = useMemo(() => {
        const query = editSearch.trim().toLowerCase()
        if (!query) return products

        return products.filter((product) =>
            product?.name?.toLowerCase().includes(query),
        )
    }, [products, editSearch])

    const handleSelectProduct = (product) => {
        const selectedTemplate = {
            handle: product?.handle || '',
            title: product?.name || 'Titulo',
            description: product?.description || EMPTY_TEMPLATE.description,
            product_category: product?.product_category || '',
            gender: product?.gender || 'unisex',
            material: product?.material || '',
            franchise_name: product?.franchise_name || '',
            character_name: product?.character_name || '',
            design_theme: product?.design_theme || '',
            price:
                product?.price === 0 || product?.price
                    ? String(product.price)
                    : '0000',
            compareAtPrice: product?.compareAtPrice
                ? String(product.compareAtPrice)
                : '',
            cost_price: product?.cost_price ? String(product.cost_price) : '',
            tags: Array.isArray(product?.tags) ? product.tags.join(', ') : '',
            featured: Boolean(product?.featured),
            popular: Boolean(product?.popular),
            isActive: product?.isActive ?? false,
            status: product?.status || 'DRAFT',

            // LA MAGIA ESTÁ AQUÍ: Leemos el array de variantes de Mongoose
            variants:
                Array.isArray(product?.variants) && product.variants.length > 0
                    ? product.variants.map((v) => ({
                          sku: v.sku || '',
                          size: v.size || '',
                          baseColor: v.baseColor || '',
                          designColors: Array.isArray(v.designColors)
                              ? v.designColors
                              : [],
                          stock: Number(v.stock || 0),
                          price: v.price ? String(v.price) : '',
                      }))
                    : EMPTY_TEMPLATE.variants,

            images: (Array.isArray(product?.imageUrls)
                ? product.imageUrls
                : product?.imageUrl
                  ? [product.imageUrl]
                  : []
            )
                .filter(Boolean)
                .slice(0, 6)
                .map((url) => buildImageFromUrl(url)),
        }

        setActiveMode('edit')
        setSelectedProductId(product?._id || null)
        setTemplate(selectedTemplate)
        setSavedTemplate(selectedTemplate)
        setCurrentImageIndex(0)
        setIsEditModalOpen(false)
    }

    const hasUnsavedChanges =
        JSON.stringify(normalizeTemplate(template)) !==
        JSON.stringify(normalizeTemplate(savedTemplate))

    const handleConfirmSave = async () => {
        setIsSaving(true)

        try {
            const imageUrls = (
                await Promise.all(
                    template.images.slice(0, 6).map(async (image) => {
                        if (image.file) {
                            return readFileAsDataUrl(image.file)
                        }
                        return image.src
                    }),
                )
            ).filter(Boolean)

            const normalizedColors = normalizeTemplateColors(template)
            const parsedTags = String(template.tags || '')
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
                .slice(0, 10)

            const parsedCompareAtPrice =
                template.compareAtPrice === ''
                    ? null
                    : Number(template.compareAtPrice)
            const parsedCostPrice =
                template.cost_price === '' ? null : Number(template.cost_price)

            const payload = {
                handle: template.handle?.trim().toUpperCase() || '',
                name: (template.title || 'Titulo').trim(),
                description: template.description || '',
                product_category: template.product_category || '',
                gender: template.gender || 'unisex',
                material: template.material?.trim().toLowerCase() || null,
                franchise_name:
                    template.franchise_name?.trim().toLowerCase() || null,
                character_name:
                    template.character_name?.trim().toLowerCase() || null,
                design_theme:
                    template.design_theme?.trim().toLowerCase() || null,
                price: Number(template.price || 0),
                compareAtPrice: Number.isNaN(parsedCompareAtPrice)
                    ? null
                    : parsedCompareAtPrice,
                cost_price: Number.isNaN(parsedCostPrice)
                    ? null
                    : parsedCostPrice,
                imageUrl: imageUrls[0] || '',
                imageUrls,
                isActive: template.isActive ?? false,
                featured: Boolean(template.featured),
                popular: Boolean(template.popular),
                tags: parsedTags,
                status: template.status || 'DRAFT',

                // AQUÍ VAN LAS VARIANTES EMPAQUETADAS
                variants: template.variants.map((v) => ({
                    sku: v.sku?.trim().toUpperCase() || '',
                    size: v.size?.trim().toUpperCase() || null,
                    baseColor: v.baseColor?.trim().toLowerCase() || null,
                    designColors: Array.isArray(v.designColors)
                        ? v.designColors
                        : [],
                    stock: Number(v.stock || 0),
                    price: v.price ? Number(v.price) : null,
                })),
            }

            let result

            if (activeMode === 'edit' && selectedProductId) {
                result = await updateProduct(selectedProductId, payload)
            } else {
                result = await createProduct(payload)

                if (result?.success) {
                    setActiveMode('edit')
                    if (result?.product?._id) {
                        setSelectedProductId(result.product._id)
                    }
                }
            }

            // --- LÓGICA ACTUALIZADA DE RESETEO Y TOAST ---
            if (result?.success) {
                toast.success('¡Producto guardado exitosamente!')

                if (activeMode === 'create') {
                    // Limpia el formulario para ingresar uno nuevo de inmediato
                    openCreateTemplate()
                } else {
                    // Actualiza la base para seguir editando
                    const persistedTemplate = {
                        ...template,
                        images: imageUrls.map((src) => ({
                            id: crypto.randomUUID(),
                            src,
                            file: null,
                            isObjectUrl: false,
                        })),
                    }
                    setTemplate(persistedTemplate)
                    setSavedTemplate(persistedTemplate)
                }
            } else {
                toast.error(
                    result?.message || 'No fue posible guardar cambios.',
                )
            }
        } catch {
            toast.error('Ocurrio un error al guardar cambios.')
        } finally {
            setIsSaving(false)
            setIsSaveModalOpen(false)
        }
    }

    const currentProductTypeOptions = getProductTypesByCategory(
        template.product_category,
    )

    const handleCategoryCreate = async () => {
        const normalizedName = categoryDraft.trim()
        if (!normalizedName) return
        const result = await createProductCategory(normalizedName)
        if (result?.success) {
            setCategoryDraft('')
            toast.success(result.message)
        } else toast.error(result?.message || 'No se pudo crear la categoria.')
    }

    const handleFranchiseCreate = async () => {
        const normalizedName = franchiseDraft.trim()
        if (!normalizedName) return
        const result = await createFranchiseName(normalizedName)
        if (result?.success) {
            setFranchiseDraft('')
            toast.success(result.message)
        } else toast.error(result?.message || 'No se pudo crear la franquicia.')
    }

    const handleThemeCreate = async () => {
        const normalizedName = themeDraft.trim()
        if (!normalizedName) return
        const result = await createDesignTheme(normalizedName)
        if (result?.success) {
            setThemeDraft('')
            toast.success(result.message)
        } else toast.error(result?.message || 'No se pudo crear el tema.')
    }

    const startCategoryEditing = (item) => {
        setEditingCategoryId(item._id)
        setEditingCategoryName(item.name)
    }
    const cancelCategoryEditing = () => {
        setEditingCategoryId('')
        setEditingCategoryName('')
    }
    const handleCategoryUpdate = async () => {
        if (!editingCategoryId || !editingCategoryName.trim()) return
        const result = await updateProductCategory(
            editingCategoryId,
            editingCategoryName,
        )
        if (result?.success) {
            toast.success(result.message)
            cancelCategoryEditing()
        } else
            toast.error(
                result?.message || 'No se pudo actualizar la categoria.',
            )
    }
    const handleCategoryDelete = async (id) => {
        const result = await deleteProductCategory(id)
        if (result?.success) {
            toast.success(result.message)
            if (editingCategoryId === id) cancelCategoryEditing()
        } else
            toast.error(result?.message || 'No se pudo eliminar la categoria.')
    }

    const requestCategoryDelete = (item) =>
        setDeleteConfirmation({
            open: true,
            entityType: 'category',
            id: item._id,
            name: item.name,
        })

    const startFranchiseEditing = (item) => {
        setEditingFranchiseId(item._id)
        setEditingFranchiseName(item.name)
    }
    const cancelFranchiseEditing = () => {
        setEditingFranchiseId('')
        setEditingFranchiseName('')
    }
    const handleFranchiseUpdate = async () => {
        if (!editingFranchiseId || !editingFranchiseName.trim()) return
        const result = await updateFranchiseName(
            editingFranchiseId,
            editingFranchiseName,
        )
        if (result?.success) {
            toast.success(result.message)
            cancelFranchiseEditing()
        } else
            toast.error(
                result?.message || 'No se pudo actualizar la franquicia.',
            )
    }
    const handleFranchiseDelete = async (id) => {
        const result = await deleteFranchiseName(id)
        if (result?.success) {
            toast.success(result.message)
            if (editingFranchiseId === id) cancelFranchiseEditing()
        } else
            toast.error(result?.message || 'No se pudo eliminar la franquicia.')
    }

    const requestFranchiseDelete = (item) =>
        setDeleteConfirmation({
            open: true,
            entityType: 'franchise',
            id: item._id,
            name: item.name,
        })

    const startThemeEditing = (item) => {
        setEditingThemeId(item._id)
        setEditingThemeName(item.name)
    }
    const cancelThemeEditing = () => {
        setEditingThemeId('')
        setEditingThemeName('')
    }
    const handleThemeUpdate = async () => {
        if (!editingThemeId || !editingThemeName.trim()) return
        const result = await updateDesignTheme(editingThemeId, editingThemeName)
        if (result?.success) {
            toast.success(result.message)
            cancelThemeEditing()
        } else toast.error(result?.message || 'No se pudo actualizar el tema.')
    }
    const handleThemeDelete = async (id) => {
        const result = await deleteDesignTheme(id)
        if (result?.success) {
            toast.success(result.message)
            if (editingThemeId === id) cancelThemeEditing()
        } else toast.error(result?.message || 'No se pudo eliminar el tema.')
    }

    const requestThemeDelete = (item) =>
        setDeleteConfirmation({
            open: true,
            entityType: 'theme',
            id: item._id,
            name: item.name,
        })
    const closeDeleteConfirmation = () =>
        setDeleteConfirmation({ open: false, entityType: '', id: '', name: '' })

    const handleConfirmDelete = async () => {
        const { entityType, id } = deleteConfirmation
        if (!id) return
        if (entityType === 'category') await handleCategoryDelete(id)
        if (entityType === 'franchise') await handleFranchiseDelete(id)
        if (entityType === 'theme') await handleThemeDelete(id)
        closeDeleteConfirmation()
    }

    // --- NUEVO: VALIDACIÓN ESTRICTA DE FORMULARIO ---
    const isFormValid =
        template.title &&
        template.title !== 'Titulo' &&
        template.title.trim() !== '' &&
        template.price &&
        template.price !== '0000' &&
        String(template.price).trim() !== '' &&
        template.product_category &&
        template.product_category !== ''

    // --- NUEVO: ADAPTADOR PARA TARJETA PÚBLICA ---
    const previewProduct = {
        _id: 'preview-id',
        name:
            template.title !== 'Titulo'
                ? template.title
                : 'Nombre de tu producto',
        price: template.price !== '0000' ? Number(template.price) : 0,
        compareAtPrice: template.compareAtPrice
            ? Number(template.compareAtPrice)
            : null,
        description: template.description,
        category: template.product_category || 'Categoría',
        imageUrl:
            template.images?.[0]?.src ||
            '[https://via.placeholder.com/400x400?text=Sin+Imagen](https://via.placeholder.com/400x400?text=Sin+Imagen)',
        imageUrls: template.images.map((img) => img.src),
        stock: Number(template.stock) || 0,
        tags: template.tags
            ? template.tags.split(',').map((t) => t.trim())
            : [],
        isNew: true,
    }

    return (
        <div className="flex w-full flex-col gap-6 pb-12">
            <section className="card relative w-full bg-base-100 shadow-xl border border-base-200">
                {/* BARRA DE HERRAMIENTAS HORIZONTAL (Optimizada para Móvil y Desktop) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-b border-base-200 bg-base-200/30 p-4 rounded-t-2xl">
                    {/* Grupo de botones secundarios (Grid de 2 columnas en móvil, línea en PC) */}
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
                        <button
                            type="button"
                            className={`btn btn-sm ${activeMode === 'create' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={openCreateTemplate}
                        >
                            ➕ Crear
                        </button>
                        <button
                            type="button"
                            className={`btn btn-sm ${activeMode === 'edit' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={openEditSelector}
                        >
                            ✏️ Editar
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            onClick={() => setIsCsvModalOpen(true)}
                        >
                            <i className="ti ti-file-upload text-base" />
                            Importar CSV
                        </button>
                        {/* NUEVO BOTÓN PARA EXPORTAR */}
                        <a
                            href="http://localhost:3001/api/products/export/csv"
                            download="inventario_nebadon.csv"
                            className="btn btn-sm btn-outline btn-success"
                        >
                            <i className="ti ti-file-download text-base" />
                            Exportar CSV
                        </a>
                    </div>

                    {/* Botón Guardar - 100% de ancho en móvil, flotando a la derecha en PC */}
                    <button
                        type="button"
                        className="btn btn-primary btn-sm w-full sm:w-auto sm:ml-auto shadow-md mt-1 sm:mt-0"
                        disabled={
                            !hasUnsavedChanges || isSaving || !isFormValid
                        }
                        onClick={() => setIsSaveModalOpen(true)}
                    >
                        {isSaving ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            '💾 Guardar Cambios'
                        )}
                    </button>
                </div>

                <div className="p-6 lg:p-8 bg-base-200/10">
                    <div className="mb-6">
                        <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-1">
                            {activeMode === 'edit'
                                ? 'Modo Edición'
                                : 'Modo Creación'}
                        </p>
                        <h2 className="text-2xl font-black text-base-content tracking-tight">
                            {activeMode === 'edit'
                                ? 'Editar Producto'
                                : 'Nuevo Producto'}
                        </h2>
                    </div>

                    {/* FORMULARIO ÚNICO CENTRADO */}
                    <ProductAttributesForm
                        template={template}
                        setTemplate={setTemplate}
                        productCategories={productCategories}
                        designThemes={designThemes}
                        franchiseNames={franchiseNames}
                        currentProductTypeOptions={currentProductTypeOptions}
                        sizeOptions={SIZE_OPTIONS}
                    />
                </div>
            </section>

            {/* --- NUEVO MODAL: VISTA PREVIA CON TU TARJETA REAL --- */}
            <dialog
                className={`modal ${isPreviewModalOpen ? 'modal-open' : ''} modal-bottom sm:modal-middle bg-base-300/80 backdrop-blur-sm`}
            >
                <div className="modal-box bg-transparent shadow-none w-full max-w-sm p-0 mx-auto relative overflow-visible">
                    <button
                        className="btn btn-sm btn-circle btn-neutral absolute -right-4 -top-4 z-50 shadow-xl border-2 border-base-100"
                        onClick={() => setIsPreviewModalOpen(false)}
                    >
                        ✕
                    </button>

                    <div className="bg-base-200 p-4 rounded-3xl shadow-2xl border border-base-300 pointer-events-none">
                        <div className="text-center mb-4 text-xs font-bold text-base-content/50 uppercase tracking-widest">
                            Vista Previa del Cliente
                        </div>

                        <ProductCard product={previewProduct} />
                    </div>
                </div>
                <form
                    method="dialog"
                    className="modal-backdrop"
                    onClick={() => setIsPreviewModalOpen(false)}
                >
                    <button>cerrar</button>
                </form>
            </dialog>

            {/* MODALES CLÁSICOS MANTENIDOS INTACTOS */}
            <CatalogManagerModal
                open={isCategoryModalOpen}
                title="Categorias"
                placeholder="Nueva categoria"
                draft={categoryDraft}
                setDraft={setCategoryDraft}
                onCreate={handleCategoryCreate}
                items={productCategories}
                emptyMessage="No hay categorias cargadas."
                editingId={editingCategoryId}
                editingName={editingCategoryName}
                setEditingName={setEditingCategoryName}
                onStartEditing={startCategoryEditing}
                onSaveEditing={handleCategoryUpdate}
                onCancelEditing={cancelCategoryEditing}
                onRequestDelete={requestCategoryDelete}
                onClose={() => {
                    cancelCategoryEditing()
                    setIsCategoryModalOpen(false)
                }}
            />

            <CatalogManagerModal
                open={isFranchiseModalOpen}
                title="Franquicias"
                placeholder="Nueva franquicia"
                draft={franchiseDraft}
                setDraft={setFranchiseDraft}
                onCreate={handleFranchiseCreate}
                items={franchiseNames}
                emptyMessage="No hay franquicias cargadas."
                editingId={editingFranchiseId}
                editingName={editingFranchiseName}
                setEditingName={setEditingFranchiseName}
                onStartEditing={startFranchiseEditing}
                onSaveEditing={handleFranchiseUpdate}
                onCancelEditing={cancelFranchiseEditing}
                onRequestDelete={requestFranchiseDelete}
                onClose={() => {
                    cancelFranchiseEditing()
                    setIsFranchiseModalOpen(false)
                }}
            />

            <CatalogManagerModal
                open={isThemeModalOpen}
                title="Temas"
                placeholder="Nuevo tema"
                draft={themeDraft}
                setDraft={setThemeDraft}
                onCreate={handleThemeCreate}
                items={designThemes}
                emptyMessage="No hay temas cargados."
                editingId={editingThemeId}
                editingName={editingThemeName}
                setEditingName={setEditingThemeName}
                onStartEditing={startThemeEditing}
                onSaveEditing={handleThemeUpdate}
                onCancelEditing={cancelThemeEditing}
                onRequestDelete={requestThemeDelete}
                onClose={() => {
                    cancelThemeEditing()
                    setIsThemeModalOpen(false)
                }}
            />

            <ProductEditModal
                open={isEditModalOpen}
                editSearch={editSearch}
                setEditSearch={setEditSearch}
                productsLoading={productsLoading}
                filteredProducts={filteredProducts}
                handleSelectProduct={handleSelectProduct}
                onClose={() => setIsEditModalOpen(false)}
            />

            <ConfirmationModal
                open={isSaveModalOpen}
                title="¿Guardar cambios efectuados?"
                onConfirm={handleConfirmSave}
                onCancel={() => setIsSaveModalOpen(false)}
                isConfirming={isSaving}
                confirmLabel="Sí"
            />

            <ConfirmationModal
                open={deleteConfirmation.open}
                title="Confirmar eliminación"
                message={`¿Seguro que deseas eliminar "${deleteConfirmation.name}"?`}
                onConfirm={handleConfirmDelete}
                onCancel={closeDeleteConfirmation}
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                confirmButtonClass="btn btn-error"
            />

            <CsvImportModal
                open={isCsvModalOpen}
                onClose={() => setIsCsvModalOpen(false)}
                onSuccess={() => {
                    setIsCsvModalOpen(false) // Cierra el modal
                    openCreateTemplate() // Limpia cualquier cosa a medio editar en el form
                    if (fetchProducts) fetchProducts() // <-- RECARGA LA BASE DE DATOS MÁGICAMENTE
                }}
            />
        </div>
    )
}

export default ProductsPage
