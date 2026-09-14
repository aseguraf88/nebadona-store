import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Cart from '../../../features/cart/ui/Cart'
import UserDropDown from '../../../features/auth/ui/UserDropDown'
import SearchBar from '../../../shared/ui/SearchBar'
import MobileMenuDrawer from './MobileMenuDrawer'
import { useUser } from '../../../entities/user'
import { HiOutlineBuildingStorefront } from 'react-icons/hi2'

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
                <div className="navbar w-full max-w-[1200px] mx-auto px-2 sm:px-6 lg:px-8 min-h-[4rem]">
                    {/* IZQUIERDA (Start) */}
                    <div className="navbar-start w-1/3 lg:w-1/4 flex items-center">
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

                        {/* Botón Tienda (SOLO MOBILE) - Actualizado con icono simétrico */}
                        {!isDashboardProductsRoute && (
                            <Link
                                to="/shop"
                                className="h-10 w-10 flex items-center justify-center rounded-full text-base-content transition-transform duration-300 hover:scale-110 outline-none cursor-pointer lg:hidden"
                                aria-label="Ver Tienda"
                            >
                                <HiOutlineBuildingStorefront className="h-6 w-6" />
                            </Link>
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
                            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-content font-bold shadow-sm">
                                N
                            </span>
                        </Link>
                    </div>

                    {/* CENTRO (Center) */}
                    <div className="navbar-center w-1/3 lg:w-auto lg:flex-1 flex justify-center">
                        {/* Logo (SOLO MOBILE) */}
                        <Link
                            to="/"
                            onClick={() =>
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                            }
                            className="flex lg:hidden items-center"
                            aria-label="Nebadon"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-content font-bold shadow-sm">
                                N
                            </span>
                        </Link>

                        {/* SearchBar Completa (SOLO DESKTOP) */}
                        {!isDashboardProductsRoute && (
                            <div className="hidden lg:flex w-full items-center px-4 gap-2">
                                {/* Botón Tienda Desktop - Actualizado con icono simétrico */}
                                <Link
                                    to="/shop"
                                    className="h-10 w-10 flex items-center justify-center rounded-full text-base-content transition-transform duration-300 hover:scale-110 outline-none cursor-pointer"
                                    aria-label="Catálogo"
                                    title="Ver catálogo completo"
                                >
                                    <HiOutlineBuildingStorefront className="h-6 w-6" />
                                </Link>

                                <div className="flex-1 w-full">
                                    <SearchBar />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* DERECHA (End) */}
                    {!isDashboardProductsRoute && (
                        <div className="navbar-end w-1/3 lg:w-1/4 flex justify-end items-center gap-1 sm:gap-4 pr-2">
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

                            {/* Botón Dashboard Administrador - Ícono de engranaje con tooltip */}
                            {userInfo?.isAdmin && (
                                <Link
                                    to="/admin/dashboard/products"
                                    className="hidden sm:flex btn btn-ghost btn-circle text-base-content/70 hover:text-primary tooltip tooltip-bottom"
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

                            {/* EL ENROQUE */}
                            {!loading && <UserDropDown />}
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
                    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-center items-center">
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
