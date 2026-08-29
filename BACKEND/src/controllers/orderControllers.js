import OrderModel from '../models/OrderModel.js'

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
