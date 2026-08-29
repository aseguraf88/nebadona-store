import { Link } from 'react-router-dom'

const AdminHome = () => {
    // Datos simulados para visualizar el layout.
    // En el futuro, estos vendrán de tu base de datos.
    const stats = {
        salesToday: 45990,
        pendingOrders: 3,
        lowStockItems: 2,
        totalCustomers: 124,
    }

    const formatPrice = (amount) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
        }).format(amount || 0)
    }

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-base-content sm:text-3xl">
                    Centro de Operaciones
                </h1>
                <p className="text-sm text-base-content/60 mt-1">
                    Resumen de tu tienda al día de hoy.
                </p>
            </div>

            {/* --- PILAR 1: KPIs (Tarjetas de métricas rápidas) --- */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {/* Tarjeta Ventas */}
                <div className="card bg-base-100 shadow-sm border border-base-200">
                    <div className="card-body p-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                                Ventas Hoy
                            </h2>
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
                                💰
                            </span>
                        </div>
                        <p className="text-2xl font-black text-base-content mt-2">
                            {formatPrice(stats.salesToday)}
                        </p>
                    </div>
                </div>

                {/* Tarjeta Órdenes Pendientes */}
                <div className="card bg-base-100 shadow-sm border border-base-200">
                    <div className="card-body p-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                                Órdenes Pendientes
                            </h2>
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
                                📦
                            </span>
                        </div>
                        <p className="text-2xl font-black text-base-content mt-2">
                            {stats.pendingOrders}
                        </p>
                        {stats.pendingOrders > 0 && (
                            <div className="mt-2 text-xs text-warning font-semibold">
                                Requieren tu atención
                            </div>
                        )}
                    </div>
                </div>

                {/* Tarjeta Alertas de Inventario */}
                <div className="card bg-base-100 shadow-sm border border-base-200">
                    <div className="card-body p-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                                Stock Crítico
                            </h2>
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-error/10 text-error">
                                ⚠️
                            </span>
                        </div>
                        <p className="text-2xl font-black text-base-content mt-2">
                            {stats.lowStockItems}
                        </p>
                    </div>
                </div>

                {/* Tarjeta Clientes Totales */}
                <div className="card bg-base-100 shadow-sm border border-base-200">
                    <div className="card-body p-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                                Clientes
                            </h2>
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                👥
                            </span>
                        </div>
                        <p className="text-2xl font-black text-base-content mt-2">
                            {stats.totalCustomers}
                        </p>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN INFERIOR: Atajos Rápidos --- */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Tareas Rápidas */}
                <div className="card bg-base-100 shadow-sm border border-base-200">
                    <div className="card-body">
                        <h3 className="text-lg font-bold border-b border-base-200 pb-2 mb-2">
                            Acciones Rápidas
                        </h3>
                        <div className="flex flex-col gap-3 mt-2">
                            <Link
                                to="/admin/dashboard/products"
                                className="btn btn-outline justify-start"
                            >
                                ➕ Añadir Nuevo Producto
                            </Link>
                            <Link
                                to="/admin/dashboard/orders"
                                className="btn btn-outline justify-start"
                            >
                                🚚 Coordinar Entregas
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Últimas Órdenes (Mini-tabla) */}
                <div className="card bg-base-100 shadow-sm border border-base-200">
                    <div className="card-body">
                        <h3 className="text-lg font-bold border-b border-base-200 pb-2 mb-2">
                            Últimas Órdenes
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Folio</th>
                                        <th>Cliente</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="font-mono font-bold">
                                            #ORD-1042
                                        </td>
                                        <td>Juan Pérez</td>
                                        <td>
                                            <span className="badge badge-warning badge-sm">
                                                Pendiente
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="font-mono font-bold">
                                            #ORD-1041
                                        </td>
                                        <td>María Gómez</td>
                                        <td>
                                            <span className="badge badge-success badge-sm">
                                                Entregado
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminHome
