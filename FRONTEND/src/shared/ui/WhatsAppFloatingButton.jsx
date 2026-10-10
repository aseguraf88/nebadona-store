import { FaWhatsapp } from 'react-icons/fa'
import { WHATSAPP_URL } from '../config/contact'

// Mensaje con el que se abre el chat
const GREETING = 'Hola Nebadon, tengo una consulta'

// Botón fijo abajo a la derecha en la tienda (Layout lo oculta en /checkout).
// z-40: queda debajo del carrito, los cajones y los modales (z-[100] o más),
// así que nunca los tapa. El bottom suma la zona segura del iPhone y
// --sticky-bar-h, el alto de la franja fija de la ficha mientras se ve (0
// o sin definir en el resto de la tienda): así sube sobre ella
const WhatsAppFloatingButton = () => (
    <a
        href={`${WHATSAPP_URL}?text=${encodeURIComponent(GREETING)}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className="fixed right-4 bottom-[calc(1rem_+_var(--sticky-bar-h,0px)_+_env(safe-area-inset-bottom))] z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-[transform,bottom] duration-300 motion-reduce:transition-none hover:scale-110"
        style={{ backgroundColor: '#25D366' }}
    >
        <FaWhatsapp aria-hidden="true" className="h-8 w-8" />
    </a>
)

export default WhatsAppFloatingButton
