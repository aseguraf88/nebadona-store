import mongoose from 'mongoose'

const FranchiseNameSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
        collection: 'franchise_name',
    },
)

export default mongoose.model('FranchiseName', FranchiseNameSchema)
