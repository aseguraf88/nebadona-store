import mongoose from 'mongoose'

// Stock de la feria (paso 67c-1): una fila por feria y sku, aparte de
// variants.stock (el de la web). Se escribe solo con $inc desde
// services/fairStock.js, nunca con save(): así no hay una vía de guardar
// un valor viejo encima. Sin min: 0, porque una venta (67c) puede dejarlo
// negativo y se revisa al cierre. stock y product sin valor por defecto:
// la fila nace en un upsert que los escribe ($inc y $setOnInsert)
const FairStockSchema = new mongoose.Schema(
    {
        fair: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Fair',
            required: true,
        },
        sku: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },
        // Para mostrar el nombre y, en el 67c, armar el catálogo de ventas
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        stock: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true },
)

FairStockSchema.index({ fair: 1, sku: 1 }, { unique: true })

export default mongoose.model('FairStock', FairStockSchema)
