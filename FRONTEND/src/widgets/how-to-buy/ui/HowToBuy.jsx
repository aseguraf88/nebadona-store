import { Link } from 'react-router-dom'
import {
    HOW_TO_BUY_TITLE,
    HOW_TO_BUY_STEPS,
} from '../../../shared/config/shipping'

// "¿Cómo comprar?": 4 pasos fijos (no carrusel). 1 columna en mobile, 2×2
// desde 640 px y 4 columnas desde 1024 px. Lo usan el Home (con el enlace a
// envíos) y /envios-y-entregas (sin el enlace, porque ya está en esa página)
const HowToBuy = ({ showLink = false, className = '' }) => (
    <section
        aria-labelledby="como-comprar"
        className={`rounded-box bg-base-200/40 p-4 sm:p-6 ${className}`}
    >
        <h2
            id="como-comprar"
            className="text-lg font-semibold text-base-content mb-4"
        >
            {HOW_TO_BUY_TITLE}
        </h2>

        <ol className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-5 lg:grid-cols-4 lg:gap-6">
            {HOW_TO_BUY_STEPS.map((step, index) => (
                // Mobile: ícono a la izquierda, título y texto a la derecha.
                // Desde sm: ícono y título en una fila, texto debajo a todo el ancho
                <li
                    key={step.title}
                    className="grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1 sm:items-center sm:gap-x-2 sm:gap-y-2"
                >
                    <span className="row-span-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:row-span-1">
                        <step.icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-bold text-base-content">
                        {index + 1}. {step.title}
                    </span>
                    <p className="col-start-2 text-xs sm:col-span-2 sm:col-start-1 sm:self-start sm:text-sm leading-snug text-base-content/70">
                        {step.text}
                    </p>
                </li>
            ))}
        </ol>

        {showLink && (
            <Link
                to="/envios-y-entregas"
                className="link link-primary text-sm font-semibold mt-4 inline-block"
            >
                Ver envíos y entregas →
            </Link>
        )}
    </section>
)

export default HowToBuy
