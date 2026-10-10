import { FaInstagram } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { INSTAGRAM_URL } from '../../../shared/config/contact'

const Footer = () => {
    // Espacio abajo: 6rem (el pb-24 de siempre) en mobile, para que la
    // última línea no quede debajo del botón flotante de WhatsApp; 2.5rem
    // (el pb-10 de siempre) en tablets, y pb-10 en desktop. En mobile y
    // tablets suma --sticky-bar-h, el alto de la franja fija de la ficha
    // mientras se ve (con ella WhatsApp sube); sin franja vale 0 y el
    // footer queda igual que siempre en todas las páginas
    return (
        <footer className="flex flex-col items-center gap-3 bg-base-200 text-base-content p-10 pb-[calc(6rem_+_var(--sticky-bar-h,0px))] sm:pb-[calc(2.5rem_+_var(--sticky-bar-h,0px))] lg:pb-10 text-center">
            <div className="flex flex-col items-center gap-3 max-w-md">
                <Link
                    to="/"
                    onClick={() =>
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                    className="flex items-center"
                    aria-label="Nebadon"
                >
                    <span className="font-logo text-3xl text-black leading-none">
                        NEBADON
                    </span>
                </Link>
                <p className="font-semibold">Tienda Oficial</p>
                <p className="text-base-content/80">Estilo urbano desde 2019</p>

                <div className="divider w-full max-w-xs my-0"></div>

                <p className="text-sm font-semibold text-base-content/70">
                    Síguenos en Instagram
                </p>
                <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost btn-sm gap-2 normal-case"
                >
                    <FaInstagram className="h-5 w-5" />
                    @nebadon_a
                </a>

                <div className="divider w-full max-w-xs my-0"></div>

                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
                    <Link
                        to="/guia-cuidados"
                        className="link link-hover text-base-content/70"
                    >
                        Guía de Cuidados
                    </Link>
                    <Link
                        to="/guia-tallas"
                        className="link link-hover text-base-content/70"
                    >
                        Guía de Tallas
                    </Link>
                    <Link
                        to="/envios-y-entregas"
                        className="link link-hover text-base-content/70"
                    >
                        Envíos y Entregas
                    </Link>
                </div>

                <div className="divider w-full max-w-xs my-0"></div>

                <p className="text-sm text-base-content/70">
                    © 2026 Nebadon - Todos los derechos reservados.
                </p>
            </div>
        </footer>
    )
}

export default Footer
