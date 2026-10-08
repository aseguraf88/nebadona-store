import { useEffect, useState } from 'react'
import { getOrdersSummary } from '../../../../entities/order'
import { useProduct } from '../../../../entities/product'

const formatPrice = (amount) =>
    new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
    }).format(amount)

// Ventas = órdenes aprobadas, contadas según la fecha del pedido en hora de
// Chile (GET /api/orders/summary). Los montos salen de totalAmount, que no
// incluye el envío. Ticket medio null (sin ventas) se muestra como "—"
const SALES_CARDS = [
    {
        title: 'Facturación',
        note: 'Sin envío.',
        format: (totals) => formatPrice(totals.revenue),
    },
    {
        title: 'Ventas',
        format: (totals) => totals.count,
    },
    {
        title: 'Ticket medio',
        note: 'Sin envío.',
        format: (totals) =>
            totals.avgTicket === null ? '—' : formatPrice(totals.avgTicket),
    },
]

const PERIODS = [
    { key: 'today', label: 'Hoy' },
    { key: 'month', label: 'Este mes' },
]

const cardClass = 'card bg-base-100 border border-base-200 shadow-sm'
const titleClass =
    'text-xs font-bold uppercase tracking-wider text-base-content/50'
const noteClass = 'text-xs text-base-content/50'

const Loading = () => (
    <span className="loading loading-dots loading-sm" aria-label="Cargando" />
)

const AdminHome = () => {
    const { adminProducts, adminProductsLoading } = useProduct()
    const [summary, setSummary] = useState(null)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(null)

    // Se pide al entrar al inicio: después de aprobar o cancelar una orden,
    // los números cambian al volver a esta pantalla
    const fetchSummary = async () => {
        setLoading(true)
        setLoadError(null)
        try {
            const data = await getOrdersSummary()
            setSummary(data)
        } catch (error) {
            setSummary(null)
            setLoadError(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSummary()
    }, [])

    // Mismo criterio que la tienda (GET /api/products y /shop): solo
    // PUBLISHED. adminProducts lo carga AdminLayout al entrar al dashboard
    const publishedCount = adminProducts.filter(
        (product) => product.status === 'PUBLISHED',
    ).length

    return (
        <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-base-content">
                Estadísticas
            </h1>

            {loadError && (
                <div className="alert alert-error justify-between">
                    <span>{loadError}</span>
                    <button className="btn btn-sm" onClick={fetchSummary}>
                        Reintentar
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {!loadError &&
                    SALES_CARDS.map((card) => (
                        <div key={card.title} className={cardClass}>
                            <div className="card-body p-4 gap-3">
                                <span className={titleClass}>{card.title}</span>
                                <dl className="flex flex-col gap-2">
                                    {PERIODS.map((period) => (
                                        <div
                                            key={period.key}
                                            className="flex items-baseline justify-between gap-4"
                                        >
                                            <dt className="text-sm text-base-content/70">
                                                {period.label}
                                            </dt>
                                            <dd className="text-2xl font-black text-base-content">
                                                {loading ? (
                                                    <Loading />
                                                ) : (
                                                    card.format(summary[period.key])
                                                )}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                                <p className={noteClass}>
                                    {card.note ? `${card.note} ` : ''}
                                    Órdenes aprobadas, según la fecha del pedido.
                                </p>
                            </div>
                        </div>
                    ))}

                {!loadError && (
                    <div className={cardClass}>
                        <div className="card-body p-4 gap-3">
                            <span className={titleClass}>Pedidos por revisar</span>
                            <span className="text-2xl font-black text-base-content">
                                {loading ? <Loading /> : summary.pendingReview}
                            </span>
                            <p className={noteClass}>
                                Sin aprobar ni cancelar, de cualquier fecha.
                            </p>
                        </div>
                    </div>
                )}

                <div className={cardClass}>
                    <div className="card-body p-4 gap-3">
                        <span className={titleClass}>Productos publicados</span>
                        <span className="text-2xl font-black text-base-content">
                            {adminProductsLoading ? <Loading /> : publishedCount}
                        </span>
                        <p className={noteClass}>Los que se ven en la tienda.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminHome
