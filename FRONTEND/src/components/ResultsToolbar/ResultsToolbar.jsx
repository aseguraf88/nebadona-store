const ResultsToolbar = ({ totalProducts, onSortChange }) => {
    return (
        <div className="flex flex-row justify-between items-center mb-6 pb-4 border-b border-base-300">
            {/* Lado izquierdo: Contador */}
            <span className="text-sm font-medium text-base-content/70">
                Mostrando {totalProducts} productos
            </span>

            {/* Lado derecho: Selector de orden */}
            <div className="flex items-center gap-3">
                <label
                    htmlFor="sort-select"
                    className="hidden sm:block text-sm text-base-content/70"
                >
                    Ordenar por:
                </label>
                <select
                    id="sort-select"
                    className="select select-bordered select-sm w-40 bg-base-200"
                    onChange={(e) => onSortChange(e.target.value)}
                    defaultValue="relevant"
                >
                    <option value="relevant">Relevancia</option>
                    <option value="price-asc">Menor Precio</option>
                    <option value="price-desc">Mayor Precio</option>
                    <option value="newest">Lo más nuevo</option>
                </select>
            </div>
        </div>
    )
}

export default ResultsToolbar
