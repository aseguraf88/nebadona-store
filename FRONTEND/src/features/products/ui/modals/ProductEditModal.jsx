const ProductEditModal = ({
    open,
    editSearch,
    setEditSearch,
    productsLoading,
    filteredProducts,
    handleSelectProduct,
    onClose,
}) => {
    if (!open) return null

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-2xl">
                <h3 className="text-lg font-bold">Editar producto</h3>
                <input
                    value={editSearch}
                    onChange={(event) => setEditSearch(event.target.value)}
                    placeholder="Buscar producto..."
                    className="input input-bordered mt-3 w-full"
                />

                <div className="mt-4 max-h-72 overflow-y-auto rounded-box border border-base-300 bg-base-100">
                    {productsLoading ? (
                        <div className="p-4 text-center">
                            <span className="loading loading-spinner" />
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <p className="p-4 text-sm text-base-content/70">
                            No se encontraron productos.
                        </p>
                    ) : (
                        <ul className="menu p-2">
                            {filteredProducts.map((product) => (
                                <li key={product._id}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectProduct(product)}
                                    >
                                        {product.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="modal-action">
                    <button
                        type="button"
                        className="btn"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </dialog>
    )
}

export default ProductEditModal
