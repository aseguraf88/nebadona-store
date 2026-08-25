import { useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useProduct } from '../../../../context/ProductContext'
import {
    getProductTypesByCategory,
    SIZE_OPTIONS,
} from '../../../../constants/productTypeOptions'
import DashboardActionsSidebar from '../components/DashboardActionsSidebar'
import ProductPreviewCard from '../components/ProductPreviewCard'
import ProductAttributesForm from '../components/ProductAttributesForm'
import CatalogManagerModal from '../modals/CatalogManagerModal'
import ProductImagesModal from '../modals/ProductImagesModal'
import ProductEditModal from '../modals/ProductEditModal'
import ConfirmationModal from '../modals/ConfirmationModal'

const buildImageFromUrl = (url) => ({
    id: crypto.randomUUID(),
    src: url,
    file: null,
    isObjectUrl: false,
})

const EMPTY_TEMPLATE = {
    title: 'Titulo',
    price: '0000',
    description:
        'Producto editable desde dashboard. Descripcion base para crear o editar productos sin bloquear el guardado.',
    stock: 0,
    sku: '',
    compareAtPrice: '',
    tags: '',
    featured: false,
    popular: false,
    isActive: true,
    color: '',
    colors: [],
    colorFamily: '',
    size: '',
    sock_type: '',
    product_category: '',
    design_theme: '',
    franchise_name: '',
    character_name: '',
    images: [],
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
    title: value.title || 'Titulo',
    price: value.price || '0000',
    description: value.description || '',
    stock: Number(value.stock || 0),
    sku: value.sku || '',
    compareAtPrice:
        value.compareAtPrice === null || value.compareAtPrice === undefined
            ? ''
            : String(value.compareAtPrice),
    tags: value.tags || '',
    featured: Boolean(value.featured),
    popular: Boolean(value.popular),
    isActive: value.isActive ?? true,
    color: value.color || '',
    colors: Array.isArray(value.colors) ? value.colors : [],
    size: value.size || '',
    sock_type: value.sock_type || '',
    product_category: value.product_category || '',
    design_theme: value.design_theme || '',
    franchise_name: value.franchise_name || '',
    images: value.images.map((image) => image.src),
})

const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })

const DashboardProductsSection = () => {
    const {
        products,
        productsLoading,
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

    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [activeMode, setActiveMode] = useState('create')
    const [selectedProductId, setSelectedProductId] = useState(null)
    const [template, setTemplate] = useState(EMPTY_TEMPLATE)
    const [savedTemplate, setSavedTemplate] = useState(EMPTY_TEMPLATE)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isTitleEditing, setIsTitleEditing] = useState(false)
    const [isPriceEditing, setIsPriceEditing] = useState(false)
    const [isDescriptionEditing, setIsDescriptionEditing] = useState(false)
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
    const [isFranchiseModalOpen, setIsFranchiseModalOpen] = useState(false)
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [saveFeedback, setSaveFeedback] = useState('')
    const [editSearch, setEditSearch] = useState('')
    const [dragIndex, setDragIndex] = useState(null)
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

    const titleInputRef = useRef(null)
    const priceInputRef = useRef(null)
    const descriptionInputRef = useRef(null)

    const openCreateTemplate = () => {
        setActiveMode('create')
        setSelectedProductId(null)
        setTemplate(EMPTY_TEMPLATE)
        setSavedTemplate(EMPTY_TEMPLATE)
        setCurrentImageIndex(0)
        setIsTitleEditing(false)
        setIsPriceEditing(false)
        setIsDescriptionEditing(false)
        setSaveFeedback('')
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
            title: product?.name || 'Titulo',
            price:
                product?.price === 0 || product?.price
                    ? String(product.price)
                    : '0000',
            description: product?.description || EMPTY_TEMPLATE.description,
            stock: Number(product?.stock || 0),
            sku: product?.sku || '',
            compareAtPrice:
                product?.compareAtPrice === null ||
                product?.compareAtPrice === undefined
                    ? ''
                    : String(product.compareAtPrice),
            tags: Array.isArray(product?.tags) ? product.tags.join(', ') : '',
            featured: Boolean(product?.featured),
            popular: Boolean(product?.popular),
            isActive: product?.isActive ?? true,
            color: product?.color || '',
            colors:
                Array.isArray(product?.colors) && product.colors.length
                    ? product.colors
                    : product?.color
                      ? [
                            {
                                name: product.color,
                                hex: product.color,
                                percentage: 100,
                                source: 'manual',
                                selected: true,
                            },
                        ]
                      : [],
            size: product?.size || '',
            sock_type: product?.sock_type || '',
            product_category: product?.product_category || '',
            design_theme: product?.design_theme || '',
            franchise_name: product?.franchise_name || '',
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
        setIsTitleEditing(false)
        setIsPriceEditing(false)
        setIsDescriptionEditing(false)
        setSaveFeedback('')
    }

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
            if (imageToDelete?.isObjectUrl) {
                URL.revokeObjectURL(imageToDelete.src)
            }

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
            return {
                ...prev,
                images: reorderedImages,
            }
        })

        setDragIndex(null)
    }

    const activeImage =
        template.images.length > 0
            ? template.images[
                  Math.min(
                      currentImageIndex,
                      Math.max(template.images.length - 1, 0),
                  )
              ]?.src
            : ''

    const hasUnsavedChanges =
        JSON.stringify(normalizeTemplate(template)) !==
        JSON.stringify(normalizeTemplate(savedTemplate))

    const handleChangeImage = (step) => {
        if (template.images.length <= 1) return
        setCurrentImageIndex(
            (prev) =>
                (prev + step + template.images.length) % template.images.length,
        )
    }

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

            const payload = {
                name: (template.title || 'Titulo').trim(),
                description: template.description || EMPTY_TEMPLATE.description,
                price: Number(template.price || 0),
                stock: Number(template.stock || 0),
                sku: template.sku?.trim() || undefined,
                imageUrl: imageUrls[0] || '',
                imageUrls,
                color: template.color || normalizedColors[0]?.hex || '',
                colors: normalizedColors,
                colorFamily: template.colorFamily ? [template.colorFamily] : [],
                compareAtPrice: Number.isNaN(parsedCompareAtPrice)
                    ? null
                    : parsedCompareAtPrice,
                tags: parsedTags,
                featured: Boolean(template.featured),
                popular: Boolean(template.popular),
                isActive: template.isActive ?? true,
                size: template.size || '',
                sock_type: template.sock_type || '',
                product_category: template.product_category || '',
                design_theme: template.design_theme || '',
                franchise_name: template.franchise_name || '',
                character_name: template.character_name || '',
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

            if (result?.success) {
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
                setSaveFeedback('Cambios guardados en base de datos.')
            } else {
                setSaveFeedback(
                    result?.message || 'No fue posible guardar cambios.',
                )
            }
        } catch {
            setSaveFeedback('Ocurrio un error al guardar cambios.')
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
        } else {
            toast.error(result?.message || 'No se pudo crear la categoria.')
        }
    }

    const handleFranchiseCreate = async () => {
        const normalizedName = franchiseDraft.trim()
        if (!normalizedName) return

        const result = await createFranchiseName(normalizedName)

        if (result?.success) {
            setFranchiseDraft('')
            toast.success(result.message)
        } else {
            toast.error(result?.message || 'No se pudo crear la franquicia.')
        }
    }

    const handleThemeCreate = async () => {
        const normalizedName = themeDraft.trim()
        if (!normalizedName) return

        const result = await createDesignTheme(normalizedName)

        if (result?.success) {
            setThemeDraft('')
            toast.success(result.message)
        } else {
            toast.error(result?.message || 'No se pudo crear el tema.')
        }
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
        } else {
            toast.error(
                result?.message || 'No se pudo actualizar la categoria.',
            )
        }
    }

    const handleCategoryDelete = async (id) => {
        const result = await deleteProductCategory(id)

        if (result?.success) {
            toast.success(result.message)
            if (editingCategoryId === id) {
                cancelCategoryEditing()
            }
        } else {
            toast.error(result?.message || 'No se pudo eliminar la categoria.')
        }
    }

    const requestCategoryDelete = (item) => {
        setDeleteConfirmation({
            open: true,
            entityType: 'category',
            id: item._id,
            name: item.name,
        })
    }

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
        } else {
            toast.error(
                result?.message || 'No se pudo actualizar la franquicia.',
            )
        }
    }

    const handleFranchiseDelete = async (id) => {
        const result = await deleteFranchiseName(id)

        if (result?.success) {
            toast.success(result.message)
            if (editingFranchiseId === id) {
                cancelFranchiseEditing()
            }
        } else {
            toast.error(result?.message || 'No se pudo eliminar la franquicia.')
        }
    }

    const requestFranchiseDelete = (item) => {
        setDeleteConfirmation({
            open: true,
            entityType: 'franchise',
            id: item._id,
            name: item.name,
        })
    }

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
        } else {
            toast.error(result?.message || 'No se pudo actualizar el tema.')
        }
    }

    const handleThemeDelete = async (id) => {
        const result = await deleteDesignTheme(id)

        if (result?.success) {
            toast.success(result.message)
            if (editingThemeId === id) {
                cancelThemeEditing()
            }
        } else {
            toast.error(result?.message || 'No se pudo eliminar el tema.')
        }
    }

    const requestThemeDelete = (item) => {
        setDeleteConfirmation({
            open: true,
            entityType: 'theme',
            id: item._id,
            name: item.name,
        })
    }

    const closeDeleteConfirmation = () => {
        setDeleteConfirmation({ open: false, entityType: '', id: '', name: '' })
    }

    const handleConfirmDelete = async () => {
        const { entityType, id } = deleteConfirmation
        if (!id) return

        if (entityType === 'category') {
            await handleCategoryDelete(id)
        }

        if (entityType === 'franchise') {
            await handleFranchiseDelete(id)
        }

        if (entityType === 'theme') {
            await handleThemeDelete(id)
        }

        closeDeleteConfirmation()
    }

    return (
        <div
            className={`mx-auto max-w-[1200px] w-full px-4 sm:px-6 lg:px-8 pb-12 mt-4 lg:mt-8 ${
                isDrawerOpen ? 'is-drawer-open drawer-open' : 'is-drawer-close'
            } lg:drawer-open`}
        >
            <input
                id="products-dashboard-drawer"
                type="checkbox"
                className="drawer-toggle"
                checked={isDrawerOpen}
                onChange={(event) => setIsDrawerOpen(event.target.checked)}
            />

            <div className="drawer-content min-h-[calc(100vh-9rem)] rounded-box bg-base-200/60 p-3 sm:p-6">
                <div className="mb-4 lg:hidden">
                    <h1 className="text-lg font-semibold">
                        Dashboard Productos
                    </h1>
                </div>

                <section className="card card-border relative bg-base-100 p-4 sm:p-6">
                    <button
                        type="button"
                        className="btn btn-primary absolute right-4 top-4"
                        disabled={!hasUnsavedChanges || isSaving}
                        onClick={() => setIsSaveModalOpen(true)}
                    >
                        Guardar
                    </button>

                    <div className="mb-4 flex items-center justify-between gap-4 pr-24">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-base-content/60">
                                {activeMode === 'edit'
                                    ? 'Editor de producto'
                                    : 'Creador de producto'}
                            </p>
                            <h2 className="text-xl font-bold text-base-content">
                                {activeMode === 'edit'
                                    ? 'Plantilla editable (Editar)'
                                    : 'Plantilla editable (Crear)'}
                            </h2>
                        </div>
                    </div>

                    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-10">
                        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-4 z-10">
                            <ProductPreviewCard
                                template={template}
                                activeImage={activeImage}
                                currentImageIndex={currentImageIndex}
                                setCurrentImageIndex={setCurrentImageIndex}
                                handleChangeImage={handleChangeImage}
                                onOpenImageModal={() =>
                                    setIsImageModalOpen(true)
                                }
                                isTitleEditing={isTitleEditing}
                                setIsTitleEditing={setIsTitleEditing}
                                isDescriptionEditing={isDescriptionEditing}
                                setIsDescriptionEditing={
                                    setIsDescriptionEditing
                                }
                                isPriceEditing={isPriceEditing}
                                setIsPriceEditing={setIsPriceEditing}
                                titleInputRef={titleInputRef}
                                descriptionInputRef={descriptionInputRef}
                                priceInputRef={priceInputRef}
                                setTemplate={setTemplate}
                                emptyDescription={EMPTY_TEMPLATE.description}
                            />
                        </div>
                        <div className="lg:col-span-7 xl:col-span-8">
                            <ProductAttributesForm
                                template={template}
                                setTemplate={setTemplate}
                                productCategories={productCategories}
                                designThemes={designThemes}
                                franchiseNames={franchiseNames}
                                currentProductTypeOptions={
                                    currentProductTypeOptions
                                }
                                sizeOptions={SIZE_OPTIONS}
                            />
                        </div>
                    </div>

                    {saveFeedback && (
                        <p className="mt-3 text-center text-sm text-success">
                            {saveFeedback}
                        </p>
                    )}
                </section>
            </div>

            {!isDrawerOpen && (
                <label
                    htmlFor="products-dashboard-drawer"
                    className="fixed left-0 top-1/2 z-30 -translate-y-1/2 cursor-pointer rounded-r-box border border-l-0 border-base-300 bg-base-100 px-2 py-3 shadow-sm lg:hidden"
                >
                    <span className="ti ti-menu-2 text-lg" />
                </label>
            )}

            <DashboardActionsSidebar
                isDrawerOpen={isDrawerOpen}
                onOpenCreate={() => {
                    openCreateTemplate()
                    setIsDrawerOpen(false)
                }}
                onOpenEdit={() => {
                    openEditSelector()
                    setIsDrawerOpen(false)
                }}
                onOpenCategories={() => {
                    setIsCategoryModalOpen(true)
                    setIsDrawerOpen(false)
                }}
                onOpenFranchises={() => {
                    setIsFranchiseModalOpen(true)
                    setIsDrawerOpen(false)
                }}
                onOpenThemes={() => {
                    setIsThemeModalOpen(true)
                    setIsDrawerOpen(false)
                }}
            />

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
                title="Guardar cambios efectuados?"
                onConfirm={handleConfirmSave}
                onCancel={() => setIsSaveModalOpen(false)}
                isConfirming={isSaving}
                confirmLabel="Si"
            />

            <ConfirmationModal
                open={deleteConfirmation.open}
                title="Confirmar eliminacion"
                message={`Seguro que deseas eliminar "${deleteConfirmation.name}"?`}
                onConfirm={handleConfirmDelete}
                onCancel={closeDeleteConfirmation}
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                confirmButtonClass="btn btn-error"
            />
        </div>
    )
}

export default DashboardProductsSection
