import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import {
    HOW_TO_BUY_TITLE,
    HOW_TO_BUY_STEPS,
} from '../../../shared/config/shipping'

// "¿Cómo comprar?": 4 pasos fijos (no carrusel). 2×2 bajo 1024 px; el alto
// de cada caja lo define su contenido. Con columns={4} pasa a 4 columnas
// desde 1024 px; con columns={2} queda en 2×2 en todos los anchos. Lo usan el Home (4 columnas, con el enlace a envíos) y
// /envios-y-entregas (2 columnas, sin el enlace, porque ya está en esa página)
const HowToBuy = ({ showLink = false, columns = 4, className = '' }) => (
    <section aria-labelledby="como-comprar" className={className}>
        <h2
            id="como-comprar"
            className="text-lg font-semibold text-base-content mb-4"
        >
            {HOW_TO_BUY_TITLE}
        </h2>

        <ol
            className={`grid grid-cols-2 gap-x-6 gap-y-4 sm:gap-7 ${
                columns === 4 ? 'lg:grid-cols-4' : ''
            }`}
        >
            {HOW_TO_BUY_STEPS.map((step, index) => {
                // El último paso va relleno de primary
                const isLast = index === HOW_TO_BUY_STEPS.length - 1

                return (
                    <li
                        key={step.title}
                        className={`relative flex flex-col rounded-2xl border-2 border-primary p-3 sm:rounded-[20px] sm:p-4 ${
                            isLast ? 'bg-primary' : 'bg-base-100'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-primary sm:h-14 sm:w-14 ${
                                    isLast ? 'bg-white' : 'bg-primary/10'
                                }`}
                            >
                                <step.icon
                                    aria-hidden="true"
                                    className="h-[26px] w-[26px] sm:h-[30px] sm:w-[30px]"
                                />
                            </span>
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-warning text-sm font-bold text-base-content sm:h-8 sm:w-8 sm:text-base">
                                {index + 1}
                            </span>
                        </div>

                        {/* Alto de 2 líneas siempre: los títulos arrancan a
                            la misma altura y las notas también */}
                        <p
                            className={`mt-2 min-h-10 text-sm font-bold leading-5 sm:mt-[10px] sm:min-h-12 sm:text-[20px] sm:leading-6 ${
                                isLast ? 'text-white' : 'text-base-content'
                            }`}
                        >
                            {step.title}
                        </p>

                        {/* Solo pasos 3 y 4: el 3 en píldora, el 4 en blanco */}
                        {step.note &&
                            (isLast ? (
                                <p className="mt-1 text-xs text-white sm:mt-1.5 sm:text-sm">
                                    {step.note}
                                </p>
                            ) : (
                                <p className="mt-1 sm:mt-1.5">
                                    <span className="inline-block rounded-full bg-[#FFF3CC] px-2 py-0.5 text-xs font-semibold text-[#5C4300] sm:px-3 sm:text-sm">
                                        {step.note}
                                    </span>
                                </p>
                            ))}

                        {/* Flecha al paso siguiente, centrada en el hueco
                            entre cajas (100% + borde de 2 px + medio hueco)
                            y a la altura del centro del ícono. En 2 columnas
                            solo tras los pasos 1 y 3 (el 2 cierra la fila) */}
                        {!isLast && (
                            <span
                                aria-hidden="true"
                                className={`absolute left-[calc(100%+14px)] top-9 z-10 h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white sm:left-[calc(100%+16px)] sm:top-11 sm:h-8 sm:w-8 ${
                                    index !== 1
                                        ? 'flex'
                                        : columns === 4
                                          ? 'hidden lg:flex'
                                          : 'hidden'
                                }`}
                            >
                                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                            </span>
                        )}
                    </li>
                )
            })}
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
