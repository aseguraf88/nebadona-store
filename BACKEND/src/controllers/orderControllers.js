import mongoose from 'mongoose'
import OrderModel from '../models/OrderModel.js'
import ProductModel from '../models/ProductModel.js'
import { adjustVariantStock } from '../services/variantStock.js'

// Modalidad de entrega (paso 54) → deliveryType, que se sigue guardando para
// el panel, los filtros y las órdenes anteriores
const DELIVERY_TYPE_BY_METHOD = {
    agency: 'delivery',
    express: 'delivery',
    meetup: 'pickup',
    warehouse: 'pickup',
}

export const createWhatsAppOrder = async (req, res) => {
    try {
        const {
            items,
            customer,
            deliveryType: requestedDeliveryType,
            deliveryMethod: requestedDeliveryMethod,
            shippingInfo,
            totalAmount,
            giftBoxRequested,
        } = req.body

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

        // 1a. Modalidad: opcional (el checkout anterior no la manda). Si
        // viene, tiene que ser una de las 4 (un texto, no un arreglo ni un
        // número), y deliveryType se deriva de ella, no del navegador
        const deliveryMethod = requestedDeliveryMethod ?? null
        if (
            deliveryMethod !== null &&
            (typeof deliveryMethod !== 'string' ||
                !Object.hasOwn(DELIVERY_TYPE_BY_METHOD, deliveryMethod))
        ) {
            return res.status(400).json({
                success: false,
                message: 'Forma de entrega no válida',
            })
        }
        const deliveryType = deliveryMethod
            ? DELIVERY_TYPE_BY_METHOD[deliveryMethod]
            : requestedDeliveryType

        // 1b. Cantidad, stock y precio real de cada variante pedida (una sola
        // consulta). Si algo no cuadra, se rechaza la orden completa: el PDF
        // y el mensaje de WhatsApp se arman en el frontend con el carrito,
        // así que corregir cantidades o precios acá los dejaría distintos de
        // la orden guardada.
        // No reserva stock (se descuenta al aprobar): evita el caso común de
        // un carrito viejo, no dos órdenes simultáneas por la última unidad.
        const invalidQuantity = items.find(
            (item) => !Number.isInteger(item.quantity) || item.quantity < 1,
        )
        if (invalidQuantity) {
            return res.status(400).json({
                success: false,
                message: `Cantidad inválida para ${invalidQuantity.name}`,
            })
        }

        const itemProductId = (item) => String(item._id || item.id)
        const itemLabel = (item) =>
            `${item.name}${item.size ? ` (${item.size})` : ''}`
        const formatCLP = (amount) =>
            new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
            }).format(amount)
        const productIds = [...new Set(items.map(itemProductId))].filter(
            (id) => mongoose.isValidObjectId(id),
        )
        // Solo productos a la venta: uno en DRAFT no aparece entre los
        // encontrados y cae en "ya no está disponible", igual que uno borrado
        const products = await ProductModel.find(
            { _id: { $in: productIds }, status: 'PUBLISHED' },
            { variants: 1, price: 1 },
        ).lean()

        const stockProblems = []
        const priceProblems = []
        const realPrices = []
        for (const [i, item] of items.entries()) {
            const product = products.find(
                (p) => String(p._id) === itemProductId(item),
            )
            const variant = product?.variants?.find((v) => v.sku === item.sku)
            // Misma regla que el carrito (CartContext, cartControllers)
            const realPrice = variant ? (variant.price ?? product.price ?? null) : null
            realPrices[i] = realPrice
            // Última barrera: un precio que no es un entero positivo (0, sin
            // precio o mal importado) no termina en una orden real
            if (!variant || !Number.isInteger(realPrice) || realPrice <= 0) {
                if (variant) {
                    console.warn(
                        `Orden rechazada: precio inválido (${realPrice}) en SKU ${variant.sku}`,
                    )
                }
                stockProblems.push(`${item.name}: ya no está disponible`)
            } else if (variant.stock < item.quantity) {
                stockProblems.push(
                    `${itemLabel(item)}: pediste ${item.quantity}, quedan ${variant.stock}`,
                )
            } else if (Number(item.price) !== realPrice) {
                priceProblems.push(
                    `el precio de ${itemLabel(item)} cambió a ${formatCLP(realPrice)}`,
                )
            }
        }
        if (stockProblems.length > 0) {
            return res.status(409).json({
                success: false,
                message: `Sin stock suficiente: ${stockProblems.join('; ')}. Ajusta tu carrito e inténtalo de nuevo.`,
            })
        }
        if (priceProblems.length > 0) {
            return res.status(409).json({
                success: false,
                message: `Precios actualizados: ${priceProblems.join('; ')}. Quita esos productos del carrito y vuelve a agregarlos.`,
            })
        }

        const realTotal = items.reduce(
            (acc, item, i) => acc + realPrices[i] * item.quantity,
            0,
        )
        if (Number(totalAmount) !== realTotal) {
            return res.status(409).json({
                success: false,
                message:
                    'El total del pedido no coincide con los precios actuales. Recarga la página e inténtalo de nuevo.',
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
            deliveryMethod,
            // Solo un true real cuenta ("true", 1 o un objeto quedan en
            // false, sin 400). No toca el total ni su validación
            giftBoxRequested: giftBoxRequested === true,
            products: items.map((item, i) => ({
                productId: item._id || item.id, // Compatibilidad por si pasas _id o id
                name: item.name,
                sku: item.sku || '',
                size: item.size || '',
                baseColor: item.baseColor || '',
                price: realPrices[i],
                quantity: item.quantity,
                imageUrl: item.imageUrl || '',
            })),
            totalAmount: realTotal,
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

// Error con respuesta propia (409): se lanza dentro de la transacción para
// deshacerla entera y se traduce a respuesta fuera de ella
class OrderStatusConflict extends Error {
    constructor(message) {
        super(message)
        this.name = 'OrderStatusConflict'
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

        const enteringApproved = status === 'approved' && previousStatus !== 'approved'
        const leavingApproved = previousStatus === 'approved' && status !== 'approved'

        // Estado y stock cambian juntos o no cambia nada (transacción). Entrar
        // a approved descuenta solo si alcanza (nunca deja el stock bajo
        // cero: el pedido se confirma por WhatsApp antes de aprobar); salir
        // de approved devuelve sin condición. Un ítem sin SKU, con cantidad
        // inválida o con la variante borrada no frena el cambio de estado:
        // se salta y se avisa en warnings
        let warnings = []
        let updatedOrder = null
        await mongoose.connection.transaction(async (session) => {
            // El driver puede reintentar el callback ante un error
            // transitorio: cada intento empieza de cero
            warnings = []
            updatedOrder = null

            // Reclamo del estado: solo si la orden sigue como se leyó. Si
            // otra petición la cambió antes (doble clic, dos pestañas), esta
            // no toca el stock
            const claimed = await OrderModel.findOneAndUpdate(
                { _id: order._id, status: previousStatus },
                { $set: { status } },
                { new: true, session },
            )
            if (!claimed) {
                throw new OrderStatusConflict(
                    'La orden cambió mientras la editabas. Recarga la página.',
                )
            }

            if (enteringApproved || leavingApproved) {
                const insufficient = []
                for (const item of claimed.products) {
                    const label = item.sku
                        ? `${item.name || 'Producto'} (${item.sku})`
                        : item.name || 'Producto'
                    if (!item.sku) {
                        warnings.push(`${label}: sin SKU, no se tocó el stock`)
                        continue
                    }
                    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
                        warnings.push(
                            `${label}: cantidad inválida, no se tocó el stock`,
                        )
                        continue
                    }
                    // Mismo SKU en dos ítems: el segundo ve lo que descontó
                    // el primero (misma sesión)
                    const result = await adjustVariantStock({
                        sku: item.sku,
                        delta: enteringApproved ? -item.quantity : item.quantity,
                        mode: enteringApproved ? 'conditional' : 'allowNegative',
                        session,
                    })
                    if (result.status === 'not_found') {
                        warnings.push(
                            `${label}: el producto o la variante ya no existe, no se ${enteringApproved ? 'descontó' : 'restauró'} stock`,
                        )
                    } else if (result.status === 'insufficient') {
                        insufficient.push(
                            `${label}, disponible ${result.stock}, pedido ${item.quantity}`,
                        )
                    }
                }
                // Se revisan todos los ítems para nombrarlos juntos; el
                // error deshace también los que sí alcanzaban
                if (insufficient.length > 0) {
                    throw new OrderStatusConflict(
                        `Stock insuficiente: ${insufficient.join('; ')}. La orden no cambió.`,
                    )
                }
            }

            updatedOrder = claimed
        })

        res.status(200).json({ success: true, order: updatedOrder, warnings })
    } catch (error) {
        if (error instanceof OrderStatusConflict) {
            return res
                .status(409)
                .json({ success: false, message: error.message })
        }
        console.error('Error en updateOrderStatus:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
        })
    }
}

// Resumen para el inicio del dashboard (paso 57). Venta = orden 'approved',
// contada según la fecha del pedido (createdAt), no la de aprobación: un
// pedido aprobado días después suma en el día en que se hizo. "Hoy" y "este
// mes" son en hora de Chile: se comparan etiquetas de fecha local
// ($dateToString con timezone) en vez de calcular la medianoche, que en el
// cambio de horario de septiembre no existe. totalAmount no incluye el envío
const SUMMARY_TIMEZONE = 'America/Santiago'
// Pedidos que la dueña todavía no aprobó, canceló ni rechazó
const PENDING_REVIEW_STATUSES = ['whatsapp_pending', 'pending', 'in_process']

const localDate = (format, date) => ({
    $dateToString: { format, date, timezone: SUMMARY_TIMEZONE },
})

// { revenue, count } del primer grupo, o ceros si no hubo ventas, más el
// ticket medio redondeado a pesos (null sin ventas)
const toSalesTotals = ([group]) => {
    const revenue = group?.revenue ?? 0
    const count = group?.count ?? 0
    return {
        revenue,
        count,
        avgTicket: count > 0 ? Math.round(revenue / count) : null,
    }
}

export const getOrdersSummary = async (req, res) => {
    try {
        const [result] = await OrderModel.aggregate([
            {
                $match: {
                    status: { $in: ['approved', ...PENDING_REVIEW_STATUSES] },
                },
            },
            {
                $addFields: {
                    localDay: localDate('%Y-%m-%d', '$createdAt'),
                    localMonth: localDate('%Y-%m', '$createdAt'),
                },
            },
            {
                $facet: {
                    today: [
                        {
                            $match: {
                                status: 'approved',
                                $expr: {
                                    $eq: [
                                        '$localDay',
                                        localDate('%Y-%m-%d', '$$NOW'),
                                    ],
                                },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                revenue: { $sum: '$totalAmount' },
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    month: [
                        {
                            $match: {
                                status: 'approved',
                                $expr: {
                                    $eq: [
                                        '$localMonth',
                                        localDate('%Y-%m', '$$NOW'),
                                    ],
                                },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                revenue: { $sum: '$totalAmount' },
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    pendingReview: [
                        {
                            $match: {
                                status: { $in: PENDING_REVIEW_STATUSES },
                            },
                        },
                        { $count: 'count' },
                    ],
                },
            },
        ])

        res.status(200).json({
            success: true,
            today: toSalesTotals(result.today),
            month: toSalesTotals(result.month),
            pendingReview: result.pendingReview[0]?.count ?? 0,
        })
    } catch (error) {
        console.error('Error en getOrdersSummary:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
        })
    }
}
