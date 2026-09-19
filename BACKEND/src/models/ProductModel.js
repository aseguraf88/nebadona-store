import mongoose from 'mongoose'
const { Schema } = mongoose

const VariantSchema = new Schema(
    {
        sku: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },
        size: {
            type: String,
            trim: true,
            uppercase: true,
            default: null,
        },
        baseColor: {
            type: String,
            trim: true,
            lowercase: true,
            default: null,
        },
        designColors: {
            type: [String],
            default: [],
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        price: {
            type: Number,
            min: 0,
            default: null,
        },
    },
    { _id: false }
)

const ProductSchema = new Schema(
    {
        handle: {
            type: String,
            required: [true, 'Handle is required.'],
            unique: true,
            trim: true,
            uppercase: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: '',
            required: [
                function () {
                    return this.status === 'PUBLISHED'
                },
                'Description is required to publish.',
            ],
        },
        product_category: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        sock_type: {
            type: String,
            trim: true,
            default: null,
        },
        gender: {
            type: String,
            enum: ['men', 'women', 'unisex', 'kids'],
            default: 'unisex',
            index: true,
        },
        material: {
            type: String,
            trim: true,
            lowercase: true,
            default: null,
        },
        franchise_name: {
            type: String,
            trim: true,
            lowercase: true,
            default: null,
        },
        character_name: {
            type: String,
            trim: true,
            lowercase: true,
            default: null,
        },
        design_theme: {
            type: String,
            trim: true,
            lowercase: true,
            default: null,
        },
        price: {
            type: Number,
            min: 0,
            required: [
                function () {
                    return this.status === 'PUBLISHED'
                },
                'Base price is required to publish.',
            ],
            validate: {
                validator: function (value) {
                    if (this.status === 'PUBLISHED' && value <= 0) return false
                    return true
                },
                message:
                    'A published product must have a price greater than 0.',
            },
        },
        compareAtPrice: {
            type: Number,
            min: 0,
            default: null,
        },
        cost_price: {
            type: Number,
            min: 0,
            default: null,
            select: false,
        },
        imageUrl: {
            type: String,
            trim: true,
            default: '',
            required: [
                function () {
                    return this.status === 'PUBLISHED'
                },
                'Main image is required to publish.',
            ],
        },
        imageUrls: {
            type: [String],
            default: [],
        },
        isActive: {
            type: Boolean,
            default: false,
        },
        featured: { type: Boolean, default: false },
        popular: { type: Boolean, default: false },
        tags: { type: [String], default: [], index: true },
        variants: {
            type: [VariantSchema],
            required: true,
            validate: {
                validator: (arr) => Array.isArray(arr) && arr.length > 0,
                message: 'Product must have at least one variant.',
            },
        },
        attributes: {
            type: [
                {
                    key: { type: String, trim: true },
                    value: { type: String, trim: true },
                },
            ],
            default: [],
        },
        status: {
            type: String,
            enum: ['DRAFT', 'PUBLISHED'],
            default: 'DRAFT',
            index: true,
        },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'last_modified',
        },
    }
)

ProductSchema.index({ product_category: 1, gender: 1 })
ProductSchema.index({ 'variants.sku': 1 }, { unique: true })

export default mongoose.model('Product', ProductSchema)
