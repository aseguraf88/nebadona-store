import mongoose from 'mongoose'

const OrderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        // 🔥 NUEVO: Folio de orden limpio para WhatsApp (Ej: 1001, 1002)
        orderNumber: {
            type: Number,
            unique: true,
            sparse: true, // Permite que órdenes antiguas sin este número no generen error de duplicado
        },
        // 🔥 NUEVO: Tipo de entrega
        deliveryType: {
            type: String,
            enum: ['delivery', 'pickup'],
            required: true,
            default: 'pickup',
        },
        products: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                name: { type: String, required: false },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true },
                imageUrl: { type: String, required: false },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: [
                'pending',
                'approved',
                'rejected',
                'cancelled',
                'in_process',
                'whatsapp_pending', // Estado específico para pedidos manuales
            ],
            default: 'whatsapp_pending',
        },
        shippingInfo: {
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            email: { type: String, required: false },
            phone: { type: String, required: true },
            // La dirección ahora es un objeto pero sus campos no son "required: true" a nivel de base de datos
            // para permitir el modo "retiro/pickup"
            address: {
                street: { type: String, default: '' },
                number: { type: String, default: '' },
                city: { type: String, default: '' },
                state: { type: String, default: '' },
                zipCode: { type: String, default: '' },
            },
        },
        // Conservamos Mercado Pago para el futuro
        mercadoPagoData: {
            preferenceId: { type: String },
            payerEmail: { type: String },
            paymentId: { type: String },
            paymentStatus: { type: String },
            transactionAmount: { type: Number },
            paymentMethodId: { type: String },
            paidAt: { type: Date },
        },
    },
    { timestamps: true }
)

export default mongoose.model('Order', OrderSchema)
