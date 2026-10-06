import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Cart from '../../../features/cart/ui/Cart'
import UserDropDown from '../../../features/auth/ui/UserDropDown'
import SearchBar from '../../../shared/ui/SearchBar'
import MobileMenuDrawer from './MobileMenuDrawer'
import { useUser } from '../../../entities/user'

const Navbar = ({ children }) => {
    // 1. Contextos y Hooks de Terceros
    const { loading, userInfo } = useUser()
    const location = useLocation()

    // 2. Estados Locales (Agrupados para mayor limpieza)
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // 3. Lógica Derivada
    const isDashboardProductsRoute = location.pathname.startsWith(
        '/admin/dashboard/products',
    )

    // 4. Efectos (Scroll)
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        handleScroll()
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header className="sticky top-0 z-50">
            {/* PISO 1: NAVBAR PRINCIPAL */}
            <nav
                className={`w-full border-b border-base-200 py-2 text-base-content transition-colors duration-300 ${
                    isScrolled
                        ? 'bg-base-100/95 backdrop-blur-md shadow-sm'
                        : 'bg-base-100'
                }`}
            >
                {/* Mismo ancho que /shop y Home (1800 px). Grilla de 3
                    columnas: los costados miden lo mismo, así el logo (mobile)
                    y el buscador (desktop) quedan centrados aunque a la
                    derecha haya más íconos, y nada se les monta encima */}
                <div className="navbar w-full max-w-[1800px] mx-auto px-2 sm:px-6 lg:px-8 min-h-[4rem] grid grid-cols-[1fr_auto_1fr] gap-2 lg:grid-cols-[1fr_minmax(0,42rem)_1fr] lg:gap-4">
                    {/* IZQUIERDA (Start) */}
                    <div className="navbar-start w-auto flex items-center">
                        {/* Menú Sandwich (SOLO MOBILE) */}
                        {!isDashboardProductsRoute && (
                            <button
                                type="button"
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="btn btn-ghost btn-circle lg:hidden"
                                aria-label="Abrir menú"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h7"
                                    />
                                </svg>
                            </button>
                        )}

                        {/* Logo (SOLO DESKTOP) */}
                        <Link
                            to="/"
                            onClick={() =>
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                            }
                            className="hidden lg:flex items-center"
                            aria-label="Nebadon"
                        >
                            <span className="font-logo text-5xl text-black leading-none">
                                NEBADON
                            </span>
                        </Link>
                    </div>

                    {/* CENTRO (Center) */}
                    <div className="navbar-center w-full flex justify-center">
                        {/* Logo (SOLO MOBILE) */}
                        <Link
                            to="/"
                            onClick={() =>
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                            }
                            className="flex lg:hidden items-center"
                            aria-label="Nebadon"
                        >
                            <span className="font-logo text-3xl text-black leading-none">
                                NEBADON
                            </span>
                        </Link>

                        {/* SearchBar Completa (SOLO DESKTOP). El ícono de tienda
                            se reemplazó por "Tienda" en el submenú */}
                        {!isDashboardProductsRoute && (
                            <div className="hidden lg:flex w-full items-center">
                                <SearchBar />
                            </div>
                        )}
                    </div>

                    {/* DERECHA (End). lg:pr-0: en desktop el carrito queda en
                        el mismo borde derecho que la grilla de /shop (el
                        padding ya lo da el contenedor, lg:px-8) */}
                    {!isDashboardProductsRoute && (
                        <div className="navbar-end w-auto col-start-3 flex justify-end items-center gap-1 sm:gap-4 pr-2 lg:pr-0">
                            {/* Botón lupa (SOLO MOBILE) */}
                            <button
                                type="button"
                                onClick={() =>
                                    setIsMobileSearchOpen(!isMobileSearchOpen)
                                }
                                className={`btn btn-circle lg:hidden ${
                                    isMobileSearchOpen
                                        ? 'btn-primary'
                                        : 'btn-ghost'
                                }`}
                                aria-label="Buscar"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </button>

                            {/* Botón Dashboard Administrador - Ícono de engranaje con tooltip.
                                Solo desktop: en mobile está en el menú hamburguesa */}
                            {userInfo?.isAdmin && (
                                <Link
                                    to="/admin/dashboard/products"
                                    className="hidden lg:flex btn btn-ghost btn-circle text-base-content/70 hover:text-primary tooltip tooltip-bottom"
                                    data-tip="Dashboard"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                </Link>
                            )}

                            {/* EL ENROQUE. Solo desktop: en mobile no cabía junto a
                                la lupa y el carrito; la sesión está en el menú
                                hamburguesa */}
                            {!loading && (
                                <div className="hidden lg:block">
                                    <UserDropDown />
                                </div>
                            )}
                            <Cart />
                        </div>
                    )}
                </div>
            </nav>

            {/* PISO 1.5: LA BARRA DE BÚSQUEDA DESPLEGABLE (SOLO MOBILE) */}
            {!isDashboardProductsRoute && (
                <div
                    className={`lg:hidden w-full bg-base-200 transition-all duration-300 ease-in-out overflow-hidden ${
                        isMobileSearchOpen
                            ? 'max-h-[200px] border-b border-base-300 opacity-100'
                            : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className="py-3 px-4 shadow-inner">
                        <SearchBar />
                    </div>
                </div>
            )}

            {/* PISO 2: SUB-HEADER DE CATEGORÍAS (SOLO DESKTOP) */}
            {!isDashboardProductsRoute && (
                <div className="hidden lg:flex w-full border-b border-base-200 bg-base-100">
                    {/* Mismo contenedor que la fila de arriba, centrado: queda
                        simétrico bajo el buscador. Sin overflow-hidden en ningún
                        nivel, para que el panel de cada temática no se corte */}
                    <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-center items-center">
                        {children}
                    </div>
                </div>
            )}

            {/* DRAWER MÓVIL (Renderizado al más alto nivel para evitar fallos de z-index) */}
            <MobileMenuDrawer
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />
        </header>
    )
}

export default Navbar
