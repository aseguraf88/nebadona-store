import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className="footer footer-center bg-base-200 text-base-content p-10">
            <aside>
                <Link to="/" className="flex items-center" aria-label="Nebadona">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-content font-bold shadow-sm lg:h-11 lg:w-11">
                        N
                    </span>
                </Link>
                <p className="font-semibold">NEBADONA Tienda Oficial</p>
                <p className="text-base-content/80">
                    Estilo urbano con actitud, desde 2020
                </p>
                <p className="text-sm text-base-content/70">
                    Copyright © 2026 - Todos los derechos reservados
                </p>
            </aside>

            <nav>
                <div className="grid grid-flow-col gap-4">
                    <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Instagram"
                        className="btn btn-ghost btn-circle"
                    >
                        <FaInstagram className="h-5 w-5" />
                    </a>
                    <a
                        href="https://wa.me"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="WhatsApp"
                        className="btn btn-ghost btn-circle"
                    >
                        <FaWhatsapp className="h-5 w-5" />
                    </a>
                    <a
                        href="https://facebook.com"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Facebook"
                        className="btn btn-ghost btn-circle"
                    >
                        <FaFacebookF className="h-5 w-5" />
                    </a>
                </div>
            </nav>
        </footer>
    )
}

export default Footer