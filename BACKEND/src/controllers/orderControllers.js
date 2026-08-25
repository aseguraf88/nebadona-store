import mercadopago from '../config/mercadoPagoConfig.js'
import OrderModel from '../models/OrderModel.js'

export const createOrder = async (req, res) => {
    try {
        const { items, payer, shippingInfo } = req.body

        if (!items || !items.length) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren items para crear la orden',
            })
        }

        if (!payer || !payer.email) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere email del comprador',
            })
        }

        if (!shippingInfo?.firstName || !shippingInfo?.lastName || !shippingInfo?.phone || !shippingInfo?.address) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos de envío obligatorios',
            })
        }

        // Crear la orden en la base de datos primero
        const newOrder = new OrderModel({
            userId: req.user?._id,
            products: items.map((item) => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.unit_price,
            })),
            totalAmount: items.reduce(
                (total, item) => total + item.unit_price * item.quantity,
                0
            ),
            status: 'pending',
            shippingInfo: shippingInfo,
            mercadoPagoData: {
                payerEmail: payer.email,
            },
        })

        const savedOrder = await newOrder.save()

        // Crear preferencia en Mercado Pago con external_reference
        const mpPayload = {
            items: items,
            payer: { email: payer.email },
            external_reference: savedOrder._id.toString(),
            back_urls: {
                success: `${process.env.FRONTEND_URL}/payment/success`,
                failure: `${process.env.FRONTEND_URL}/payment/failure`,
                pending: `${process.env.FRONTEND_URL}/payment/pending`,
            },
            notification_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/webhook`,
            metadata: { order_id: savedOrder._id.toString() },
        }

        const result = await mercadopago.preferences.create(mpPayload)

        // response body contains preference info
        const pref = result.body || result

        // Actualizar la orden con el ID de preferencia de MP
        savedOrder.mercadoPagoData.preferenceId = pref.id
        await savedOrder.save()

        res.status(201).json({
            success: true,
            message: 'Orden creada exitosamente',
            paymentUrl: (pref.init_point || '').trim(),
            preferenceId: pref.id,
        })
    } catch (error) {
        console.error('Error al crear orden:', error)
        res.status(500).json({
            success: false,
            message: 'Error al crear la orden',
        })
    }
}
