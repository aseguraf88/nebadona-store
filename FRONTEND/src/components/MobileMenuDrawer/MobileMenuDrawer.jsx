import { Link } from 'react-router-dom'
import { FiChevronRight, FiX } from 'react-icons/fi'

const MobileMenuDrawer = ({ isOpen, onClose }) => {
    if (!isOpen) return null

    const menuItems = [
        { name: 'LO NUEVO', path: '/shop?filter=new', hasSubmenu: false },
        { name: 'ANIME', path: '/shop?category=anime', hasSubmenu: true },
        {
            name: 'VIDEOJUEGOS',
            path: '/shop?category=videojuegos',
            hasSubmenu: true,
        },
        { name: 'CARTOONS', path: '/shop?category=cartoons', hasSubmenu: true },
        {
            name: 'SERIES & PELÍCULAS',
            path: '/shop?category=series',
            hasSubmenu: true,
        },
        {
            name: 'OFERTAS',
            path: '/shop?filter=sale',
            hasSubmenu: false,
            highlight: true,
        },
    ]

    return (
        <div className="fixed inset-0 z-[100] lg:hidden">
            {/* Overlay oscuro de fondo */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            {/* Panel lateral deslizable */}
            <div className="relative w-[85%] max-w-sm h-full bg-base-100 shadow-2xl flex flex-col z-10">
                {/* 👇 ACTUALIZADO: Botón de cerrar a la izquierda (donde estaba la hamburguesa), Logo a la derecha 👇 */}
                <div className="flex items-center justify-between p-5 border-b border-base-200">
                    <button
                        onClick={onClose}
                        // Le damos un margin negativo leve para alinearlo perfectamente con el botón original del Navbar
                        className="btn btn-ghost btn-circle btn-sm -ml-2 text-base-content/80"
                        aria-label="Cerrar menú"
                    >
                        <FiX className="h-6 w-6" />
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="font-extrabold tracking-wider text-base">
                            NEBADONA
                        </span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-content font-bold text-sm">
                            N
                        </span>
                    </div>
                </div>

                {/* Lista de Navegación */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                    <ul className="flex flex-col divide-y divide-base-200/60">
                        {menuItems.map((item) => (
                            <li key={item.name}>
                                <Link
                                    to={item.path}
                                    onClick={onClose}
                                    className={`flex items-center justify-between py-4 px-2 font-bold text-sm tracking-wide transition-colors ${
                                        item.highlight
                                            ? 'text-error hover:text-error/80'
                                            : 'text-base-content/90 hover:text-primary'
                                    }`}
                                >
                                    <span>{item.name}</span>
                                    {item.hasSubmenu && (
                                        <FiChevronRight className="h-4 w-4 opacity-50" />
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Footer del Menú (Enlaces de contacto o cuenta) */}
                <div className="p-4 border-t border-base-200 bg-base-200/40">
                    <p className="text-xs text-center text-base-content/60 font-medium">
                        Retro Socks & Accesorios
                    </p>
                </div>
            </div>
        </div>
    )
}

export default MobileMenuDrawer
