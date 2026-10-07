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

// Las 4 formas de entrega: condición corta (ficha y checkout) y viñetas
// (/envios-y-entregas)
export const DELIVERY_METHODS = [
    {
        id: 'agency',
        name: 'Envío a todo Chile',
        condition: 'Starken · el envío lo pagas al recibir',
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
        details: [
            'Gratis.',
            'Lunes a viernes de 19:00 a 22:00. Sábado y domingo de 10:00 a 20:00.',
            'Te damos la dirección por WhatsApp.',
        ],
        icon: Warehouse,
    },
]

// Franja bajo el botón "Agregar" de la ficha: la parte en negrita (strong)
// es la que se lee primero
export const PRODUCT_DELIVERY_HIGHLIGHTS = [
    { icon: Truck, strong: 'Envío a todo Chile', rest: '· el envío lo pagas al recibir' },
    { icon: Warehouse, strong: 'Retiro gratis', rest: 'en bodega (La Granja)' },
    { icon: MessageCircle, strong: 'Pagas después de confirmar', rest: 'por WhatsApp' },
]

// Las 2 opciones que tiene hoy el checkout (deliveryType de la orden).
// Se reemplazan por DELIVERY_METHODS en el commit 3 del paso 54
export const CHECKOUT_DELIVERY_OPTIONS = {
    delivery: {
        name: 'Envío a todo Chile o Express',
        condition: 'Starken: el envío lo pagas al recibir',
    },
    pickup: {
        name: 'Retiro en bodega o punto de encuentro',
        condition: 'Gratis · La Granja o Metro',
    },
}

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
