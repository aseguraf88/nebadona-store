// Caja de regalo, versión 1 de "Armar regalos": solo una consulta. El
// precio no se suma al total de la orden; la dueña confirma por WhatsApp si
// el pedido cabe y lo cobra ahí. Los textos se usan en el carrito, el
// checkout, el PDF y el mensaje de WhatsApp
export const GIFT_BOX_PRICE = 2000

// "$2.000", mismo formato que formatPrice del carrito y el checkout
const priceText = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
}).format(GIFT_BOX_PRICE)

export const GIFT_BOX_LABEL = `¿Es para regalo? ¡Pregunta por nuestro empaque especial! (+${priceText})`
export const GIFT_BOX_NOTE =
    'Marca la casilla y te confirmamos por WhatsApp si hay disponibilidad para tu pedido. Solo se suma al total si lo confirmamos.'
// Dato de la línea de consulta: el PDF le antepone "Consulta: " y el
// mensaje de WhatsApp "*CONSULTA:* "
export const GIFT_BOX_ORDER_LINE = `empaque especial, +${priceText}, a confirmar`
