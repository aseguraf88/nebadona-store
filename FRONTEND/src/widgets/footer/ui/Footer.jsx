import { FaInstagram } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className="flex flex-col items-center gap-3 bg-base-200 text-base-content p-10 text-center">
            <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center"
                aria-label="Nebadon"
            >
                <span className="font-logo text-3xl text-black leading-none">
                    NEBADON
                </span>
            </Link>
            <p className="font-semibold">Tienda Oficial</p>
            <p className="text-base-content/80">Estilo urbano desde 2020</p>

            <div className="divider w-full max-w-xs my-0"></div>

            <p className="text-sm font-semibold text-base-content/70">
                Síguenos en Instagram
            </p>
            <a
                href="https://www.instagram.com/nebadon_a/"
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost btn-sm gap-2 normal-case"
            >
                <FaInstagram className="h-5 w-5" />
                @nebadon_a
            </a>

            <div className="divider w-full max-w-xs my-0"></div>

            <p className="text-sm text-base-content/70">
                © 2026 Nebadon - Todos los derechos reservados.
            </p>
        </footer>
    )
}

export default Footer
