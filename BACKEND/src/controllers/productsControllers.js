import ProductModel from '../models/ProductModel.js'
import { productSchema } from '../schemas/productSchema.js'
import { ZodError } from 'zod'
import cloudinary, {
    isCloudinaryConfigured,
} from '../config/cloudinaryConfig.js'
import { normalizeColorPayload } from '../utils/colorNormalization.js'

const isCloudinaryUrl = (url = '') =>
    typeof url === 'string' && url.includes('res.cloudinary.com')

const shouldUploadToCloudinary = (source = '') => {
    if (typeof source !== 'string' || !source.trim()) return false
    if (source.startsWith('data:image/')) return true

    try {
        const parsedUrl = new URL(source)
        return (
            (parsedUrl.protocol === 'http:' ||
                parsedUrl.protocol === 'https:') &&
            !isCloudinaryUrl(source)
        )
    } catch {
        return false
    }
}

const normalizeImagesInput = (imageUrl, imageUrls) => {
    const merged = []

    if (Array.isArray(imageUrls)) {
        merged.push(...imageUrls)
    }

    if (imageUrl) {
        merged.unshift(imageUrl)
    }

    return [...new Set(merged.filter(Boolean))].slice(0, 6)
}

const uploadImagesToCloudinary = async (inputs = []) => {
    const uploadedUrls = []

    for (const input of inputs) {
        if (!input) continue

        if (shouldUploadToCloudinary(input)) {
            if (!isCloudinaryConfigured) {
                const error = new Error(
                    'Cloudinary no esta configurado en el servidor.'
                )
                error.statusCode = 500
                throw error
            }

            const uploaded = await cloudinary.uploader.upload(input, {
                folder: 'nebadona/products',
                resource_type: 'image',
            })
            uploadedUrls.push(uploaded.secure_url)
            continue
        }

        uploadedUrls.push(input)
    }

    return uploadedUrls.slice(0, 6)
}

const resolveProductImages = async ({ imageUrl, imageUrls }) => {
    const normalizedInput = normalizeImagesInput(imageUrl, imageUrls)
    const resolvedUrls = await uploadImagesToCloudinary(normalizedInput)

    return {
        imageUrl: resolvedUrls[0] || '',
        imageUrls: resolvedUrls,
    }
}

export const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            stock,
            sku,
            imageUrl,
            imageUrls,
            color,
            colors,
            colorFamily,
            featured,
            popular,
            compareAtPrice,
            tags,
            isActive,
            size,
            sock_type,
            product_category,
            design_theme,
            franchise_name,
        } = productSchema.parse(req.body)
        const resolvedImages = await resolveProductImages({
            imageUrl,
            imageUrls,
        })

        const colorData = normalizeColorPayload({ color, colors })

        const product = await ProductModel.create({
            name,
            description,
            price,
            stock,
            ...(sku !== undefined ? { sku } : {}),
            imageUrl: resolvedImages.imageUrl,
            imageUrls: resolvedImages.imageUrls,
            color: colorData.color,
            colors: colorData.colors,
            colorFamily: colorFamily || [],
            featured: featured ?? false,
            popular: popular ?? false,
            compareAtPrice: compareAtPrice ?? null,
            tags: tags || [],
            isActive: isActive ?? true,
            size: size || '',
            sock_type: sock_type || '',
            product_category: product_category || '',
            design_theme: design_theme || '',
            franchise_name: franchise_name || '',
        })

        return res
            .status(201)
            .json({ message: 'Producto creado exitosamente.', product })
    } catch (error) {
        if (error instanceof ZodError) {
            return res
                .status(400)
                .json(error.issues.map((issue) => ({ message: issue.message })))
        }

        if (error?.code === 11000 && error?.keyPattern?.sku) {
            return res.status(400).json({
                message: 'El SKU ya existe. Debe ser unico.',
            })
        }

        if (error?.name === 'ValidationError' && error?.errors?.sku) {
            return res.status(400).json({
                message: error.errors.sku.message || 'SKU invalido.',
            })
        }

        console.error('Error createProduct:', error)

        if (error?.message?.includes('Cloudinary no esta configurado')) {
            return res.status(500).json({
                message:
                    'Cloudinary no esta configurado. Agrega CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en BACKEND/.env o CLOUDINARY_URL.',
            })
        }

        return res.status(500).json({ message: 'Error al crear el producto.' })
    }
}

export const updateProduct = async (req, res) => {
    try {
        // 1. Validar los datos de entrada con Zod.
        const validateData = productSchema.partial().parse(req.body)
        const colorData = normalizeColorPayload({
            color: validateData.color,
            colors: validateData.colors,
        })
        const normalizedData = {
            ...validateData,
            ...(validateData.color !== undefined
                ? { color: colorData.color }
                : {}),
            ...(validateData.colors !== undefined
                ? { colors: colorData.colors }
                : {}),
            ...(validateData.colorFamily !== undefined
                ? { colorFamily: validateData.colorFamily || [] }
                : {}),
            ...(validateData.featured !== undefined
                ? { featured: validateData.featured }
                : {}),
            ...(validateData.popular !== undefined
                ? { popular: validateData.popular }
                : {}),
            ...(validateData.compareAtPrice !== undefined
                ? { compareAtPrice: validateData.compareAtPrice }
                : {}),
            ...(validateData.tags !== undefined
                ? { tags: validateData.tags || [] }
                : {}),
            ...(validateData.isActive !== undefined
                ? { isActive: validateData.isActive }
                : {}),
            ...(validateData.size !== undefined
                ? { size: validateData.size || '' }
                : {}),
            ...(validateData.sock_type !== undefined
                ? { sock_type: validateData.sock_type || '' }
                : {}),
            ...(validateData.product_category !== undefined
                ? { product_category: validateData.product_category || '' }
                : {}),
            ...(validateData.design_theme !== undefined
                ? { design_theme: validateData.design_theme || '' }
                : {}),
            ...(validateData.franchise_name !== undefined
                ? { franchise_name: validateData.franchise_name || '' }
                : {}),
        }

        if (
            normalizedData.imageUrl ||
            Array.isArray(normalizedData.imageUrls)
        ) {
            const resolvedImages = await resolveProductImages({
                imageUrl: normalizedData.imageUrl,
                imageUrls: normalizedData.imageUrls,
            })

            normalizedData.imageUrl = resolvedImages.imageUrl
            normalizedData.imageUrls = resolvedImages.imageUrls
        }

        // 2. Buscar y actualizar producto.
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            req.params.id,
            normalizedData,
            { new: true, runValidators: true }
        )

        // 3. Manejar el caso de que el producto no exista.
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Producto no encontrado.' })
        }

        // 4. Devolver el producto actualizado.
        return res.status(200).json(updatedProduct)
    } catch (error) {
        if (error instanceof ZodError) {
            return res
                .status(400)
                .json(error.issues.map((issue) => ({ message: issue.message })))
        }

        if (error?.code === 11000 && error?.keyPattern?.sku) {
            return res.status(400).json({
                message: 'El SKU ya existe. Debe ser unico.',
            })
        }

        if (error?.name === 'ValidationError' && error?.errors?.sku) {
            return res.status(400).json({
                message: error.errors.sku.message || 'SKU invalido.',
            })
        }

        console.error('Error updateProduct:', error)

        if (error?.message?.includes('Cloudinary no esta configurado')) {
            return res.status(500).json({
                message:
                    'Cloudinary no esta configurado. Agrega CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en BACKEND/.env o CLOUDINARY_URL.',
            })
        }

        return res
            .status(500)
            .json({ message: 'Error al actualizar producto.' })
    }
}

export const getProductById = async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id)
        return res.status(200).json(product)
    } catch (error) {
        return res
            .status(500)
            .json({ message: 'Error al obtener el producto.' })
    }
}

export const getAllProducts = async (req, res) => {
    try {
        const products = await ProductModel.find()
        return res.status(200).json(products)
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener productos.' })
    }
}

export const getColorFamilies = async (req, res) => {
    return res.status(200).json(COLOR_FAMILIES)
}

export const deleteProduct = async (req, res) => {
    try {
        const product = await ProductModel.findByIdAndDelete(req.params.id)
        return res.status(200).json(product)
    } catch (error) {
        return res
            .status(500)
            .json({ message: 'Error al eliminar el producto.' })
    }
}
