import mongoose from 'mongoose'
import { COLOR_FAMILY_NAMES } from '../constants/colorFamilies.js'

const normalizeSku = (value = '') => {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/\s+/g, '-')
        .replace(/[^A-Z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
}

const formatSkuPart = (value = '') => {
    const cleanValue = String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .trim()
        .replace(/[^A-Z0-9\s]/g, '')

    if (!cleanValue) return ''

    const words = cleanValue.split(/\s+/)
    if (words.length === 1) {
        return words[0].substring(0, 3)
    } else {
        return words.map((word) => word.charAt(0)).join('')
    }
}

const resolveSkuColorPart = (doc) => {
    if (Array.isArray(doc?.colors) && doc.colors.length > 0) {
        const firstUseful = doc.colors.find(
            (entry) => entry?.name && !entry.name.startsWith('#')
        )
        if (firstUseful) return firstUseful.name
    }

    if (Array.isArray(doc?.colorFamily) && doc.colorFamily.length > 0) {
        return doc.colorFamily[0]
    }

    return doc?.color || ''
}

const generateSkuBase = (doc) => {
    const parts = [
        formatSkuPart(doc?.product_category),
        formatSkuPart(doc?.franchise_name),
        formatSkuPart(doc?.character_name),
        formatSkuPart(resolveSkuColorPart(doc)),
        normalizeSku(doc?.size),
    ]
    return parts.filter(Boolean).join('-')
}

const colorOptionSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        hex: {
            type: String,
            required: true,
            trim: true,
            match: /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/,
        },
        percentage: { type: Number, min: 0, max: 100, default: 0 },
        source: {
            type: String,
            enum: ['auto', 'manual', 'fallback'],
            default: 'auto',
        },
        selected: { type: Boolean, default: false },
    },
    { _id: false }
)

const ProductSchema = new mongoose.Schema(
    {
        // NUEVO: Estado del producto para separar Inventario Crudo vs Catálogo Público
        status: {
            type: String,
            enum: ['DRAFT', 'PUBLISHED'],
            default: 'DRAFT',
            index: true,
        },
        name: {
            type: String,
            required: [true, 'El nombre del producto es obligatorio.'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            // NUEVO: Validación Condicional (Solo es obligatoria si el producto se hace público)
            required: [
                function () {
                    return this.status === 'PUBLISHED'
                },
                'La descripción es obligatoria para publicar el producto en la vitrina.',
            ],
        },
        price: {
            type: Number,
            min: 0,
            // NUEVO: Validación Condicional (Puede valer 0 en bodega, pero debe tener precio para venta)
            required: [
                function () {
                    return this.status === 'PUBLISHED'
                },
                'El precio base es obligatorio para la venta pública.',
            ],
            validate: {
                validator: function (value) {
                    if (this.status === 'PUBLISHED' && value <= 0) return false
                    return true
                },
                message:
                    'Un producto publicado debe tener un precio mayor a 0.',
            },
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
            index: true, // NUEVO: Indexado para filtrar rápido en el Dashboard
        },
        sku: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            index: true, // NUEVO: Vital para búsquedas rápidas
        },
        imageUrl: {
            type: String,
            default: '',
            // NUEVO: Validación Condicional (La tienda no puede mostrar productos sin foto)
            required: [
                function () {
                    return this.status === 'PUBLISHED'
                },
                'Se requiere al menos una imagen principal para publicar el producto.',
            ],
        },
        imageUrls: {
            type: [String],
            default: [],
            validate: {
                validator: (value) => value.length <= 6,
                message: 'Se permiten hasta 6 imagenes por producto.',
            },
        },
        color: {
            type: String,
            default: '',
            trim: true,
            validate: {
                validator: (value) =>
                    !value ||
                    /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(value) ||
                    /^[\p{L}\s]+$/u.test(value),
                message:
                    'color debe ser un nombre o un valor hexadecimal válido.',
            },
        },
        colors: {
            type: [colorOptionSchema],
            default: [],
            validate: {
                validator: (value) => Array.isArray(value) && value.length <= 4,
                message: 'colors debe tener máximo 4 opciones.',
            },
        },
        colorFamily: {
            type: [String],
            enum: COLOR_FAMILY_NAMES,
            validate: {
                validator: (value) =>
                    value.length === 0 ||
                    (value.length >= 1 && value.length <= 4),
                message:
                    'colorFamily debe tener entre 1 y 4 valores, el primero es el principal.',
            },
        },
        featured: { type: Boolean, default: false },
        popular: { type: Boolean, default: false },
        compareAtPrice: {
            type: Number,
            min: 0,
            default: null,
        },
        tags: {
            type: [String],
            default: [],
            index: true, // NUEVO: Útil para filtros y búsquedas en frontend
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        size: {
            type: String,
            required: false,
            default: '',
        },
        sock_type: {
            type: String,
            required: false,
            default: '',
        },
        // CATEGORÍA VITAL PARA SKU E IMPORTACIÓN
        product_category: {
            type: String,
            required: [true, 'La categoría es obligatoria.'],
            default: '',
            index: true, // NUEVO
        },
        design_theme: {
            type: String,
            required: false,
            default: '',
        },
        franchise_name: {
            type: String,
            required: false,
            default: '',
        },
        character_name: {
            type: String,
            required: false,
            default: '',
            trim: true,
        },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'last_modified',
        },
    }
)

// Manejo de SKU antes de guardar
ProductSchema.pre('validate', function (next) {
    if (this.isNew) {
        if (this.sku) {
            this.sku = normalizeSku(this.sku)
        } else {
            this.sku = generateSkuBase(this)
        }
    } else if (this.isModified('sku')) {
        this.sku = normalizeSku(this.sku)
    }

    if (!this.sku) {
        this.invalidate(
            'sku',
            'SKU invalido. Faltan datos para autogenerarlo o debe enviarse manualmente.'
        )
    }

    next()
})

ProductSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate()
    if (!update) return next()

    if (update.sku !== undefined) {
        update.sku = normalizeSku(update.sku)
    }

    if (update.$set && update.$set.sku !== undefined) {
        update.$set.sku = normalizeSku(update.$set.sku)
    }

    this.setUpdate(update)
    next()
})

export default mongoose.model('Product', ProductSchema)
