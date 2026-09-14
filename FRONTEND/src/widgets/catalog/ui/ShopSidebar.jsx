const ShopSidebar = ({
    franchiseNames,
    productCategories,
    availableSockTypes,
    selectedFranchises,
    selectedTypes,
    selectedCategories,
    toggleFilter,
    setSelectedFranchises,
    setSelectedTypes,
    setSelectedCategories,
}) => {
    // Función para saber si hay algún filtro activo
    const hasActiveFilters =
        selectedFranchises.length > 0 ||
        selectedTypes.length > 0 ||
        selectedCategories.length > 0

    const clearAllFilters = () => {
        setSelectedFranchises([])
        setSelectedTypes([])
        setSelectedCategories([])
    }

    return (
        // 🔥 CORRECCIÓN 1: En móvil el drawer cubre todo (z-[100]), en desktop respeta al navbar (lg:z-40)
        <div className="drawer-side z-[100] lg:z-40">
            {/* Overlay oscuro para la versión móvil */}
            <label
                htmlFor="shop-drawer"
                aria-label="close sidebar"
                className="drawer-overlay"
            ></label>

            {/* Contenedor del Sidebar */}
            {/* 🔥 CORRECCIÓN 2: Se agregó lg:sticky, lg:top-24 y límite de altura para scroll interno */}
            <aside className="w-80 min-h-full bg-base-100 text-base-content flex flex-col pt-6 pb-20 px-6 shadow-2xl lg:shadow-none lg:bg-transparent lg:px-0 lg:pt-0 lg:w-64 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto scrollbar-hide">
                {/* Cabecera del Sidebar */}
                <div className="flex items-center justify-between mb-8 lg:mt-2">
                    <h2 className="text-lg font-bold tracking-tight uppercase">
                        Filtros
                    </h2>
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="text-xs font-bold text-primary hover:underline uppercase tracking-widest"
                        >
                            Limpiar
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-8 pb-10">
                    {/* 1. EL REY: FRANQUICIAS Y TEMÁTICAS */}
                    {franchiseNames && franchiseNames.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-widest mb-2 border-b border-base-200 pb-2">
                                Diseño / Franquicia
                            </h3>
                            {/* 🔥 CORRECCIÓN 3: Scroll interno para que la lista larga no rompa la página */}
                            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                                {franchiseNames.map((fran) => (
                                    <label
                                        key={fran._id}
                                        className="flex items-center gap-3 cursor-pointer group"
                                    >
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm checkbox-primary rounded-md"
                                            checked={selectedFranchises.includes(
                                                fran.name.toLowerCase(),
                                            )}
                                            onChange={() =>
                                                toggleFilter(
                                                    setSelectedFranchises,
                                                    fran.name.toLowerCase(),
                                                )
                                            }
                                        />
                                        <span className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                                            {fran.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 2. FORMATO DE CALCETA */}
                    {availableSockTypes && availableSockTypes.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-widest mb-2 border-b border-base-200 pb-2">
                                Tipo de Calceta
                            </h3>
                            <div className="flex flex-col gap-3">
                                {availableSockTypes.map((type, index) => (
                                    <label
                                        key={index}
                                        className="flex items-center gap-3 cursor-pointer group"
                                    >
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm checkbox-primary rounded-md"
                                            checked={selectedTypes.includes(
                                                type,
                                            )}
                                            onChange={() =>
                                                toggleFilter(
                                                    setSelectedTypes,
                                                    type,
                                                )
                                            }
                                        />
                                        <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                            {type}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 3. CATEGORÍA GENERAL */}
                    {productCategories && productCategories.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-widest mb-2 border-b border-base-200 pb-2">
                                Categoría General
                            </h3>
                            <div className="flex flex-col gap-3">
                                {productCategories.map((cat) => (
                                    <label
                                        key={cat._id}
                                        className="flex items-center gap-3 cursor-pointer group"
                                    >
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm checkbox-primary rounded-md"
                                            checked={selectedCategories.includes(
                                                cat.name.toLowerCase(),
                                            )}
                                            onChange={() =>
                                                toggleFilter(
                                                    setSelectedCategories,
                                                    cat.name.toLowerCase(),
                                                )
                                            }
                                        />
                                        <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                            {cat.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    )
}

export default ShopSidebar
