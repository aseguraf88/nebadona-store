import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useProduct } from '../../../../entities/product'
import { getProductTypesByCategory } from '../../../../entities/product'
import { uploadToCloudinary } from '../../../../shared/lib/uploadToCloudinary'

export const buildImageFromUrl = (url) => ({
    id: crypto.randomUUID(),
    src: url,
    file: null,
    isObjectUrl: false,
})

export const EMPTY_TEMPLATE = {
    handle: '',
    title: 'Titulo',
    description:
        'Producto editable desde dashboard. Descripcion base para crear o editar productos sin bloquear el guardado.',
    product_category: '',
    sock_type: '',
    gender: 'unisex',
    material: '',
    franchise_name: '',
    character_name: '',
    design_theme: '',
    price: '0000',
    compareAtPrice: '',
    cost_price: '',
    tags: '',
    featured: false,
    popular: false,
    isActive: true,
    status: 'DRAFT',
    images: [],
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

const normalizeTemplate = (value) => ({
    handle: value.handle || '',
    title: value.title || 'Titulo',
    description: value.description || '',
    product_category: value.product_category || '',
    sock_type: value.sock_type || '',
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
    status: value.status || 'DRAFT',
    variants: Array.isArray(value.variants)
        ? value.variants
        : EMPTY_TEMPLATE.variants,
    images: Array.isArray(value.images)
        ? value.images.map((image) => image.src)
        : [],
})

const mapProductToTemplate = (product) => ({
    handle: product?.handle || '',
    title: product?.name || 'Titulo',
    description: product?.description || EMPTY_TEMPLATE.description,
    product_category: product?.product_category || '',
    sock_type: product?.sock_type || '',
    gender: product?.gender || 'unisex',
    material: product?.material || '',
    franchise_name: product?.franchise_name || '',
    character_name: product?.character_name || '',
    design_theme: product?.design_theme || '',
    price:
        product?.price === 0 || product?.price ? String(product.price) : '0000',
    compareAtPrice: product?.compareAtPrice
        ? String(product.compareAtPrice)
        : '',
    cost_price: product?.cost_price ? String(product.cost_price) : '',
    tags: Array.isArray(product?.tags) ? product.tags.join(', ') : '',
    featured: Boolean(product?.featured),
    popular: Boolean(product?.popular),
    isActive: product?.isActive ?? false,
    status: product?.status || 'DRAFT',
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
})

/**
 * Hook que reemplaza el "activeMode" booleano de la vieja ProductsPage.
 * El modo (crear/editar) ahora lo decide la URL: si hay :id, es edición.
 */
export function useProductForm() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { products, productsLoading, createProduct, updateProduct } =
        useProduct()
    const isEditMode = Boolean(id)

    const [template, setTemplate] = useState(EMPTY_TEMPLATE)
    const [savedTemplate, setSavedTemplate] = useState(EMPTY_TEMPLATE)
    const [isSaving, setIsSaving] = useState(false)
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        if (!isEditMode) {
            setTemplate(EMPTY_TEMPLATE)
            setSavedTemplate(EMPTY_TEMPLATE)
            setNotFound(false)
            return
        }

        if (productsLoading) return // todavía no sabemos si existe o no

        const product = products.find((p) => p._id === id)

        if (!product) {
            setNotFound(true)
            return
        }

        const mapped = mapProductToTemplate(product)
        setTemplate(mapped)
        setSavedTemplate(mapped)
        setNotFound(false)
    }, [id, isEditMode, products, productsLoading])

    const hasUnsavedChanges =
        JSON.stringify(normalizeTemplate(template)) !==
        JSON.stringify(normalizeTemplate(savedTemplate))

    const isFormValid =
        template.title &&
        template.title !== 'Titulo' &&
        template.title.trim() !== '' &&
        template.price &&
        template.price !== '0000' &&
        String(template.price).trim() !== '' &&
        template.product_category &&
        template.product_category !== ''

    const currentProductTypeOptions = getProductTypesByCategory(
        template.product_category,
    )

    const handleConfirmSave = async () => {
        setIsSaving(true)

        try {
            // 🔥 Cambio de arquitectura: en vez de convertir a base64 y mandar
            // los bytes de la imagen por nuestra propia API, subimos directo
            // a Cloudinary desde el navegador. El backend nunca ve una imagen,
            // solo la URL resultante. Esto es lo que permite bajar los límites
            // de payload de 50mb a 2mb sin romper la subida de fotos.
            const imageUrls = (
                await Promise.all(
                    template.images.slice(0, 6).map(async (image) => {
                        if (image.file) {
                            return uploadToCloudinary(image.file)
                        }
                        return image.src
                    }),
                )
            ).filter(Boolean)

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
                sock_type: template.sock_type || null,
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
                variants: template.variants.map((v) => ({
                    sku: v.sku?.trim().toUpperCase() || '',
                    size: v.size?.trim().toUpperCase() || null,
                    baseColor: v.baseColor?.trim().toLowerCase() || null,
                    designColors: Array.isArray(v.designColors)
                        ? v.designColors
                              .map((c) => c.trim().toLowerCase())
                              .filter(Boolean)
                        : [],
                    stock: Number(v.stock || 0),
                    price: v.price ? Number(v.price) : null,
                })),
            }

            let result

            if (isEditMode) {
                result = await updateProduct(id, payload)
            } else {
                result = await createProduct(payload)
            }

            if (result?.success) {
                toast.success('¡Producto guardado exitosamente!')

                if (isEditMode) {
                    const persisted = {
                        ...template,
                        images: imageUrls.map((src) => buildImageFromUrl(src)),
                    }
                    setTemplate(persisted)
                    setSavedTemplate(persisted)
                } else if (result?.product?._id) {
                    // Al crear, navegamos a la edición del producto recién
                    // creado en vez de resetear el formulario a ciegas.
                    navigate(
                        `/admin/dashboard/products/${result.product._id}/editar`,
                    )
                }
            } else {
                toast.error(
                    result?.message || 'No fue posible guardar cambios.',
                )
            }
        } catch (error) {
            toast.error(
                error?.message || 'Ocurrió un error al guardar cambios.',
            )
        } finally {
            setIsSaving(false)
            setIsSaveModalOpen(false)
        }
    }

    return {
        isEditMode,
        isLoadingProduct: isEditMode && productsLoading,
        notFound,
        template,
        setTemplate,
        isSaving,
        isSaveModalOpen,
        setIsSaveModalOpen,
        hasUnsavedChanges,
        isFormValid,
        currentProductTypeOptions,
        handleConfirmSave,
    }
}
