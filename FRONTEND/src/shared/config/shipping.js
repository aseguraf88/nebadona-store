import {
    Truck,
    Zap,
    Handshake,
    Warehouse,
    ShoppingBag,
    MessageCircle,
    CircleCheck,
    Package,
} from 'lucide-react'

// Condiciones de compra y entrega: fuente única para el Home, la ficha, el
// checkout y /envios-y-entregas. Si cambia una condición, se cambia acá.
// Regla de los textos: nunca decir solo "por pagar"; los productos se pagan
// por transferencia y el envío por agencia se le paga a la agencia

// Las 4 formas de entrega, con su condición corta
export const DELIVERY_METHODS = [
    {
        id: 'agency',
        name: 'Envío por agencia',
        condition:
            'Todo Chile · productos por transferencia · el envío se paga a la agencia al recibir',
        icon: Truck,
    },
    {
        id: 'express',
        name: 'Envío Express',
        condition: 'Solo Santiago · mismo día · te cotizamos el viaje',
        icon: Zap,
    },
    {
        id: 'meetup',
        name: 'Entrega en Metro',
        condition:
            'Ciudad del Niño (L2) o Mirador (L5) · efectivo o transferencia',
        icon: Handshake,
    },
    {
        id: 'warehouse',
        name: 'Retiro en bodega',
        condition: 'La Granja · gratis · efectivo o transferencia',
        icon: Warehouse,
    },
]

// Las 2 opciones que tiene hoy el checkout (deliveryType de la orden).
// Se reemplazan por DELIVERY_METHODS en el commit 2 del paso 54
export const CHECKOUT_DELIVERY_OPTIONS = {
    delivery: {
        name: 'Envío por agencia o Express',
        condition:
            'Productos por transferencia · el envío por agencia se paga a la agencia al recibir · Express solo en Santiago',
    },
    pickup: {
        name: 'Retiro o entrega en Metro',
        condition: 'Gratis · efectivo o transferencia',
    },
}

// "¿Cómo comprar?": Home y /envios-y-entregas
export const HOW_TO_BUY_TITLE = '¿Cómo comprar?'

export const HOW_TO_BUY_STEPS = [
    {
        title: 'Elige',
        text: 'Agrega tus productos favoritos al carrito.',
        icon: ShoppingBag,
    },
    {
        title: 'Envía tu pedido',
        text: 'Lo mandas por WhatsApp desde el checkout. Todavía no pagas nada.',
        icon: MessageCircle,
    },
    {
        title: 'Te confirmamos',
        text: 'Te respondemos en menos de 1 hora (de 12:00 a 22:00) con el stock, la entrega y los datos de pago.',
        icon: CircleCheck,
    },
    {
        title: 'Pagas y recibes',
        text: 'Pagas tus productos por transferencia, o en efectivo si retiras o te los entregamos en el Metro. Si eliges envío por agencia, el envío se lo pagas a la agencia al recibir.',
        icon: Package,
    },
]
