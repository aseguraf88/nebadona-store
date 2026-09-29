import mongoose from 'mongoose'
import OrderModel from '../models/OrderModel.js'
import ProductModel from '../models/ProductModel.js'

export const createWhatsAppOrder = async (req, res) => {
    try {
        const { items, customer, deliveryType, shippingInfo, totalAmount } =
            req.body

        // 1. Validaciones de seguridad
        if (!items || items.length === 0) {
            return res
                .status(400)
                .json({ success: false, message: 'El carrito está vacío' })
        }
        if (!customer || !customer.firstName || !customer.phone) {
            return res
                .status(400)
                .json({ success: false, message: 'Faltan datos de contacto' })
        }

        // 1b. Stock real de cada variante pedida (una sola consulta). Si algo
        // no alcanza, se rechaza la orden completa: el PDF y el mensaje de
        // WhatsApp se arman en el frontend con el carrito, así que ajustar
        // cantidades acá los dejaría distintos de la orden guardada.
        // No reserva stock (se descuenta al aprobar): evita el caso común de
        // un carrito viejo, no dos órdenes simultáneas por la última unidad.
        const itemProductId = (item) => String(item._id || item.id)
        const productIds = [...new Set(items.map(itemProductId))].filter(
            (id) => mongoose.isValidObjectId(id),
        )
        const products = await ProductModel.find(
            { _id: { $in: productIds } },
            { variants: 1 },
        ).lean()

        const problems = []
        for (const item of items) {
            const product = products.find(
                (p) => String(p._id) === itemProductId(item),
            )
            const variant = product?.variants?.find((v) => v.sku === item.sku)
            if (!variant) {
                problems.push(`${item.name}: ya no está disponible`)
            } else if (variant.stock < item.quantity) {
                problems.push(
                    `${item.name}${item.size ? ` (${item.size})` : ''}: pediste ${item.quantity}, quedan ${variant.stock}`,
                )
            }
        }
        if (problems.length > 0) {
            return res.status(409).json({
                success: false,
                message: `Sin stock suficiente: ${problems.join('; ')}. Ajusta tu carrito e inténtalo de nuevo.`,
            })
        }

        // 2. Generación de Folio Autoincremental
        // Busca la última orden que tenga un orderNumber asignado
        const lastOrder = await OrderModel.findOne({
            orderNumber: { $exists: true },
        })
            .sort({ orderNumber: -1 })
            .limit(1)

        const orderNumber =
            lastOrder && lastOrder.orderNumber
                ? lastOrder.orderNumber + 1
                : 1001

        // 3. Formateo de dirección según la modalidad
        const formattedShippingInfo = {
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email || '',
            phone: customer.phone,
            address:
                deliveryType === 'delivery'
                    ? {
                          street: shippingInfo?.street || '',
                          number: shippingInfo?.number || '',
                          city: shippingInfo?.city || '',
                          state: shippingInfo?.state || '',
                          zipCode: shippingInfo?.zipCode || '',
                      }
                    : {},
        }

        // 4. Guardar en Base de Datos
        const newOrder = new OrderModel({
            userId: req.user?._id || null,
            orderNumber,
            deliveryType,
            products: items.map((item) => ({
                productId: item._id || item.id, // Compatibilidad por si pasas _id o id
                name: item.name,
                sku: item.sku || '',
                size: item.size || '',
                baseColor: item.baseColor || '',
                price: item.price,
                quantity: item.quantity,
                imageUrl: item.imageUrl || '',
            })),
            totalAmount,
            status: 'whatsapp_pending',
            shippingInfo: formattedShippingInfo,
        })

        const savedOrder = await newOrder.save()

        res.status(201).json({
            success: true,
            message: 'Orden registrada con éxito',
            orderNumber: savedOrder.orderNumber,
        })
    } catch (error) {
        console.error('Error en createWhatsAppOrder:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
        })
    }
}

export const getAllOrders = async (req, res) => {
    try {
        const orders = await OrderModel.find().sort({ createdAt: -1 })
        res.status(200).json({ success: true, orders })
    } catch (error) {
        console.error('Error en getAllOrders:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
        })
    }
}

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        const validStatuses = [
            'pending',
            'approved',
            'rejected',
            'cancelled',
            'in_process',
            'whatsapp_pending',
        ]
        if (!validStatuses.includes(status)) {
            return res
                .status(400)
                .json({ success: false, message: 'Estado inválido' })
        }

        const order = await OrderModel.findById(id)
        if (!order) {
            return res
                .status(404)
                .json({ success: false, message: 'Orden no encontrada' })
        }

        const previousStatus = order.status

        if (previousStatus === status) {
            return res
                .status(200)
                .json({ success: true, order, message: 'Sin cambios' })
        }

        const warnings = []
        const enteringApproved = status === 'approved' && previousStatus !== 'approved'
        const leavingApproved = previousStatus === 'approved' && status !== 'approved'

        if (enteringApproved) {
            for (const item of order.products) {
                if (!item.sku) continue
                const product = await ProductModel.findById(item.productId)
                if (!product) continue
                const variant = product.variants.find((v) => v.sku === item.sku)
                if (!variant) continue
                variant.stock -= item.quantity
                if (variant.stock < 0) {
                    warnings.push(
                        `${item.name} (${item.sku}): stock quedó en ${variant.stock}`,
                    )
                }
                await product.save()
            }
        } else if (leavingApproved) {
            for (const item of order.products) {
                if (!item.sku) continue
                const product = await ProductModel.findById(item.productId)
                if (!product) continue
                const variant = product.variants.find((v) => v.sku === item.sku)
                if (!variant) continue
                variant.stock += item.quantity
                await product.save()
            }
        }

        order.status = status
        await order.save()

        res.status(200).json({ success: true, order, warnings })
    } catch (error) {
        console.error('Error en updateOrderStatus:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
        })
    }
}
