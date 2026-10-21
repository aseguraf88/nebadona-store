import mongoose from 'mongoose'

// Feria (paso 67c-1). Solo puede haber una abierta a la vez: lo asegura el
// índice único parcial de abajo, no el controlador (dos aperturas
// simultáneas chocan en la base). Cerrarla es del 67e, junto con la
// devolución del sobrante a la web
const FairSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxLength: 100,
        },
        status: {
            type: String,
            enum: ['open', 'closed'],
            default: 'open',
        },
        openedAt: {
            type: Date,
            default: Date.now,
        },
        openedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        closedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true },
)

// Único solo entre las abiertas: puede haber muchas cerradas
FairSchema.index(
    { status: 1 },
    { unique: true, partialFilterExpression: { status: 'open' } },
)

export default mongoose.model('Fair', FairSchema)
