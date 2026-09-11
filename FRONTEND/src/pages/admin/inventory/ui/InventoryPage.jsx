import { useMemo, useState } from 'react'
import { useProduct } from '../../../../entities/product'
import { CsvImportModal } from '../../../../features/products'

const InventoryPage = () => {
    const { products, productsLoading, getProducts } = useProduct()
    const [isCsvModalOpen, setIsCsvModalOpen] = useState(false)
    const [query, setQuery] = useState('')

    const variantRows = useMemo(() => {
        const rows = []
        products.forEach((product) => {
            const variants =
                Array.isArray(product.variants) && product.variants.length > 0
                    ? product.variants
                    : [{}]
            variants.forEach((v) => {
                rows.push({
                    productId: product._id,
                    productName: product.name,
                    handle: product.handle,
                    sku: v.sku || '—',
                    size: v.size || '—',
                    baseColor: v.baseColor || '—',
                    stock: Number(v.stock || 0),
                })
            })
        })
        return rows
    }, [products])

    const filteredRows = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return variantRows
        return variantRows.filter(
            (row) =>
                row.productName?.toLowerCase().includes(q) ||
                row.sku?.toLowerCase().includes(q) ||
                row.handle?.toLowerCase().includes(q),
        )
    }, [variantRows, query])

    const lowStockCount = variantRows.filter((r) => r.stock <= 3).length

    return (
        <div className="flex w-full flex-col gap-6 pb-12">
            <section className="card w-full bg-base-100 shadow-xl border border-base-200">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-b border-base-200 bg-base-200/30 p-4 rounded-t-2xl">
                    <h2 className="text-xl font-black text-base-content">
                        Inventario
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            onClick={() => setIsCsvModalOpen(true)}
                        >
                            <i className="ti ti-file-upload text-base" />
                            Importar CSV
                        </button>
                        <a
                            href={`${import.meta.env.VITE_BACKEND_URL}products/export/csv`}
                            download="inventario_nebadona.csv"
                            className="btn btn-sm btn-outline btn-success"
                        >
                            <i className="ti ti-file-download text-base" />
                            Exportar CSV
                        </a>
                    </div>
                </div>

                {lowStockCount > 0 && (
                    <div className="alert alert-warning m-4 py-2 text-sm">
                        ⚠️ {lowStockCount} variante(s) con 3 unidades o menos de
                        stock.
                    </div>
                )}

                <div className="p-4 border-b border-base-200">
                    <input
                        type="text"
                        placeholder="Buscar por producto, SKU o handle..."
                        className="input input-bordered input-sm w-full sm:w-72"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    {productsLoading ? (
                        <div className="flex justify-center py-16">
                            <span className="loading loading-infinity loading-lg text-primary" />
                        </div>
                    ) : filteredRows.length === 0 ? (
                        <div className="py-16 text-center text-base-content/60">
                            No hay variantes que coincidan con la búsqueda.
                        </div>
                    ) : (
                        <table className="table table-sm w-full">
                            <thead className="bg-base-200/50">
                                <tr>
                                    <th>Handle</th>
                                    <th>Producto</th>
                                    <th>SKU</th>
                                    <th>Talla</th>
                                    <th>Color</th>
                                    <th>Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRows.map((row, idx) => (
                                    <tr key={`${row.productId}-${idx}`}>
                                        <td className="font-mono text-xs">
                                            {row.handle || '—'}
                                        </td>
                                        <td>{row.productName}</td>
                                        <td className="font-mono text-xs">
                                            {row.sku}
                                        </td>
                                        <td>{row.size}</td>
                                        <td className="capitalize">
                                            {row.baseColor}
                                        </td>
                                        <td
                                            className={
                                                row.stock <= 3
                                                    ? 'text-error font-bold'
                                                    : ''
                                            }
                                        >
                                            {row.stock}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

            <CsvImportModal
                open={isCsvModalOpen}
                onClose={() => setIsCsvModalOpen(false)}
                onSuccess={() => {
                    setIsCsvModalOpen(false)
                    if (getProducts) getProducts()
                }}
            />
        </div>
    )
}

export default InventoryPage
