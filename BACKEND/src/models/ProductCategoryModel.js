import mongoose from 'mongoose'

const ProductCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
        collection: 'product_categories',
    },
)

export default mongoose.model('ProductCategory', ProductCategorySchema)
