const CustomersPage = () => {
    // Datos simulados de clientes
    const customers = [
        {
            id: 1,
            name: 'Juan Pérez',
            phone: '+56 9 1234 5678',
            email: 'juan@mail.com',
            totalOrders: 4,
            totalSpent: 125000,
            lastOrder: '26 Ago 2026',
        },
        {
            id: 2,
            name: 'María Gómez',
            phone: '+56 9 8765 4321',
            email: 'maria@mail.com',
            totalOrders: 1,
            totalSpent: 12500,
            lastOrder: '25 Ago 2026',
        },
        {
            id: 3,
            name: 'Carlos Ruiz',
            phone: '+56 9 5555 6666',
            email: '-',
            totalOrders: 2,
            totalSpent: 85000,
            lastOrder: '24 Ago 2026',
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
                        Base de Clientes
                    </h1>
                    <p className="text-sm text-base-content/60 mt-1">
                        Conoce a tus mejores compradores y mantén su contacto.
                    </p>
                </div>
                <button className="btn btn-outline btn-sm">
                    📥 Exportar a Excel
                </button>
            </div>

            <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead className="bg-base-200/50 text-base-content">
                            <tr>
                                <th>Cliente</th>
                                <th>Contacto</th>
                                <th>Órdenes</th>
                                <th>Total Gastado</th>
                                <th>Última Compra</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer) => (
                                <tr key={customer.id} className="hover">
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar placeholder">
                                                <div className="bg-primary text-neutral-content rounded-full w-10">
                                                    <span>
                                                        {customer.name.charAt(
                                                            0,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="font-bold">
                                                {customer.name}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-sm">
                                            {customer.phone}
                                        </div>
                                        <div className="text-xs text-base-content/60">
                                            {customer.email}
                                        </div>
                                    </td>
                                    <td className="font-medium text-center">
                                        {customer.totalOrders}
                                    </td>
                                    <td className="font-bold text-success">
                                        {formatPrice(customer.totalSpent)}
                                    </td>
                                    <td className="text-sm text-base-content/70">
                                        {customer.lastOrder}
                                    </td>
                                    <td>
                                        <button className="btn btn-ghost btn-xs text-primary">
                                            Chat WhatsApp
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

export default CustomersPage
