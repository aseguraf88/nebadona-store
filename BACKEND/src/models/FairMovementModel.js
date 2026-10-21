import mongoose from 'mongoose'

// Historial del stock de la feria (paso 67c-1): todo cambio deja una fila
// y ninguna se edita. En el 67c-1 solo existe 'transfer' (de la web a la
// feria); 'sale', 'void', 'return_to_web', 'shrinkage' y 'web_adjust' se
// suman al enum en sus pasos. Un traspaso de N líneas son N filas con el
// mismo requestId
const FairMovementSchema = new mongoose.Schema(
    {
        fair: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Fair',
            required: true,
        },
        type: {
            type: String,
            enum: ['transfer'],
            required: true,
        },
        // Idempotencia del traspaso: un reintento con el mismo requestId no
        // se vuelve a aplicar. Sin valor por defecto: los movimientos que no
        // lo lleven quedan fuera del índice único de abajo
        requestId: {
            type: String,
        },
        sku: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            default: null,
        },
        // Copia legible ("Nombre (talla, color)"): sigue sirviendo aunque el
        // producto se borre
        label: {
            type: String,
            default: '',
        },
        // Cambio en el stock de la feria y en el de la web (0 si no la toca)
        fairDelta: {
            type: Number,
            required: true,
        },
        webDelta: {
            type: Number,
            required: true,
            default: 0,
        },
        fairStockAfter: {
            type: Number,
            required: true,
        },
        webStockAfter: {
            type: Number,
            default: null,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } },
)

// Historial de una feria, del más nuevo al más viejo (paginado por _id)
FairMovementSchema.index({ fair: 1, _id: -1 })
FairMovementSchema.index(
    { requestId: 1, sku: 1 },
    { unique: true, partialFilterExpression: { requestId: { $type: 'string' } } },
)

export default mongoose.model('FairMovement', FairMovementSchema)
