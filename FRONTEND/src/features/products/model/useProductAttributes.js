import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

// Helper simple para autogenerar SKU de variante si se desea
const generateVariantSku = (handle, size, baseColor, existingSkus = []) => {
    if (!handle) return ''
    const sizePart = size ? `-${size.toUpperCase().trim()}` : ''
    const colorPart = baseColor
        ? `-${baseColor.substring(0, 3).toUpperCase().trim()}`
        : ''
    const base = `${handle.toUpperCase().trim()}${sizePart}${colorPart}`

    if (!existingSkus.includes(base)) return base

    let suffix = 2
    while (existingSkus.includes(`${base}-${suffix}`)) {
        suffix += 1
    }
    return `${base}-${suffix}`
}

/**
 * Estado y handlers de los campos de producto, compartidos entre el
 * formulario de edición (ProductAttributesForm) y el futuro formulario de
 * creación en acordeones — así la lógica vive en un solo lugar.
 */
export function useProductAttributes({
    template,
    setTemplate,
    onCreateTheme,
    onCreateFranchise,
}) {
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false)
    const [isFranchiseModalOpen, setIsFranchiseModalOpen] = useState(false)
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [dragIndex, setDragIndex] = useState(null)

    const lastVariantRef = useRef(null)
    const prevVariantsLength = useRef(template.variants.length)

    useEffect(() => {
        if (template.variants.length > prevVariantsLength.current) {
            lastVariantRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }
        prevVariantsLength.current = template.variants.length
    }, [template.variants.length])

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

    const handleSaveTheme = async (newThemeName) => {
        const result = await onCreateTheme(newThemeName)
        if (result?.success) {
            setTemplate((prev) => ({ ...prev, design_theme: newThemeName }))
        } else {
            toast.error(result?.message || 'No se pudo crear el tema.')
        }
    }

    const handleSaveFranchise = async (newFranchiseName) => {
        const result = await onCreateFranchise(newFranchiseName)
        if (result?.success) {
            setTemplate((prev) => ({
                ...prev,
                franchise_name: newFranchiseName,
            }))
        } else {
            toast.error(result?.message || 'No se pudo crear la franquicia.')
        }
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
                const otherSkus = newVariants
                    .filter((_, i) => i !== index)
                    .map((v) => v.sku)
                    .filter(Boolean)
                newVariants[index].sku = generateVariantSku(
                    prev.handle,
                    newVariants[index].size,
                    newVariants[index].baseColor,
                    otherSkus,
                )
            }
            return { ...prev, variants: newVariants }
        })
    }

    // Botón de la varita: antes estaba duplicado inline en la tabla y en
    // las tarjetas mobile, mismo cálculo.
    const autoGenerateSku = (idx) => {
        const v = template.variants[idx]
        const otherSkus = template.variants
            .filter((_, i) => i !== idx)
            .map((variant) => variant.sku)
            .filter(Boolean)
        handleVariantChange(
            idx,
            'sku',
            generateVariantSku(template.handle, v.size, v.baseColor, otherSkus),
        )
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

    return {
        isThemeModalOpen,
        setIsThemeModalOpen,
        isFranchiseModalOpen,
        setIsFranchiseModalOpen,
        isImageModalOpen,
        setIsImageModalOpen,
        setDragIndex,
        lastVariantRef,
        hasImages,
        handleImageUpload,
        handleRemoveImage,
        handleDropImage,
        handleSaveTheme,
        handleSaveFranchise,
        handleVariantChange,
        autoGenerateSku,
        addVariant,
        removeVariant,
    }
}
