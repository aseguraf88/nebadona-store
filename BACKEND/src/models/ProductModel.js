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

// NUEVA FUNCIÓN: Corta a 3 letras o toma iniciales
const formatSkuPart = (value = '') => {
    const cleanValue = String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .trim()
        .replace(/[^A-Z0-9\s]/g, '') // Quita puntuación pero mantiene espacios

    if (!cleanValue) return ''

    const words = cleanValue.split(/\s+/)
    if (words.length === 1) {
        // Una sola palabra: toma hasta las 3 primeras letras (ej. Calcetines -> CAL)
        return words[0].substring(0, 3)
    } else {
        // Varias palabras: toma la primera letra/número de cada una (ej. Goku Super Saijan 2 -> GSS2)
        return words.map((word) => word.charAt(0)).join('')
    }
}

const resolveSkuColorPart = (doc) => {
    // Busca el nombre del color en lugar del hex (ej. "Naranjo" en vez de "#FFA500")
    if (Array.isArray(doc?.colors) && doc.colors.length > 0) {
        const firstUseful = doc.colors.find(
            (entry) => entry?.name && !entry.name.startsWith('#')
        )
        if (firstUseful) return firstUseful.name
    }

    // Fallback: si hay una familia de color guardada
    if (Array.isArray(doc?.colorFamily) && doc.colorFamily.length > 0) {
        return doc.colorFamily[0]
    }

    return doc?.color || ''
}

const generateSkuBase = (doc) => {
    const parts = [
        formatSkuPart(doc?.product_category),
        formatSkuPart(doc?.franchise_name),
        formatSkuPart(doc?.character_name), // <-- Tu nuevo campo de Personaje
        formatSkuPart(resolveSkuColorPart(doc)),
        normalizeSku(doc?.size), // <-- La talla la dejamos intacta (L, XL, S-M)
    ]

    return parts.filter(Boolean).join('-')
}

const colorOptionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        hex: {
            type: String,
            required: true,
            trim: true,
            match: /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/,
        },
        percentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        source: {
            type: String,
            enum: ['auto', 'manual', 'fallback'],
            default: 'auto',
        },
        selected: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false }
)

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
        },
        sku: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        imageUrl: {
            type: String,
            required: false,
            default: '',
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
        featured: {
            type: Boolean,
            default: false,
        },
        popular: {
            type: Boolean,
            default: false,
        },
        compareAtPrice: {
            type: Number,
            min: 0,
            default: null,
        },
        tags: {
            type: [String],
            default: [],
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
        product_category: {
            type: String,
            required: false,
            default: '',
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
            'SKU invalido. Debe contener categoria, franquicia, color y talla o enviarse manualmente.'
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
