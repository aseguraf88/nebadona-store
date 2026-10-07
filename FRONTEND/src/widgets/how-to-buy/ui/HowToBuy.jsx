import { Link } from 'react-router-dom'
import {
    HOW_TO_BUY_TITLE,
    HOW_TO_BUY_STEPS,
} from '../../../shared/config/shipping'

// "¿Cómo comprar?": 4 pasos fijos (no carrusel). 1 columna en mobile, 2×2
// desde 640 px y 4 columnas desde 1024 px. Lo usan el Home (con el enlace a
// envíos) y /envios-y-entregas (sin el enlace, porque ya está en esa página)
const HowToBuy = ({ showLink = false, className = '' }) => (
    <section aria-labelledby="como-comprar" className={className}>
        <h2
            id="como-comprar"
            className="text-lg font-semibold text-base-content mb-4"
        >
            {HOW_TO_BUY_TITLE}
        </h2>

        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {HOW_TO_BUY_STEPS.map((step, index) => (
                // Cada paso en su tarjeta: ícono a la izquierda; número,
                // título y (solo pasos 3 y 4) una línea chica a la derecha
                <li
                    key={step.title}
                    className="flex items-center gap-3 rounded-box bg-base-200/40 p-4"
                >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <step.icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-sm font-bold leading-snug text-base-content">
                            {index + 1}. {step.title}
                        </p>
                        {step.note && (
                            <p className="mt-0.5 text-xs text-base-content/60">
                                {step.note}
                            </p>
                        )}
                    </div>
                </li>
            ))}
        </ol>

        {showLink && (
            <Link
                to="/envios-y-entregas"
                className="link link-primary text-sm font-semibold mt-4 inline-block"
            >
                ¿Cómo recibo mi pedido? →
            </Link>
        )}
    </section>
)

export default HowToBuy
