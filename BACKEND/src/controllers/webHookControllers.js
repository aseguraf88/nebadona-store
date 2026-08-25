import OrderModel from '../models/OrderModel.js'
import ProductModel from '../models/ProductModel.js'
import mercadopago from '../config/mercadoPagoConfig.js'
import crypto from 'crypto'

const validateSignature = (req, res) => {
    try {
        // Obtenemos la firma y el secreto
        const signature = req.headers['x-signature'] || req.headers['x-signature'.toLowerCase()]
        const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET

        // If in development and no secret is configured, skip validation (for testing only)
        if (!secret && process.env.NODE_ENV !== 'production') {
            console.warn('MERCADOPAGO_WEBHOOK_SECRET not set — skipping signature validation in non-production environment')
            return true
        }

        // Validamos que existan
        if (!signature || !secret) {
            return false
        }

        // Split por coma y limpiar espacios
        const parts = signature.split(',').map((p) => p.trim())

        const tsPart = parts.find((part) => part.startsWith('ts='))
        const v1Part = parts.find((part) => part.startsWith('v1='))

        if (!tsPart || !v1Part) return false

        const ts = tsPart.split('=')[1]
        const hash = v1Part.split('=')[1]

        // Obtener x-request-id del header
        const xRequestId = req.headers['x-request-id'] || req.headers['x-request-id'.toLowerCase()]

        // Obtener data.id según el formato del webhook
        let dataId
        let webhookFormat = 'unknown'

        // Detectar formato del webhook
        if (req.body?.data?.id && req.body?.type === 'payment') {
            // Formato v1: MercadoPago webhook v1.0
            dataId = req.body.data.id
            webhookFormat = 'v1'
        } else if (req.body?.resource && req.body?.topic === 'payment') {
            // Formato v2: MercadoPago Feed v2.0
            dataId = req.body.resource
            webhookFormat = 'v2'
        } else {
            dataId = req.query.id || req.query['data.id']
            webhookFormat = 'fallback'
        }

        // Crear manifest según la documentación oficial
        const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`

        // Generar el hash esperado
        const expectedHash = crypto
            .createHmac('sha256', secret) // Usar el secreto configurado
            .update(manifest) // Añadir el manifest
            .digest('hex') // Generar hash en hexadecimal

        // Compararlo de manera segura: lengths must match
        const receivedBuffer = Buffer.from(hash, 'hex')
        const expectedBuffer = Buffer.from(expectedHash, 'hex')

        if (receivedBuffer.length !== expectedBuffer.length) return false

        const isValid = crypto.timingSafeEqual(receivedBuffer, expectedBuffer)

        return isValid
    } catch (error) {
        console.error('validateSignature error:', error)
        return false
    }
}

const webHookController = async (req, res) => {
    // Verificar si es un webhook de payment
    const { type, topic } = req.body

    // Solo procesar webhooks de payment, ignorar merchant_order

    if (type !== 'payment' && topic !== 'payment') {
        return res
            .status(400)
            .json({ message: 'Webhook ignorado - Solo procesamos payments' })
    }

    // Validar el signature
    if (!validateSignature(req)) {
        return res.status(401).json({ message: 'No autorizado.' })
    }

    // Obtener datos del pago
    const { data } = req.body

    // En entorno de desarrollo, no llamamos a la API externa y retornamos OK para pruebas locales
    if (process.env.NODE_ENV !== 'production') {
        return res.status(200).json({ message: 'Webhook recibido en modo desarrollo.' })
    }

    // Obtenemos el id del pago
    const { id: paymentId } = data

    // Obtenemos información completa del pago desde MP
    const paymentResponse = await mercadopago.payment.get(paymentId)
    const payment = paymentResponse.body || paymentResponse

    // Buscar la orden usando external_reference
    const order = await OrderModel.findById(payment.external_reference)

    // Verificar si la orden existe o no
    if (!order) {
        return res.status(400).json({ message: 'Orden no encontrada' })
    }

    // Actualizar la orden según estado del pago
    if (payment.status === 'approved') {
        await OrderModel.findByIdAndUpdate(order._id, {
            status: 'approved',
        })

        // Actualizar campos de pago
        order.mercadoPagoData.paymentId = paymentId
        order.mercadoPagoData.paymentStatus = payment.status
        order.mercadoPagoData.transactionAmount = payment.transaction_amount
        order.mercadoPagoData.paymentMethodId = payment.payment_method_id
        order.mercadoPagoData.paidAt = payment.date_approved

        // Podemos reducir el stock
        // Recorrer cada item de la orden
        for (const item of order.products) {
            // Buscar el producto por su ID
            const product = await ProductModel.findById(item.productId)

            // Verificamos si hay stock disponible
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: 'Stock insuficiente para ' + product.name,
                })
            }

            // Actualizar el stock
            product.stock -= item.quantity
            await product.save()
        }

        // Guardar cambios
        await order.save()
    } else {
        await OrderModel.findByIdAndUpdate(order._id, {
            status: 'rejected',
        })
    }

    res.status(200).json({
        message: 'Webhook de payment procesado correctamente',
    })
}

export default webHookController
