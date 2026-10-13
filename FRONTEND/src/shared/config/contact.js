// Datos de contacto públicos de la tienda (se usan en el checkout y en el menú)
export const WHATSAPP_NUMBER = '56968048987'
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`
export const INSTAGRAM_URL = 'https://www.instagram.com/nebadon_a/'

// Abre el chat de la tienda con un texto ya armado. Usa api.whatsapp.com/send
// y no wa.me: wa.me pierde los emojis en el computador (se ven como "?"); en
// el teléfono funcionan las dos. Para textos con emojis, usar siempre esta
export const buildWhatsAppUrl = (text) =>
    `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(text)}`
