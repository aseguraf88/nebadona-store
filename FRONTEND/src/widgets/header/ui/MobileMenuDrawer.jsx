import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiChevronDown, FiX } from 'react-icons/fi'
import { HiOutlineLogout } from 'react-icons/hi'
import { TbLayoutDashboard } from 'react-icons/tb'
import { useProduct } from '../../../entities/product'
import { useUser } from '../../../entities/user'
import { useLogout } from '../../../features/auth/model/useLogout'
import { buildThemeMenu } from '../../../entities/product/lib/themes'
import { WHATSAPP_URL, INSTAGRAM_URL } from '../../../shared/config/contact'

const itemClass =
    'flex w-full items-center justify-between py-4 px-2 font-bold text-sm uppercase tracking-wide text-base-content/90 hover:text-primary transition-colors'

const subItemClass =
    'block py-2.5 pl-6 pr-2 text-sm font-medium text-base-content/80 hover:text-primary transition-colors'

const helpLinkClass =
    'block py-2.5 px-2 text-sm font-medium text-base-content/80 hover:text-primary transition-colors'

// Mismas páginas de ayuda que el footer, más WhatsApp e Instagram
const HELP_LINKS = [
    { name: 'Envíos y Entregas', path: '/envios-y-entregas' },
    { name: 'Guía de Tallas', path: '/guia-tallas' },
    { name: 'Guía de Cuidados', path: '/guia-cuidados' },
]

const EXTERNAL_LINKS = [
    { name: 'Contacto por WhatsApp', href: WHATSAPP_URL },
    { name: 'Instagram', href: INSTAGRAM_URL },
]

// Menú de mobile: la sesión (si hay), Tienda, las temáticas con productos
// publicados (acordeón con sus franquicias) y la ayuda. Cualquier enlace lo
// cierra; abrir o cerrar un acordeón no
const MobileMenuDrawer = ({ isOpen, onClose }) => {
    const { products, designThemes, franchiseNames } = useProduct()
    const { userInfo, loading } = useUser()
    const logout = useLogout()
    // Mismo criterio que UserDropDown (que en mobile no se muestra)
    const isAuthenticated = Boolean(userInfo?.id) && !loading
    const themes = useMemo(
        () => buildThemeMenu(products, designThemes, franchiseNames),
        [products, designThemes, franchiseNames],
    )
    const [openSlug, setOpenSlug] = useState(null)

    // Al volver a abrir el menú, los acordeones empiezan cerrados
    useEffect(() => {
        if (!isOpen) setOpenSlug(null)
    }, [isOpen])

    if (!isOpen) return null

    const toggle = (slug) =>
        setOpenSlug((current) => (current === slug ? null : slug))

    const handleLogout = async () => {
        await logout()
        onClose()
    }

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
                            NEBADON
                        </span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-content font-bold text-sm">
                            N
                        </span>
                    </div>
                </div>

                {/* Lista de Navegación */}
                <nav
                    aria-label="Menú principal"
                    className="flex-1 overflow-y-auto px-4 py-4"
                >
                    {/* Sesión: en mobile reemplaza al menú de iniciales del
                        navbar. Sin sesión no se muestra */}
                    {isAuthenticated && (
                        <div className="mb-4 border-b border-base-200 pb-4">
                            <p className="px-2 pb-2 text-xs font-bold uppercase tracking-widest text-base-content/50">
                                {userInfo?.isAdmin ? 'Administración' : 'Mi cuenta'}
                            </p>
                            <ul>
                                {userInfo?.isAdmin && (
                                    <li>
                                        <Link
                                            to="/admin/dashboard/products"
                                            onClick={onClose}
                                            className={`${helpLinkClass} flex items-center gap-2`}
                                        >
                                            <TbLayoutDashboard className="h-5 w-5" />
                                            Ir al dashboard
                                        </Link>
                                    </li>
                                )}
                                <li>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-2 py-2.5 px-2 text-sm font-medium text-error hover:text-error/80 transition-colors"
                                    >
                                        <HiOutlineLogout className="h-5 w-5" />
                                        Cerrar sesión
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}

                    <ul className="flex flex-col divide-y divide-base-200/60">
                        <li>
                            <Link to="/shop" onClick={onClose} className={itemClass}>
                                Tienda
                            </Link>
                        </li>

                        {themes.map((theme) =>
                            theme.direct ? (
                                <li key={theme.slug}>
                                    <Link
                                        to={`/shop?tematica=${theme.slug}`}
                                        onClick={onClose}
                                        className={itemClass}
                                    >
                                        {theme.name}
                                    </Link>
                                </li>
                            ) : (
                                <li key={theme.slug}>
                                    <button
                                        type="button"
                                        onClick={() => toggle(theme.slug)}
                                        aria-expanded={openSlug === theme.slug}
                                        aria-controls={`menu-tematica-${theme.slug}`}
                                        className={itemClass}
                                    >
                                        <span>{theme.name}</span>
                                        <FiChevronDown
                                            aria-hidden="true"
                                            className={`h-4 w-4 opacity-50 transition-transform ${
                                                openSlug === theme.slug
                                                    ? 'rotate-180'
                                                    : ''
                                            }`}
                                        />
                                    </button>

                                    {openSlug === theme.slug && (
                                        <ul
                                            id={`menu-tematica-${theme.slug}`}
                                            className="pb-3"
                                        >
                                            <li>
                                                <Link
                                                    to={`/shop?tematica=${theme.slug}`}
                                                    onClick={onClose}
                                                    className={`${subItemClass} font-bold`}
                                                >
                                                    Ver todo {theme.name}
                                                </Link>
                                            </li>
                                            {theme.franchises.map((franchise) => (
                                                <li key={franchise.slug}>
                                                    <Link
                                                        to={`/shop?franquicia=${franchise.slug}`}
                                                        onClick={onClose}
                                                        className={subItemClass}
                                                    >
                                                        {franchise.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ),
                        )}
                    </ul>

                    {/* Ayuda */}
                    <div className="mt-6 border-t border-base-200 pt-4">
                        <p className="px-2 pb-2 text-xs font-bold uppercase tracking-widest text-base-content/50">
                            Ayuda
                        </p>
                        <ul>
                            {HELP_LINKS.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        onClick={onClose}
                                        className={helpLinkClass}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                            {EXTERNAL_LINKS.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={onClose}
                                        className={helpLinkClass}
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>

                {/* Pie del menú: solo el nombre de la tienda */}
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
