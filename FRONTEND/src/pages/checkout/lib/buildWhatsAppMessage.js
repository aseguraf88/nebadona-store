// Mensaje de WhatsApp del pedido (paso 66, diseño de la dueña): secciones
// entre separadores de guiones, sin cuadros ni tabuladores. Lo que no es dato
// real (título, títulos de sección y etiquetas) va en MAYÚSCULAS y en negrita
// de WhatsApp (*texto*); los datos y las frases, en texto normal. Emojis solo
// en los títulos (fuera de la negrita) y al final del saludo: del
// set de 2010 y sin selector de variación, para que se vean en casi todos los
// teléfonos. Función pura: recibe los datos ya resueltos y devuelve el texto
// sin codificar (Checkout.jsx arma la URL). El PDF conserva el SKU

// Separador entre secciones: 27 guiones
const SEPARATOR = '-'.repeat(27)

// Emoji del título ENTREGA según el id de la modalidad (shared/config/
// shipping.js); un id desconocido va sin emoji
const DELIVERY_EMOJI = new Map([
    ['agency', '🚚'],
    ['express', '⚡'],
    ['meetup', '🚇'],
    ['warehouse', '📦'],
])

// Tallas genéricas que no se muestran en el paréntesis (se comparan sin
// tildes y sin distinguir mayúsculas)
const GENERIC_SIZES = ['STD', 'UNICA', 'UNICO']

const normalizeSize = (size) =>
    size
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()

// Lo que escribe el cliente y los nombres del catálogo: sin *, _, ~ ni `
// (activarían negrita, cursiva, tachado o monoespaciado en WhatsApp) y con
// los blancos juntos. El email no pasa por acá: un _ es común en un correo
const cleanText = (value) =>
    String(value ?? '')
        .replace(/[*_~`]/g, '')
        .replace(/\s+/g, ' ')
        .trim()

// "gris claro" → "Gris claro" (en la base el color va en minúscula)
const capitalize = (text) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : text

// " (M, Amarillo)", " (Rosa)" o '' si no queda nada que mostrar
const variantLabel = ({ size, baseColor }) => {
    const cleanSize = cleanText(size)
    const parts = [
        cleanSize && !GENERIC_SIZES.includes(normalizeSize(cleanSize))
            ? cleanSize
            : '',
        capitalize(cleanText(baseColor)),
    ].filter(Boolean)
    return parts.length > 0 ? ` (${parts.join(', ')})` : ''
}

// dateStr y timeStr: fecha y hora ya formateadas (las mismas del PDF); si
// alguna llega vacía, se omite su línea. address: null en las modalidades
// de retiro. customer.email: '' si no aplica. extraLines: líneas opcionales
// después del total (por ejemplo, la consulta de empaque especial).
// giftBoxRequested: con true, el total dice que tampoco incluye el empaque
// especial
export const buildWhatsAppMessage = ({
    folio,
    dateStr,
    timeStr,
    customer,
    address,
    deliveryMethod,
    items,
    total,
    formatPrice,
    extraLines = [],
    giftBoxRequested = false,
}) => {
    const fullName = [customer.firstName, customer.lastName]
        .map(cleanText)
        .filter(Boolean)
        .join(' ')

    // Dirección en dos líneas, "{calle} #{número}" y "{comuna}, {región}",
    // solo con lo que exista: sin un "#" ni una coma sueltos
    const addressLines = address
        ? [
              [
                  cleanText(address.street),
                  cleanText(address.number) ? `#${cleanText(address.number)}` : '',
              ]
                  .filter(Boolean)
                  .join(' '),
              [cleanText(address.city), cleanText(address.state)]
                  .filter(Boolean)
                  .join(', '),
          ].filter(Boolean)
        : []

    const email = customer.email?.trim()

    // Sin punto extra si el nombre ya termina en . ! o ? ("Alejandro S.")
    const greetingEnd = /[.!?]$/.test(fullName) ? '' : '.'

    const deliveryEmoji = DELIVERY_EMOJI.get(deliveryMethod.id)

    return [
        `Hola, soy ${fullName}${greetingEnd} Acabo de hacer este pedido en la tienda. 👋`,
        '',
        SEPARATOR,
        '🏪 *NEBADON·STORE*',
        SEPARATOR,
        `📋 *PEDIDO:* #ORD-${folio}`,
        ...(dateStr ? [`*FECHA:* ${dateStr}`] : []),
        ...(timeStr ? [`*HORA:* ${timeStr}`] : []),
        SEPARATOR,
        '📝 *DETALLE*',
        ...items.map((item) => {
            // Mismo respaldo que el armado anterior: sin cantidad, 1
            const qty = item.quantity || 1
            return `${qty} × ${cleanText(item.name)}${variantLabel(item)}: ${formatPrice(item.price * qty)}`
        }),
        '',
        `*TOTAL (${giftBoxRequested ? 'SIN ENVÍO NI EMPAQUE ESPECIAL' : 'SIN ENVÍO'}):* ${formatPrice(total)}`,
        ...extraLines,
        SEPARATOR,
        deliveryEmoji ? `${deliveryEmoji} *ENTREGA*` : '*ENTREGA*',
        deliveryMethod.name,
        ...(addressLines.length > 0 ? ['📍 *DIRECCIÓN*', ...addressLines] : []),
        ...(deliveryMethod.payment ? ['💵 *PAGO*', deliveryMethod.payment] : []),
        SEPARATOR,
        '👤 *DATOS DEL CLIENTE*',
        `*NOMBRE:* ${fullName}`,
        `*TELÉFONO:* ${cleanText(customer.phone)}`,
        ...(email ? [`*EMAIL:* ${email}`] : []),
        SEPARATOR,
        '',
        'Espero tu confirmación. ¡Gracias!',
    ].join('\n')
}
