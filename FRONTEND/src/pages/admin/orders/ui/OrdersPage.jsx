import { useState } from 'react'

const OrdersPage = () => {
    // Filtro de estados (simulado)
    const [activeTab, setActiveTab] = useState('pending')

    // Datos simulados
    const orders = [
        {
            id: 'ORD-1042',
            customer: 'Juan Pérez',
            date: '26 Ago 2026',
            total: 45990,
            status: 'pending',
            type: 'delivery',
        },
        {
            id: 'ORD-1041',
            customer: 'María Gómez',
            date: '25 Ago 2026',
            total: 12500,
            status: 'shipped',
            type: 'pickup',
        },
        {
            id: 'ORD-1040',
            customer: 'Carlos Ruiz',
            date: '24 Ago 2026',
            total: 85000,
            status: 'completed',
            type: 'delivery',
        },
    ]

    const formatPrice = (amount) =>
        new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
        }).format(amount)

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-black text-base-content sm:text-3xl">
                        Órdenes de Compra
                    </h1>
                    <p className="text-sm text-base-content/60 mt-1">
                        Gestiona los despachos y retiros de tus clientes.
                    </p>
                </div>
                <div className="join">
                    <input
                        className="join-item input input-bordered w-full max-w-xs"
                        placeholder="Buscar orden o cliente..."
                    />
                    <button className="join-item btn btn-primary">
                        Buscar
                    </button>
                </div>
            </div>

            {/* Pestañas de filtrado */}
            <div className="tabs tabs-boxed bg-base-200/50 mb-6 p-1 inline-flex">
                <button
                    className={`tab ${activeTab === 'all' ? 'tab-active font-bold' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    Todas
                </button>
                <button
                    className={`tab ${activeTab === 'pending' ? 'tab-active font-bold text-warning' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pendientes (1)
                </button>
                <button
                    className={`tab ${activeTab === 'shipped' ? 'tab-active font-bold text-info' : ''}`}
                    onClick={() => setActiveTab('shipped')}
                >
                    Enviadas
                </button>
                <button
                    className={`tab ${activeTab === 'completed' ? 'tab-active font-bold text-success' : ''}`}
                    onClick={() => setActiveTab('completed')}
                >
                    Completadas
                </button>
            </div>

            {/* Tabla de Órdenes */}
            <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table">
                        {/* Cabecera */}
                        <thead className="bg-base-200/50 text-base-content">
                            <tr>
                                <th>Folio</th>
                                <th>Fecha</th>
                                <th>Cliente</th>
                                <th>Entrega</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        {/* Cuerpo */}
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id} className="hover">
                                    <td className="font-mono font-bold text-primary">
                                        {order.id}
                                    </td>
                                    <td className="text-sm text-base-content/70">
                                        {order.date}
                                    </td>
                                    <td className="font-medium">
                                        {order.customer}
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2 text-sm">
                                            {order.type === 'delivery'
                                                ? '🚚 Despacho'
                                                : '📍 Retiro'}
                                        </div>
                                    </td>
                                    <td className="font-bold">
                                        {formatPrice(order.total)}
                                    </td>
                                    <td>
                                        {order.status === 'pending' && (
                                            <span className="badge badge-warning badge-sm font-semibold">
                                                Pendiente
                                            </span>
                                        )}
                                        {order.status === 'shipped' && (
                                            <span className="badge badge-info badge-sm font-semibold">
                                                Enviado
                                            </span>
                                        )}
                                        {order.status === 'completed' && (
                                            <span className="badge badge-success badge-sm font-semibold">
                                                Completado
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <button className="btn btn-ghost btn-xs">
                                            Ver Detalle
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default OrdersPage
