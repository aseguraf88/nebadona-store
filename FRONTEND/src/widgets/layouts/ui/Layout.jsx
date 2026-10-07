import { Outlet, useLocation } from 'react-router-dom'
import { Navbar, ThemeMenu } from '../../header'
import { Footer } from '../../footer'
import { WhatsAppFloatingButton } from '../../../shared/ui'

const Layout = () => {
    const location = useLocation()

    const isShopRoute = location.pathname.startsWith('/shop')
    // En el checkout la acción principal ya es WhatsApp: un segundo botón
    // podría hacer que el cliente escriba sin generar la orden
    const isCheckoutRoute = location.pathname.startsWith('/checkout')

    return (
        <div className="min-h-screen bg-base-100">
            <header className="sticky top-0 z-50 w-full flex flex-col">
                <div className="bg-error/90 py-2 text-xs md:text-sm font-bold uppercase tracking-widest text-primary-content overflow-hidden flex items-center">
                    {/* El texto que se mueve */}
                    <div className="animate-marquee whitespace-nowrap inline-block w-full">
                        🎉🎉🎉 GRAN APERTURA GRAN 🎉🎉🎉 COMPRA POR WHATSAPP ·
                        ENVÍOS A TODO CHILE - CATÁLOGO COMPLETO DE
                        CALCETAS Y ACCESORIOS - ANIME - VIDEOJUEGOS - CARTOONS -
                        CINE Y TERROR - MÚSICA - DISEÑOS ORIGINALES - ❤️ 🔥 🧦 🔥 🧦
                        🔥 👣 🎁 🛍️ 🎁 🛍️ ❤️
                    </div>
                </div>
                <Navbar>
                    {/* Temáticas con productos publicados (sin "Lo Nuevo" ni "Ofertas") */}
                    <ThemeMenu />
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

            {!isCheckoutRoute && <WhatsAppFloatingButton />}
        </div>
    )
}

export default Layout
