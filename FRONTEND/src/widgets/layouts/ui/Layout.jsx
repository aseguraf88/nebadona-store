import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from '../../header'
import { Footer } from '../../footer'
import { Link } from 'react-router-dom'

const Layout = () => {
    const location = useLocation()

    const isShopRoute = location.pathname.startsWith('/shop')

    return (
        <div className="min-h-screen bg-base-100">
            <header className="sticky top-0 z-50 w-full flex flex-col">
                <div className="bg-neutral py-2 text-xs md:text-sm font-bold uppercase tracking-widest text-primary-content overflow-hidden flex items-center">
                    {/* El texto que se mueve */}
                    <div className="animate-marquee whitespace-nowrap inline-block w-full">
                        🎉 GRAN APERTURA GRAN - ¡Aprovecha nuestros descuentos
                        de inauguración! 🎉 25% 50% Y HASTA EL 🔥🔥100%🔥🔥 DE
                        DESCUENTOS EN CALCETAS Y TODOS LOS ACCESORIOS - ANIME -
                        CARTOONS - VIDEOJUEGOS - PELICULAS - SERIES DE
                        TELEVISION - DE TODO - ❤️ 🔥 🧦 🔥 🧦 🔥 👣 🎁 🛍️ 🎁 🛍️
                        ❤️
                    </div>
                </div>
                <Navbar>
                    <ul className="flex items-center gap-6 text-sm font-bold text-base-content/70">
                        <li>
                            <Link
                                to="/shop?category=anime"
                                className="hover:text-primary transition-colors"
                            >
                                Anime
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/shop?category=videojuegos"
                                className="hover:text-primary transition-colors"
                            >
                                Videojuegos
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/shop?category=cartoons"
                                className="hover:text-primary transition-colors"
                            >
                                Cartoons
                            </Link>
                        </li>

                        {/* Divisor visual sutil */}
                        <div className="h-4 w-[1px] bg-base-300 mx-2"></div>

                        {/* Enlaces dinámicos */}
                        <li>
                            <Link
                                to="/shop?filter=new"
                                className="hover:text-primary transition-colors flex items-center gap-1"
                            >
                                Lo Nuevo{' '}
                                <span className="badge badge-primary badge-xs scale-75">
                                    UP
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/shop?filter=sale"
                                className="text-error hover:text-error/70 transition-colors flex items-center gap-1"
                            >
                                <span className="text-lg leading-none">🔥</span>{' '}
                                Ofertas
                            </Link>
                        </li>
                    </ul>
                </Navbar>
            </header>

            <div
                className="relative w-full pb-10"

                // className={`relative mx-auto w-full px-4 pt-24 pb-10 sm:px-6 lg:px-8 ${
                //     isShopRoute
                //         ? 'max-w-full 2xl:max-w-[1200px]'
                //         : 'max-w-[1200px]'
                // }`}
            >
                <main>
                    <Outlet />
                </main>
            </div>

            <Footer />
        </div>
    )
}

export default Layout
