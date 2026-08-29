import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'

const AdminLayout = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const location = useLocation()

    // Pequeña función para saber en qué página estamos y pintar el menú
    const isActive = (path) => {
        if (
            path === '/admin/dashboard' &&
            location.pathname === '/admin/dashboard'
        )
            return true
        if (path !== '/admin/dashboard' && location.pathname.includes(path))
            return true
        return false
    }

    return (
        <div className="drawer lg:drawer-open min-h-screen bg-base-200">
            {/* Input oculto para móvil (Controla el estado global) */}
            <input
                id="admin-global-drawer"
                type="checkbox"
                className="drawer-toggle"
                checked={isDrawerOpen}
                onChange={(e) => setIsDrawerOpen(e.target.checked)}
            />

            {/* CONTENIDO CENTRAL DINÁMICO */}
            <div className="drawer-content flex flex-col">
                {/* 🔥 CABECERA MÓVIL ESTILO APP NATIVA (Solo celulares) */}
                <div className="sticky top-0 z-30 flex items-center justify-between bg-base-100 px-4 py-3 shadow-sm lg:hidden border-b border-base-200">
                    {/* IZQUIERDA: Logo y Título */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-black shadow-md text-lg">
                            N
                        </div>
                        <h1 className="text-xl font-black text-base-content tracking-tight">
                            Admin
                        </h1>
                    </div>

                    {/* DERECHA: Menú Sándwich Minimalista */}
                    <label
                        htmlFor="admin-global-drawer"
                        className="btn btn-square btn-ghost drawer-button"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="inline-block w-6 h-6 stroke-current text-base-content"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            ></path>
                        </svg>
                    </label>
                </div>

                {/* AQUÍ OCURRE LA MAGIA: <Outlet /> inyecta la página */}
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </div>

            {/* BARRA LATERAL MAESTRA */}
            <aside className="drawer-side z-40">
                {/* 🔥 EL OVERLAY MÁGICO (Sin onClick, HTML hace la magia) */}
                <label
                    htmlFor="admin-global-drawer"
                    aria-label="close sidebar"
                    className="drawer-overlay"
                ></label>

                <div className="flex h-full w-64 flex-col border-r border-base-300 bg-base-100 px-4 py-6 shadow-xl lg:shadow-none">
                    {/* Logo de tu tienda */}
                    <div className="mb-8 flex flex-col items-center border-b border-base-200 pb-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-3xl font-black text-white shadow-md">
                            N
                        </div>
                        <span className="mt-3 text-xs font-bold uppercase tracking-widest text-base-content/60">
                            Nebadona Store
                        </span>
                    </div>

                    {/* Navegación Global */}
                    <ul className="menu gap-2 p-0 flex-1 text-base-content font-medium">
                        <li>
                            <Link
                                to="/admin/dashboard"
                                onClick={() => setIsDrawerOpen(false)}
                                className={
                                    isActive('/admin/dashboard')
                                        ? 'active bg-primary/10 text-primary font-bold'
                                        : 'hover:bg-base-200'
                                }
                            >
                                🏠 Centro de Operaciones
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/admin/dashboard/orders"
                                onClick={() => setIsDrawerOpen(false)}
                                className={
                                    isActive('/admin/dashboard/orders')
                                        ? 'active bg-primary/10 text-primary font-bold'
                                        : 'hover:bg-base-200'
                                }
                            >
                                📦 Órdenes de Compra
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/admin/dashboard/products"
                                onClick={() => setIsDrawerOpen(false)}
                                className={
                                    isActive('/admin/dashboard/products')
                                        ? 'active bg-primary/10 text-primary font-bold'
                                        : 'hover:bg-base-200'
                                }
                            >
                                🏷️ Catálogo de Productos
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/admin/dashboard/customers"
                                onClick={() => setIsDrawerOpen(false)}
                                className={
                                    isActive('/admin/dashboard/customers')
                                        ? 'active bg-primary/10 text-primary font-bold'
                                        : 'hover:bg-base-200'
                                }
                            >
                                👥 Clientes y CRM
                            </Link>
                        </li>
                    </ul>

                    {/* Volver al mundo real */}
                    <div className="mt-auto pt-6 border-t border-base-200">
                        <Link
                            to="/"
                            className="btn btn-ghost w-full justify-start gap-3 text-base-content/70 hover:text-primary transition-colors"
                        >
                            <span className="ti ti-arrow-left text-lg" />
                            Ver Tienda Pública
                        </Link>
                    </div>
                </div>
            </aside>
        </div>
    )
}

export default AdminLayout
