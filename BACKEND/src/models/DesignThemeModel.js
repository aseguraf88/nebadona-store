import mongoose from 'mongoose'

const DesignThemeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
        collection: 'design_themes',
    },
)

export default mongoose.model('DesignTheme', DesignThemeSchema)
