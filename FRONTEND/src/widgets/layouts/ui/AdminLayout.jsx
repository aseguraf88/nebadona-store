import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
    TbMenu2,
    TbChartBar,
    TbShoppingBag,
    TbBox,
    TbPackages,
    TbUsers,
    TbSettings,
    TbLogout,
    TbExternalLink,
} from 'react-icons/tb'

const AdminLayout = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const location = useLocation()

    const navigationGroups = [
        {
            title: 'Principal',
            items: [
                {
                    name: 'Estadísticas',
                    path: '/admin/dashboard',
                    icon: TbChartBar,
                },
                {
                    name: 'Órdenes',
                    path: '/admin/dashboard/orders',
                    icon: TbShoppingBag,
                },
            ],
        },
        {
            title: 'Gestión',
            items: [
                {
                    name: 'Productos',
                    path: '/admin/dashboard/products',
                    icon: TbBox,
                },
                {
                    name: 'Inventario',
                    path: '/admin/dashboard/inventory',
                    icon: TbPackages,
                },
                {
                    name: 'Clientes',
                    path: '/admin/dashboard/customers',
                    icon: TbUsers,
                },
                {
                    name: 'Configuración',
                    path: '/admin/dashboard/products/settings',
                    icon: TbSettings,
                },
            ],
        },
    ]

    const allNavPaths = navigationGroups.flatMap((group) =>
        group.items.map((item) => item.path)
    )

    // Gana el path más específico que matchee la URL actual, así una ruta
    // anidada (ej. /products/settings) no activa también a su padre (/products).
    const isActive = (path) => {
        const bestMatch = allNavPaths
            .filter(
                (p) =>
                    location.pathname === p ||
                    (p !== '/admin/dashboard' &&
                        location.pathname.startsWith(`${p}/`))
            )
            .reduce(
                (longest, p) => (p.length > longest.length ? p : longest),
                ''
            )
        return path === bestMatch
    }

    return (
        <div className="drawer lg:drawer-open bg-base-200 min-h-screen font-sans">
            <input
                id="admin-global-drawer"
                type="checkbox"
                className="drawer-toggle"
                checked={isDrawerOpen}
                onChange={(e) => setIsDrawerOpen(e.target.checked)}
            />

            {/* CONTENIDO DERECHO (Topbar + Outlet) */}
            <div className="drawer-content flex flex-col h-screen overflow-hidden">
                {/* 1. TOPBAR HORIZONTAL */}
                <header className="w-full bg-base-100 border-b border-base-200 flex items-center justify-between lg:justify-end px-4 py-2 shrink-0 z-20 h-16">
                    {/* Botón menú móvil (Solo visible en pantallas pequeñas) */}
                    <label
                        htmlFor="admin-global-drawer"
                        className="btn btn-square btn-ghost lg:hidden"
                    >
                        <TbMenu2 className="text-2xl text-base-content" />
                    </label>

                    {/* Menú de Usuario (Extremo derecho) */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-base-content/70 hidden sm:block">
                            Ayuda
                        </span>
                        <div className="dropdown dropdown-end">
                            <label
                                tabIndex={0}
                                className="btn btn-ghost btn-circle avatar border border-base-300 shadow-sm"
                            >
                                <div className="w-9 rounded-full bg-neutral text-neutral-content flex items-center justify-center">
                                    <span className="text-sm font-bold">
                                        NS
                                    </span>
                                </div>
                            </label>
                            <ul
                                tabIndex={0}
                                className="mt-3 z-[1] p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-48 border border-base-200"
                            >
                                <li>
                                    <a className="py-3">
                                        <TbSettings className="text-lg opacity-70" />
                                        Configuración
                                    </a>
                                </li>
                                <li>
                                    <a className="py-3 text-error">
                                        <TbLogout className="text-lg" />
                                        Cerrar Sesión
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </header>

                {/* 2. ÁREA DE TRABAJO DINÁMICA */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>

            {/* BARRA LATERAL IZQUIERDA (Estilo Kyte - Oscura) */}
            <aside className="drawer-side z-40">
                <label
                    htmlFor="admin-global-drawer"
                    className="drawer-overlay"
                />

                <div className="flex h-full w-64 flex-col bg-slate-900 text-slate-300 border-r border-slate-800">
                    {/* Logo Area */}
                    <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800 shrink-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-content font-bold">
                            N
                        </div>
                        <span className="font-bold text-white tracking-wide">
                            Nebadon
                        </span>
                    </div>

                    {/* Navegación */}
                    <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-8">
                        {navigationGroups.map((group, groupIndex) => (
                            <div key={groupIndex}>
                                <h2 className="px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                                    {group.title}
                                </h2>
                                <ul className="flex flex-col gap-1 px-3">
                                    {group.items.map((item, itemIndex) => {
                                        const active = isActive(item.path)
                                        return (
                                            <li key={itemIndex}>
                                                <Link
                                                    to={item.path}
                                                    onClick={() =>
                                                        setIsDrawerOpen(false)
                                                    }
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                                        active
                                                            ? 'bg-primary/10 text-primary border-l-2 border-primary rounded-l-none'
                                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                                    }`}
                                                >
                                                    <item.icon
                                                        className={`text-xl ${active ? 'text-primary' : 'opacity-70'}`}
                                                    />
                                                    {item.name}
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        ))}
                    </nav>

                    {/* Footer del Sidebar */}
                    <div className="p-4 border-t border-slate-800 shrink-0">
                        <Link
                            to="/"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                        >
                            <TbExternalLink className="text-xl opacity-70" />
                            Tienda Pública
                        </Link>
                    </div>
                </div>
            </aside>
        </div>
    )
}

export default AdminLayout
