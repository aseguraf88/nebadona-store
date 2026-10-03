import ProductModel from '../models/ProductModel.js'
import {
    productSchema,
    productUpdateSchema,
    LOCKED_VARIANT_SIZE_BY_STANDARD,
} from '../schemas/productSchema.js'
import { ZodError } from 'zod'
import { formatZodError } from '../utils/formatZodError.js'
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
            return res.status(400).json(formatZodError(error, req.body))
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
        const parsedData = productUpdateSchema.parse(req.body)

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
            return res.status(400).json(formatZodError(error, req.body))
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

// Precio en CLP (entero, sin decimales). Acepta "12990", "12.990", "12,990"
// y "$12.990"; rechaza lo ambiguo en vez de truncar en silencio (parseInt
// leía "1.000" como 1). Devuelve NaN si no es un precio válido; qué hacer
// con el 0 lo decide quien la llama. Misma regla que productSchema.js
// (entero > 0), que el import no usa porque escribe con bulkWrite.
const parseClpPrice = (raw) => {
    const str = String(raw).trim().replace(/^\$\s*/, '')
    if (/^\d+$/.test(str)) return Number(str)
    // Miles con punto o con coma, siempre el mismo y en grupos de 3
    if (/^[1-9]\d{0,2}(\.\d{3})+$/.test(str) || /^[1-9]\d{0,2}(,\d{3})+$/.test(str))
        return Number(str.replace(/[.,]/g, ''))
    return NaN
}

export const importProductsCsv = async (req, res) => {
    try {
        if (!req.file) {
            return res
                .status(400)
                .json({ message: 'Por favor, sube un archivo CSV.' })
        }

        const groupedProducts = new Map()
        const errors = []
        // Handles rechazados (sin Nombre/Categoría o con Precio inválido)
        const rejectedHandles = new Set()
        const stream = Readable.from(req.file.buffer)

        const genderTranslationMap = {
            hombre: 'men',
            mujer: 'women',
            niños: 'kids',
            ninos: 'kids',
            bebés: 'babies',
            bebes: 'babies',
            unisex: 'unisex',
            // Los valores que escribe exportProductsCsv (tal como se guardan)
            men: 'men',
            women: 'women',
            kids: 'kids',
            babies: 'babies',
        }

        let rowIndex = 1

        stream
            // Sin el BOM que agrega nuestra propia exportación (para Excel),
            // la primera columna llegaría como "﻿Handle" y se ignoraría
            .pipe(
                csv({
                    mapHeaders: ({ header }) =>
                        header.replace(/^﻿/, '').trim(),
                })
            )
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

                // Un Handle rechazado no se importa: sus filas siguientes se
                // omiten, en vez de crear el producto a medias desde otra fila
                if (rejectedHandles.has(handle)) {
                    errors.push(
                        `Fila ${currentRow}: omitida, el producto ${handle} fue rechazado más arriba.`
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
                        rejectedHandles.add(handle)
                        return
                    }

                    newProduct.name = name
                    newProduct.product_category = product_category

                    const rawGender = cellValue(
                        data.Género || data.Genero || data.gender
                    )?.toLowerCase()
                    if (rawGender) {
                        const gender = genderTranslationMap[rawGender]
                        if (!gender) {
                            errors.push(
                                `Fila ${currentRow}: Género "${rawGender}" no reconocido en ${handle}, se usó unisex.`
                            )
                        }
                        newProduct.gender = gender || 'unisex'
                    }

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
                        const price = parseClpPrice(priceStr)
                        if (Number.isNaN(price) || price === 0) {
                            errors.push(
                                `Fila ${currentRow}: Precio "${priceStr}" inválido en ${handle} (debe ser un entero mayor que 0). Producto rechazado, no se importó.`
                            )
                            rejectedHandles.add(handle)
                            return
                        }
                        newProduct.price = price
                    } else {
                        errors.push(
                            `Fila ${currentRow}: Advertencia: Producto ${handle} no trae precio en el CSV. Si es nuevo, se creará sin precio.`
                        )
                    }

                    const costStr = cellValue(
                        data.Costo || data.cost || data.cost_price
                    )
                    if (costStr) {
                        const cost = parseClpPrice(costStr)
                        if (Number.isNaN(cost)) {
                            errors.push(
                                `Fila ${currentRow}: Costo "${costStr}" inválido en ${handle}, se ignoró.`
                            )
                        } else {
                            newProduct.cost_price = cost
                        }
                    }

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

                // Precio propio de la variante: vacío o 0 = usa el del
                // producto (null), igual que el dashboard; 0 haría gratis la
                // variante. bulkWrite no pasa por los validadores de
                // Mongoose, así que la regla se chequea acá.
                const variantPriceStr = cellValue(
                    data['Precio Variante'] || data.variantPrice
                )
                let variantPrice = null
                if (variantPriceStr) {
                    const parsed = parseClpPrice(variantPriceStr)
                    if (Number.isNaN(parsed)) {
                        errors.push(
                            `Fila ${currentRow}: Precio Variante "${variantPriceStr}" inválido en ${handle}, se dejó sin precio propio.`
                        )
                    } else if (parsed === 0) {
                        errors.push(
                            `Fila ${currentRow}: Precio Variante 0 en ${handle}, se dejó sin precio propio (usa el precio del producto).`
                        )
                    } else {
                        variantPrice = parsed
                    }
                }

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
                    price: variantPrice,
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

                    // Productos que ya existen con Estándar de talla fija: sus
                    // variantes llevan esa talla, venga lo que venga en el CSV
                    // (el CSV no toca size_standard). Mismo criterio que el
                    // dashboard (paso 33). Una sola consulta, solo 2 campos.
                    const existingStandards = await ProductModel.find(
                        { handle: { $in: [...groupedProducts.keys()] } },
                        { handle: 1, size_standard: 1 }
                    ).lean()
                    for (const { handle, size_standard } of existingStandards) {
                        const lockedSize =
                            LOCKED_VARIANT_SIZE_BY_STANDARD[size_standard]
                        const product = groupedProducts.get(handle)
                        if (
                            !lockedSize ||
                            !product ||
                            product.variants.every((v) => v.size === lockedSize)
                        )
                            continue
                        product.variants.forEach((v) => {
                            v.size = lockedSize
                        })
                        errors.push(
                            `Producto ${handle}: Talla ajustada a ${lockedSize} por su Estándar de talla.`
                        )
                    }

                    const bulkOps = productsToInsert.map((product) => {
                        const { status, isActive, ...fieldsToUpdate } = product

                        return {
                            updateOne: {
                                filter: { handle: product.handle },
                                update: {
                                    $set: fieldsToUpdate,
                                    // El import no lee la columna Estado: todo
                                    // producto nuevo nace DRAFT aquí (no por el
                                    // default del schema) y uno existente
                                    // conserva el suyo. Por eso un producto
                                    // nuevo sin precio es inofensivo. Si algún
                                    // día se lee Estado, revisar esa regla.
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
