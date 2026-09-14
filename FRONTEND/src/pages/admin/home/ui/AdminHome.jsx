import { Link } from 'react-router-dom'
import { TbTrendingUp, TbTrendingDown } from 'react-icons/tb'

const AdminHome = () => {
    const stats = {
        salesToday: 45990,
        salesCount: 12,
        ticketMedio: 3832,
        totalCustomers: 124,
    }

    const formatPrice = (amount) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
        }).format(amount || 0)
    }

    // Datos estructurados para la columna izquierda
    const kpiCards = [
        {
            title: 'Facturación',
            value: formatPrice(stats.salesToday),
            trend: '+15%',
            isPositive: true,
            active: true, // Para simular el estado seleccionado de Kyte
        },
        {
            title: 'Ventas',
            value: stats.salesCount,
            trend: '+2',
            isPositive: true,
            active: false,
        },
        {
            title: 'Ticket Medio',
            value: formatPrice(stats.ticketMedio),
            trend: '-5%',
            isPositive: false,
            active: false,
        },
        {
            title: 'Clientes Activos',
            value: stats.totalCustomers,
            trend: '+12',
            isPositive: true,
            active: false,
        },
    ]

    return (
        <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-6">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-base-content">
                    Estadísticas
                </h1>
                {/* Selector de fecha simulado tipo Kyte */}
                <div className="flex items-center gap-2 bg-base-100 border border-base-300 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm">
                    <i className="ti ti-calendar text-base-content/50" />
                    Este año: 2026
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                {/* COLUMNA IZQUIERDA: Tarjetas de KPI Verticales */}
                <div className="lg:col-span-1 flex flex-col gap-3">
                    {kpiCards.map((card, idx) => {
                        const TrendIcon = card.isPositive
                            ? TbTrendingUp
                            : TbTrendingDown
                        return (
                            <div
                                key={idx}
                                className={`card bg-base-100 border cursor-pointer transition-all ${
                                    card.active
                                        ? 'border-l-4 border-l-primary border-y-base-200 border-r-base-200 shadow-sm'
                                        : 'border-base-200 hover:border-base-300'
                                }`}
                            >
                                <div className="card-body p-4">
                                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1">
                                        {card.title}
                                    </span>
                                    <div className="flex items-end justify-between">
                                        <span
                                            className={`text-2xl font-black ${card.active ? 'text-primary' : 'text-base-content'}`}
                                        >
                                            {card.value}
                                        </span>
                                        <span
                                            className={`text-xs font-bold flex items-center gap-1 ${card.isPositive ? 'text-success' : 'text-error'}`}
                                        >
                                            <TrendIcon className="text-base" />
                                            {card.trend}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* COLUMNA DERECHA: Gráfico y Datos Detallados */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    {/* Tarjeta de Gráfico (Placeholder) */}
                    <div className="card bg-base-100 border border-base-200 shadow-sm">
                        <div className="card-body p-0">
                            {/* Tabs del gráfico */}
                            <div className="flex border-b border-base-200 px-6 pt-4 gap-6 text-sm font-bold text-base-content/50 uppercase tracking-wider">
                                <div className="pb-3 border-b-2 border-primary text-primary cursor-pointer">
                                    Hora
                                </div>
                                <div className="pb-3 hover:text-base-content cursor-pointer transition-colors">
                                    Día
                                </div>
                                <div className="pb-3 hover:text-base-content cursor-pointer transition-colors">
                                    Mes
                                </div>
                            </div>

                            {/* Simulación del área del gráfico */}
                            <div className="h-64 w-full flex items-center justify-center bg-base-100/50">
                                <div className="text-center text-base-content/40 flex flex-col items-center gap-2">
                                    <i className="ti ti-chart-line text-4xl" />
                                    <span className="text-sm font-medium">
                                        El gráfico de {kpiCards[0].title} se
                                        renderizará aquí
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de Detalle */}
                    <div className="card bg-base-100 border border-base-200 shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="table table-zebra table-sm w-full">
                                <thead>
                                    <tr className="bg-base-200/50 text-base-content/60 text-xs uppercase tracking-wider">
                                        <th className="py-3 px-6">Hora</th>
                                        <th className="py-3 px-6">
                                            Facturación
                                        </th>
                                        <th className="py-3 px-6">Ventas</th>
                                        <th className="py-3 px-6">
                                            Ticket Medio
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="py-3 px-6 text-error font-bold">
                                            10:00
                                        </td>
                                        <td className="py-3 px-6 text-error font-medium">
                                            $ 0
                                        </td>
                                        <td className="py-3 px-6 text-error font-medium">
                                            0
                                        </td>
                                        <td className="py-3 px-6 text-error font-medium">
                                            $ 0
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-6 font-bold text-base-content/70">
                                            11:00
                                        </td>
                                        <td className="py-3 px-6 font-medium">
                                            $ 14.990
                                        </td>
                                        <td className="py-3 px-6 font-medium">
                                            1
                                        </td>
                                        <td className="py-3 px-6 font-medium">
                                            $ 14.990
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-6 text-success font-bold">
                                            12:00
                                        </td>
                                        <td className="py-3 px-6 text-success font-medium">
                                            $ 31.000
                                        </td>
                                        <td className="py-3 px-6 text-success font-medium">
                                            11
                                        </td>
                                        <td className="py-3 px-6 text-success font-medium">
                                            $ 2.818
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
