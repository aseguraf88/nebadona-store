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
// (/envios-y-entregas) y deliveryType, que la orden sigue guardando (el
// backend lo deriva igual: orderControllers.js, DELIVERY_TYPE_BY_METHOD).
// La dirección se pide solo en las de tipo 'delivery'
export const DELIVERY_METHODS = [
    {
        id: 'agency',
        name: 'Envío a todo Chile',
        condition: 'Starken · el envío lo pagas al recibir',
        deliveryType: 'delivery',
        details: [
            'Por Starken (también Blue Express; otras agencias, a convenir).',
            'Despachamos el día hábil siguiente a tu pago.',
            'El envío lo pagas a la agencia al recibir. Te damos un valor aproximado.',
        ],
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
        ],
        icon: TrainFront,
    },
    {
        id: 'warehouse',
        name: 'Retiro en bodega',
        condition: 'La Granja · gratis',
        deliveryType: 'pickup',
        details: [
            'Gratis.',
            'Lunes a viernes de 19:00 a 22:00. Sábado y domingo de 10:00 a 20:00.',
            'Te damos la dirección por WhatsApp.',
        ],
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
    { icon: Warehouse, strong: 'Retiro gratis', rest: 'en bodega (La Granja)' },
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
