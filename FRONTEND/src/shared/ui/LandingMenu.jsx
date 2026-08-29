import { Link } from 'react-router-dom'

const LandingMenu = () => {
    return (
        <nav className="flex items-center gap-6">
            <a
                href="#new-arrivals"
                className="link link-hover text-sm font-medium"
            >
                Lo Nuevo
            </a>
            <a
                href="#favorites"
                className="link link-hover text-sm font-medium"
            >
                Favoritos
            </a>
            <Link to="/shop" className="link link-hover text-sm font-medium">
                Tienda
            </Link>
            <a href="#contact" className="link link-hover text-sm font-medium">
                Contacto
            </a>
        </nav>
    )
}

export default LandingMenu
