import { useState, useEffect, useMemo, Fragment } from 'react'
import toast from 'react-hot-toast'
import { getOrders, updateOrderStatus } from '../../../../entities/order'
import { useProduct } from '../../../../entities/product'

// Metadata de los estados reales del backend (OrderModel).
// 'shipped' y 'completed' NO existen en el schema real — eran de la maqueta vieja.
const STATUS_META = {
    whatsapp_pending: {
        label: 'WhatsApp pendiente',
        badge: 'badge-warning badge-outline',
    },
    pending: { label: 'Pendiente', badge: 'badge-warning' },
    in_process: { label: 'En proceso', badge: 'badge-info' },
    approved: { label: 'Aprobada', badge: 'badge-success' },
    rejected: { label: 'Rechazada', badge: 'badge-error' },
    cancelled: { label: 'Cancelada', badge: 'badge-neutral' },
}

const STATUS_ORDER = [
    'whatsapp_pending',
    'pending',
    'in_process',
    'approved',
    'rejected',
    'cancelled',
]

const formatPrice = (amount) =>
    new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
    }).format(amount)

const formatDate = (isoString) =>
    new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(isoString))

const getCustomerName = (order) => {
    const name =
        `${order.shippingInfo?.firstName ?? ''} ${order.shippingInfo?.lastName ?? ''}`.trim()
    return name || order.shippingInfo?.phone || 'Sin nombre'
}

// Entrar a 'approved' descuenta stock. Salir de 'approved' lo restaura.
// Cualquier otro cambio de estado no toca stock.
const getStockWarning = (currentStatus, newStatus) => {
    if (currentStatus === newStatus) return null
    if (newStatus === 'approved') {
        return 'Este cambio va a DESCONTAR el stock de las variantes de esta orden.'
    }
    if (currentStatus === 'approved') {
        return 'Este cambio va a RESTAURAR el stock de las variantes de esta orden.'
    }
    return null
}

const OrdersPage = () => {
    const { getProducts } = useProduct()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(null)

    const [activeTab, setActiveTab] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [expandedOrderId, setExpandedOrderId] = useState(null)

    // Orden pendiente de confirmar: { order, newStatus }
    const [pendingChange, setPendingChange] = useState(null)
    const [confirming, setConfirming] = useState(false)

    const fetchOrders = async () => {
        setLoading(true)
        setLoadError(null)
        try {
            const data = await getOrders()
            setOrders(data.orders || [])
        } catch (error) {
            setLoadError(error.message)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const tabCounts = useMemo(() => {
        const counts = { all: orders.length }
        STATUS_ORDER.forEach((status) => {
            counts[status] = orders.filter((o) => o.status === status).length
        })
        return counts
    }, [orders])

    const filteredOrders = useMemo(() => {
        const term = searchTerm.trim().toLowerCase()
        return orders.filter((order) => {
            const matchesTab = activeTab === 'all' || order.status === activeTab
            if (!matchesTab) return false
            if (!term) return true
            const folio = String(order.orderNumber).toLowerCase()
            const customer = getCustomerName(order).toLowerCase()
            const phone = (order.shippingInfo?.phone || '').toLowerCase()
            return (
                folio.includes(term) ||
                customer.includes(term) ||
                phone.includes(term)
            )
        })
    }, [orders, activeTab, searchTerm])

    const handleStatusSelect = (order, newStatus) => {
        if (newStatus === order.status) return
        setPendingChange({ order, newStatus })
    }

    const closeModal = () => {
        if (confirming) return
        setPendingChange(null)
    }

    const confirmStatusChange = async () => {
        if (!pendingChange) return
        const { order, newStatus } = pendingChange
        setConfirming(true)
        try {
            const response = await updateOrderStatus(order._id, newStatus)
            toast.success(`Orden #ORD-${order.orderNumber} actualizada`)
            // El shape exacto de warnings (ej. stock quedando en negativo) no está
            // confirmado todavía — se lee de forma defensiva, sin romper si no viene.
            response?.warnings?.forEach((w) => toast(w, { icon: '⚠️' }))
            setPendingChange(null)
            await fetchOrders()
            await getProducts()
        } catch (error) {
            toast.error(error.message)
        } finally {
            setConfirming(false)
        }
    }

    const toggleExpanded = (orderId) => {
        setExpandedOrderId((current) => (current === orderId ? null : orderId))
    }

    const stockWarning = pendingChange
        ? getStockWarning(pendingChange.order.status, pendingChange.newStatus)
        : null

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
                <input
                    className="input input-bordered w-full max-w-xs"
                    placeholder="Buscar por folio, cliente o teléfono..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Pestañas de filtrado */}
            <div className="tabs tabs-boxed bg-base-200/50 mb-6 p-1 inline-flex flex-wrap">
                <button
                    className={`tab ${activeTab === 'all' ? 'tab-active font-bold' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    Todas ({tabCounts.all})
                </button>
                {STATUS_ORDER.map((status) => (
                    <button
                        key={status}
                        className={`tab ${activeTab === status ? 'tab-active font-bold' : ''}`}
                        onClick={() => setActiveTab(status)}
                    >
                        {STATUS_META[status].label} ({tabCounts[status]})
                    </button>
                ))}
            </div>

            {/* Tabla de Órdenes */}
            <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table">
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
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={7} className="text-center py-8">
                                        <span className="loading loading-spinner loading-md" />
                                    </td>
                                </tr>
                            )}

                            {!loading && loadError && (
                                <tr>
                                    <td colSpan={7} className="py-8">
                                        <div className="alert alert-error justify-between">
                                            <span>{loadError}</span>
                                            <button
                                                className="btn btn-sm"
                                                onClick={fetchOrders}
                                            >
                                                Reintentar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!loading && !loadError && filteredOrders.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="text-center py-8 text-base-content/60"
                                    >
                                        No hay órdenes que coincidan.
                                    </td>
                                </tr>
                            )}

                            {!loading &&
                                !loadError &&
                                filteredOrders.map((order) => (
                                    <Fragment key={order._id}>
                                        <tr key={order._id} className="hover">
                                            <td className="font-mono font-bold text-primary">
                                                #ORD-{order.orderNumber}
                                            </td>
                                            <td className="text-sm text-base-content/70">
                                                {formatDate(order.createdAt)}
                                            </td>
                                            <td className="font-medium">
                                                {getCustomerName(order)}
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2 text-sm">
                                                    {order.deliveryType === 'delivery'
                                                        ? '🚚 Despacho'
                                                        : '📍 Retiro'}
                                                </div>
                                            </td>
                                            <td className="font-bold">
                                                {formatPrice(order.totalAmount)}
                                            </td>
                                            <td>
                                                <select
                                                    className="select select-bordered select-sm"
                                                    value={order.status}
                                                    onChange={(e) =>
                                                        handleStatusSelect(
                                                            order,
                                                            e.target.value,
                                                        )
                                                    }
                                                >
                                                    {STATUS_ORDER.map((status) => (
                                                        <option
                                                            key={status}
                                                            value={status}
                                                        >
                                                            {STATUS_META[status].label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-ghost btn-xs"
                                                    onClick={() =>
                                                        toggleExpanded(order._id)
                                                    }
                                                >
                                                    {expandedOrderId === order._id
                                                        ? 'Ocultar'
                                                        : 'Ver Detalle'}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedOrderId === order._id && (
                                            <tr key={`${order._id}-detail`}>
                                                <td
                                                    colSpan={7}
                                                    className="bg-base-200/30"
                                                >
                                                    <div className="flex flex-col gap-2 py-2">
                                                        {order.products.map(
                                                            (item) => (
                                                                <div
                                                                    key={item._id}
                                                                    className="flex items-center gap-3 text-sm"
                                                                >
                                                                    <img
                                                                        src={
                                                                            item.imageUrl
                                                                        }
                                                                        alt={
                                                                            item.name
                                                                        }
                                                                        className="w-10 h-10 rounded object-cover"
                                                                    />
                                                                    <span className="font-medium">
                                                                        {item.name}
                                                                    </span>
                                                                    <span className="font-mono text-xs text-base-content/60">
                                                                        {item.sku}
                                                                    </span>
                                                                    <span className="badge badge-sm">
                                                                        {item.size ||
                                                                            'Sin talla'}
                                                                    </span>
                                                                    <span className="badge badge-sm">
                                                                        {item.baseColor ||
                                                                            'Sin color'}
                                                                    </span>
                                                                    <span className="text-base-content/60">
                                                                        x{item.quantity}
                                                                    </span>
                                                                    <span className="ml-auto font-semibold">
                                                                        {formatPrice(
                                                                            item.price *
                                                                                item.quantity,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de confirmación de cambio de estado */}
            {pendingChange && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">
                            Confirmar cambio de estado
                        </h3>
                        <p className="py-2 text-sm text-base-content/70">
                            Orden #ORD-{pendingChange.order.orderNumber}:{' '}
                            {STATUS_META[pendingChange.order.status].label} →{' '}
                            {STATUS_META[pendingChange.newStatus].label}
                        </p>
                        {stockWarning ? (
                            <div className="alert alert-warning text-sm">
                                {stockWarning}
                            </div>
                        ) : (
                            <p className="text-sm text-base-content/60">
                                Este cambio no afecta el stock.
                            </p>
                        )}
                        <div className="modal-action">
                            <button
                                className="btn btn-ghost"
                                onClick={closeModal}
                                disabled={confirming}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={confirmStatusChange}
                                disabled={confirming}
                            >
                                {confirming ? (
                                    <span className="loading loading-spinner loading-xs" />
                                ) : (
                                    'Confirmar'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrdersPage
