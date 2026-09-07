import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useProduct } from '../../../../entities/product'
import { ConfirmationModal } from '../../../../shared/ui'

const STATUS_FILTERS = [
    { value: 'all', label: 'Todos' },
    { value: 'PUBLISHED', label: 'Publicados' },
    { value: 'DRAFT', label: 'Borradores' },
]

const formatPrice = (amount) =>
    new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
    }).format(amount || 0)

const totalStockOf = (product) =>
    Array.isArray(product.variants)
        ? product.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0)
        : 0

const ProductsListPage = () => {
    const {
        products,
        productsLoading,
        searchQuery,
        setSearchQuery,
        deleteProduct,
    } = useProduct()

    const [statusFilter, setStatusFilter] = useState('all')
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const visibleProducts = useMemo(() => {
        const query = (searchQuery || '').trim().toLowerCase()
        return products.filter((p) => {
            const matchesQuery = !query || p.name?.toLowerCase().includes(query)
            const matchesStatus =
                statusFilter === 'all' || p.status === statusFilter
            return matchesQuery && matchesStatus
        })
    }, [products, searchQuery, statusFilter])

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return
        setIsDeleting(true)
        const result = await deleteProduct(deleteTarget._id)
        setIsDeleting(false)
        setDeleteTarget(null)
        if (result?.success) {
            toast.success(result.message)
        } else {
            toast.error(result?.message || 'No se pudo eliminar el producto.')
        }
    }

    return (
        <div className="flex w-full flex-col gap-6 pb-12">
            <section className="card w-full bg-base-100 shadow-xl border border-base-200">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-b border-base-200 bg-base-200/30 p-4 rounded-t-2xl">
                    <h2 className="text-xl font-black text-base-content">
                        Productos
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                        <Link
                            to="/admin/dashboard/products/settings"
                            className="btn btn-sm btn-ghost"
                        >
                            ⚙️ Categorías / Franquicias / Temas
                        </Link>
                        <Link
                            to="/admin/dashboard/inventory"
                            className="btn btn-sm btn-outline"
                        >
                            📦 Inventario (CSV)
                        </Link>
                        <Link
                            to="/admin/dashboard/products/nuevo"
                            className="btn btn-sm btn-primary"
                        >
                            ➕ Nuevo producto
                        </Link>
                    </div>
                </div>

                <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-base-200">
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        className="input input-bordered input-sm w-full sm:w-64"
                        value={searchQuery || ''}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="flex gap-2">
                        {STATUS_FILTERS.map((f) => (
                            <button
                                key={f.value}
                                type="button"
                                className={`btn btn-sm ${statusFilter === f.value ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setStatusFilter(f.value)}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {productsLoading ? (
                        <div className="flex justify-center py-16">
                            <span className="loading loading-infinity loading-lg text-primary" />
                        </div>
                    ) : visibleProducts.length === 0 ? (
                        <div className="py-16 text-center text-base-content/60">
                            No hay productos que coincidan con la búsqueda.
                        </div>
                    ) : (
                        <table className="table table-sm w-full">
                            <thead className="bg-base-200/50">
                                <tr>
                                    <th></th>
                                    <th>Nombre</th>
                                    <th>Categoría</th>
                                    <th>Precio</th>
                                    <th>Stock total</th>
                                    <th>Estado</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleProducts.map((product) => (
                                    <tr key={product._id}>
                                        <td>
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-base-200" />
                                            )}
                                        </td>
                                        <td className="font-semibold">
                                            {product.name}
                                        </td>
                                        <td className="capitalize">
                                            {product.product_category || '—'}
                                        </td>
                                        <td>{formatPrice(product.price)}</td>
                                        <td>{totalStockOf(product)}</td>
                                        <td>
                                            <span
                                                className={`badge badge-sm ${
                                                    product.status ===
                                                    'PUBLISHED'
                                                        ? 'badge-success'
                                                        : 'badge-warning'
                                                }`}
                                            >
                                                {product.status === 'PUBLISHED'
                                                    ? 'Publicado'
                                                    : 'Borrador'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex gap-2 justify-end">
                                                <Link
                                                    to={`/admin/dashboard/products/${product._id}/editar`}
                                                    className="btn btn-xs btn-outline btn-primary"
                                                >
                                                    Editar
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="btn btn-xs btn-outline btn-error"
                                                    onClick={() =>
                                                        setDeleteTarget(product)
                                                    }
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

            <ConfirmationModal
                open={Boolean(deleteTarget)}
                title="Confirmar eliminación"
                message={`¿Seguro que deseas eliminar "${deleteTarget?.name}"?`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteTarget(null)}
                isConfirming={isDeleting}
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                confirmButtonClass="btn btn-error"
            />
        </div>
    )
}

export default ProductsListPage
