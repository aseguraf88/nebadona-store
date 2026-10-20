import {
    Truck,
    Zap,
    TrainFront,
    Warehouse,
    ShoppingBag,
    ShoppingCart,
    MessageCircle,
    CircleCheck,
} from 'lucide-react'

// Condiciones de compra y entrega: fuente única para el Home, la ficha, el
// checkout y /envios-y-entregas. Si cambia una condición, se cambia acá.
// Reglas de los textos: títulos cortos (2 a 5 palabras) y nunca "por pagar"
// a secas, sino "el envío lo pagas al recibir"

// Las 4 formas de entrega: condición corta (checkout), viñetas
// (/envios-y-entregas, en segunda persona), payment (forma de pago, frase
// impersonal y terminada en punto: la leen la dueña en el WhatsApp y el PDF,
// y el cliente en el checkout) y deliveryType, que la orden sigue guardando
// (el backend lo deriva igual: orderControllers.js, DELIVERY_TYPE_BY_METHOD).
// La dirección se pide solo en las de tipo 'delivery'
export const DELIVERY_METHODS = [
    {
        id: 'agency',
        name: 'Envío a todo Chile',
        condition: 'Starken · el envío lo pagas al recibir',
        deliveryType: 'delivery',
        details: [
            'Por Starken.',
            'Antes del despacho, transfieres el total de los productos.',
            'Despachamos el día hábil siguiente a tu pago.',
            'El envío lo pagas a Starken al recibir. Te damos un valor aproximado.',
        ],
        payment:
            'Transferencia de los productos antes del despacho; el envío se paga a Starken al recibir.',
        icon: Truck,
    },
    {
        id: 'express',
        name: 'Express en Santiago',
        condition: 'Uber o DiDi · el mismo día',
        deliveryType: 'delivery',
        details: [
            'Por Uber o DiDi, el mismo día.',
            'Te cotizamos el viaje y pagas todo en una sola transferencia.',
        ],
        payment: 'Todo en una sola transferencia.',
        icon: Zap,
    },
    {
        id: 'meetup',
        name: 'Punto de encuentro',
        condition: 'Metro Ciudad del Niño (L2) o Mirador (L5)',
        deliveryType: 'pickup',
        details: [
            'Ciudad del Niño (Línea 2) o Mirador (Línea 5).',
            'Día y hora a convenir.',
            'Pagas en efectivo o por transferencia.',
        ],
        payment: 'Efectivo o transferencia.',
        icon: TrainFront,
    },
    {
        id: 'warehouse',
        name: 'Punto de retiro',
        condition: 'La Granja · gratis',
        deliveryType: 'pickup',
        details: [
            'Gratis.',
            'Día y hora a convenir.',
            'Te damos la dirección por WhatsApp.',
            'Pagas en efectivo o por transferencia.',
        ],
        payment: 'Efectivo o transferencia.',
        icon: Warehouse,
    },
]

// La modalidad de una orden por su id (checkout, PDF, WhatsApp y panel de
// órdenes). null si no existe: las órdenes anteriores al paso 54 no la tienen
export const getDeliveryMethod = (id) =>
    DELIVERY_METHODS.find((method) => method.id === id) ?? null

// Franja bajo el botón "Agregar" de la ficha: la parte en negrita (strong)
// es la que se lee primero
export const PRODUCT_DELIVERY_HIGHLIGHTS = [
    { icon: Truck, strong: 'Envío a todo Chile', rest: '· el envío lo pagas al recibir' },
    { icon: Warehouse, strong: 'Retiro gratis', rest: 'en La Granja' },
    { icon: MessageCircle, strong: 'Pagas después de confirmar', rest: 'por WhatsApp' },
]

// "¿Cómo comprar?": Home y /envios-y-entregas. Solo los pasos 3 y 4 llevan
// una línea chica (note)
export const HOW_TO_BUY_TITLE = '¿Cómo comprar?'

export const HOW_TO_BUY_STEPS = [
    { title: 'Elige tus productos', icon: ShoppingBag },
    { title: 'Agrégalos al carrito', icon: ShoppingCart },
    {
        title: 'Envía tu pedido por WhatsApp',
        note: 'Aún no pagas nada',
        icon: MessageCircle,
    },
    {
        title: 'Coordinamos pago y entrega',
        note: 'Te respondemos en menos de 1 hora',
        icon: CircleCheck,
    },
]
