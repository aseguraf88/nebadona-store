import ProductModel from '../models/ProductModel.js'
import { productSchema } from '../schemas/productSchema.js'
import { ZodError } from 'zod'
import cloudinary, {
    isCloudinaryConfigured,
} from '../config/cloudinaryConfig.js'
import csv from 'csv-parser'
import { Readable } from 'stream'

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
    if (Array.isArray(imageUrls)) merged.push(...imageUrls)
    if (imageUrl) merged.unshift(imageUrl)
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
        const parsedData = productSchema.parse(req.body)
        const resolvedImages = await resolveProductImages({
            imageUrl: parsedData.imageUrl,
            imageUrls: parsedData.imageUrls,
        })

        parsedData.imageUrl = resolvedImages.imageUrl
        parsedData.imageUrls = resolvedImages.imageUrls

        const product = await ProductModel.create(parsedData)
        return res
            .status(201)
            .json({ message: 'Producto creado exitosamente.', product })
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                message: error.issues[0]?.message || 'Datos inválidos.',
                errors: error.issues.map((issue) => ({ message: issue.message })),
            })
        }
        if (error?.code === 11000) {
            return res
                .status(400)
                .json({ message: 'El Handle o SKU ya existe. Debe ser único.' })
        }
        if (error?.name === 'ValidationError') {
            return res.status(400).json({
                message:
                    Object.values(error.errors)[0]?.message ||
                    'Datos inválidos.',
            })
        }
        console.error('Error createProduct:', error)
        return res.status(500).json({ message: 'Error al crear el producto.' })
    }
}

export const updateProduct = async (req, res) => {
    try {
        const parsedData = productSchema.partial().parse(req.body)

        // 🔥 FUERZA BRUTA INTELIGENTE: Aseguramos que el status viaje sí o sí
        if (req.body.status) {
            parsedData.status = req.body.status
        }

        if (parsedData.imageUrl || Array.isArray(parsedData.imageUrls)) {
            const resolvedImages = await resolveProductImages({
                imageUrl: parsedData.imageUrl,
                imageUrls: parsedData.imageUrls,
            })
            parsedData.imageUrl = resolvedImages.imageUrl
            parsedData.imageUrls = resolvedImages.imageUrls
        }

        const product = await ProductModel.findById(req.params.id)
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado.' })
        }

        Object.assign(product, parsedData)
        await product.save() // ¡Aquí Mongoose validará y guardará el PUBLISHED con éxito!

        return res.status(200).json(product)
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                message: error.issues[0]?.message || 'Datos inválidos.',
                errors: error.issues.map((issue) => ({ message: issue.message })),
            })
        }
        if (error?.code === 11000) {
            return res
                .status(400)
                .json({ message: 'El Handle o SKU ya existe.' })
        }
        if (error?.name === 'ValidationError') {
            return res.status(400).json({
                message:
                    Object.values(error.errors)[0]?.message ||
                    'Datos inválidos.',
            })
        }
        console.error('Error updateProduct:', error)
        return res
            .status(500)
            .json({ message: 'Error al actualizar producto.' })
    }
}

export const getProductById = async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id)
        if (!product)
            return res.status(404).json({ message: 'Producto no encontrado.' })
        return res.status(200).json(product)
    } catch (error) {
        return res
            .status(500)
            .json({ message: 'Error al obtener el producto.' })
    }
}

export const getAllProducts = async (req, res) => {
    try {
        const filter = {}

        // Si la URL de la petición incluye "?status=PUBLISHED", filtramos.
        // Si no incluye nada, devolvemos todo (ideal para el Dashboard).
        if (req.query.status) {
            filter.status = req.query.status
        }

        const products = await ProductModel.find(filter)
        return res.status(200).json(products)
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener productos.' })
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const product = await ProductModel.findByIdAndDelete(req.params.id)
        if (!product)
            return res.status(404).json({ message: 'Producto no encontrado.' })
        return res.status(200).json(product)
    } catch (error) {
        return res
            .status(500)
            .json({ message: 'Error al eliminar el producto.' })
    }
}

// ==========================================
// IMPORTACIÓN DE CSV (AGRUPACIÓN Y UPSERT INTELIGENTE)
// ==========================================
export const importProductsCsv = async (req, res) => {
    try {
        if (!req.file) {
            return res
                .status(400)
                .json({ message: 'Por favor, sube un archivo CSV.' })
        }

        const groupedProducts = new Map()
        const errors = []
        const stream = Readable.from(req.file.buffer)

        const genderTranslationMap = {
            hombre: 'men',
            mujer: 'women',
            niños: 'kids',
            ninos: 'kids',
            unisex: 'unisex',
        }

        let rowIndex = 1

        stream
            .pipe(csv())
            .on('data', (data) => {
                const currentRow = rowIndex++
                const handle = (data.Handle || data.handle)
                    ?.trim()
                    .toUpperCase()
                if (!handle) {
                    errors.push(
                        `Fila ${currentRow}: ignorada por falta de Handle`
                    )
                    return
                }

                // Helper: Retorna undefined si la celda viene vacía
                const cellValue = (val) =>
                    val !== undefined &&
                    val !== null &&
                    String(val).trim() !== ''
                        ? String(val).trim()
                        : undefined

                if (!groupedProducts.has(handle)) {
                    const newProduct = {
                        handle,
                        status: 'DRAFT',
                        isActive: false,
                        variants: [],
                    }

                    const name = cellValue(data.Nombre || data.name)
                    const product_category = cellValue(
                        data.Categoría || data.Categoria || data.category
                    )?.toLowerCase()

                    if (!name || !product_category) {
                        errors.push(
                            `Fila ${currentRow}: Falta Nombre o Categoría en producto: ${handle}`
                        )
                        return
                    }

                    newProduct.name = name
                    newProduct.product_category = product_category

                    const rawGender = cellValue(
                        data.Género || data.gender
                    )?.toLowerCase()
                    if (rawGender)
                        newProduct.gender =
                            genderTranslationMap[rawGender] || 'unisex'

                    if (cellValue(data.Material || data.material))
                        newProduct.material = cellValue(
                            data.Material || data.material
                        ).toLowerCase()
                    if (
                        cellValue(
                            data.Franquicia ||
                                data.franchise ||
                                data.franchise_name
                        )
                    )
                        newProduct.franchise_name = cellValue(
                            data.Franquicia ||
                                data.franchise ||
                                data.franchise_name
                        ).toLowerCase()
                    if (
                        cellValue(
                            data.Personaje ||
                                data.character ||
                                data.character_name
                        )
                    )
                        newProduct.character_name = cellValue(
                            data.Personaje ||
                                data.character ||
                                data.character_name
                        ).toLowerCase()
                    if (cellValue(data.Tema || data.theme || data.design_theme))
                        newProduct.design_theme = cellValue(
                            data.Tema || data.theme || data.design_theme
                        ).toLowerCase()

                    const priceStr = cellValue(data.Precio || data.price)
                    if (priceStr) {
                        newProduct.price = parseInt(priceStr) || 0
                    } else {
                        errors.push(
                            `Fila ${currentRow}: Advertencia: Producto ${handle} no trae precio en el CSV. Si es nuevo, se creará sin precio.`
                        )
                    }

                    const costStr = cellValue(
                        data.Costo || data.cost || data.cost_price
                    )
                    if (costStr) newProduct.cost_price = parseInt(costStr) || 0

                    groupedProducts.set(handle, newProduct)
                }

                const parent = groupedProducts.get(handle)

                const size =
                    cellValue(data.Talla || data.size)?.toUpperCase() || null
                const baseColor =
                    cellValue(
                        data['Color Base'] || data.baseColor
                    )?.toLowerCase() || null

                const designColorsText = cellValue(
                    data['Colores Diseño'] || data.designColors || data.Disenos
                )
                const designColors = designColorsText
                    ? designColorsText
                          .split(',')
                          .map((c) => c.trim().toLowerCase())
                          .filter(Boolean)
                    : []

                const stock = parseInt(cellValue(data.Stock || data.stock)) || 0

                let sku = cellValue(data.SKU || data.sku)?.toUpperCase()
                if (!sku) {
                    const colorSnippet = baseColor
                        ? `-${baseColor.substring(0, 3).toUpperCase()}`
                        : ''
                    const sizeSnippet = size ? `-${size}` : ''
                    sku = `${handle}${sizeSnippet}${colorSnippet}`
                }

                const newVariant = {
                    sku,
                    size,
                    baseColor,
                    designColors,
                    stock,
                    price: null,
                }

                const isDuplicate = parent.variants.some((v) => v.sku === sku)

                if (!isDuplicate) {
                    parent.variants.push(newVariant)
                } else {
                    errors.push(`Fila ${currentRow}: Variante duplicada ignorada (SKU: ${sku})`)
                }
            })
            .on('end', async () => {
                if (groupedProducts.size === 0) {
                    return res.status(400).json({
                        message: 'Archivo CSV vacío o sin filas válidas.',
                        errors,
                    })
                }

                try {
                    const productsToInsert = Array.from(
                        groupedProducts.values()
                    )

                    const bulkOps = productsToInsert.map((product) => {
                        const { status, isActive, ...fieldsToUpdate } = product

                        return {
                            updateOne: {
                                filter: { handle: product.handle },
                                update: {
                                    $set: fieldsToUpdate,
                                    $setOnInsert: {
                                        status: 'DRAFT',
                                        isActive: false,
                                    },
                                },
                                upsert: true,
                            },
                        }
                    })

                    const bulkResult = await ProductModel.bulkWrite(bulkOps, {
                        ordered: false,
                        throwOnValidationError: true,
                    })

                    return res.status(200).json({
                        message: `Importación exitosa. ${bulkResult.upsertedCount} nuevos productos, ${bulkResult.modifiedCount} actualizados.`,
                        totalParents: groupedProducts.size,
                        nuevos: bulkResult.upsertedCount,
                        actualizados: bulkResult.modifiedCount,
                        errors: errors,
                    })
                } catch (dbError) {
                    console.error('Error en bulkWrite:', dbError)

                    let specificMessage = 'Error de validación o base de datos al guardar.'
                    const dupKeyMatch = dbError.message?.match(/dup key: \{ (.+?) \}/)
                    if (dupKeyMatch) {
                        specificMessage = `SKU o Handle duplicado encontrado: ${dupKeyMatch[1]}. Corrige esa fila en el CSV y vuelve a subirlo.`
                    }

                    const partial = dbError.result || {}

                    return res.status(500).json({
                        message: specificMessage,
                        nuevos: partial.upsertedCount || 0,
                        actualizados: partial.matchedCount || 0,
                        errors,
                    })
                }
            })
    } catch (error) {
        console.error('Error importProductsCsv:', error)
        return res
            .status(500)
            .json({ message: 'Error procesando el archivo CSV.' })
    }
}

// ==========================================
// EXPORTACIÓN DE CSV (DESCARGAR INVENTARIO)
// ==========================================
export const exportProductsCsv = async (req, res) => {
    try {
        // Traemos todos los productos desde la base de datos
        const products = await ProductModel.find().lean()

        // Estos son los mismos títulos exactos que usa nuestro importador
        const headers = [
            'Handle',
            'Nombre',
            'Categoria',
            'Genero',
            'Material',
            'Franquicia',
            'Personaje',
            'Tema',
            'Precio',
            'Costo',
            'SKU',
            'Talla',
            'Color Base',
            'Disenos',
            'Stock',
            'Precio Variante',
            'Estado',
        ]

        const rows = []

        // Desenrollamos: Por cada producto, creamos 1 fila por cada variante
        products.forEach((p) => {
            const variants =
                p.variants && p.variants.length > 0 ? p.variants : [{}]

            variants.forEach((v) => {
                rows.push([
                    p.handle || '',
                    p.name || '',
                    p.product_category || '',
                    p.gender || 'unisex',
                    p.material || '',
                    p.franchise_name || '',
                    p.character_name || '',
                    p.design_theme || '',
                    p.price !== undefined ? p.price : '',
                    p.cost_price !== undefined ? p.cost_price : '',
                    v.sku || '',
                    v.size || '',
                    v.baseColor || '',
                    Array.isArray(v.designColors)
                        ? v.designColors.join(',')
                        : '',
                    v.stock !== undefined ? v.stock : 0,
                    v.price !== undefined && v.price !== null ? v.price : '',
                    p.status || 'DRAFT',
                ])
            })
        })

        // Función para limpiar comas o comillas que puedan romper el Excel
        const escapeCSV = (field) => {
            if (field === null || field === undefined) return ''
            const str = String(field)
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`
            }
            return str
        }

        // Unimos los títulos y las filas
        const csvContent = [
            headers.map(escapeCSV).join(','),
            ...rows.map((row) => row.map(escapeCSV).join(',')),
        ].join('\n')

        // Configuramos la respuesta para que el navegador sepa que es un archivo descargable
        res.setHeader('Content-Type', 'text/csv; charset=utf-8')
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="inventario_nebadon.csv"'
        )

        // ¡Se lo enviamos! Añadimos el BOM (ufeff) para que Excel reconozca las tildes y ñ (UTF-8)
        return res.status(200).send('\ufeff' + csvContent)
    } catch (error) {
        console.error('Error al exportar CSV:', error)
        return res
            .status(500)
            .json({ message: 'Error interno al exportar el inventario.' })
    }
}
