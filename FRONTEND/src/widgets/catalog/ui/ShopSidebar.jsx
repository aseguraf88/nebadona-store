const FilterGroups = ({
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
}) => (
    <div className="flex flex-col gap-8 pb-10">
        {franchiseNames && franchiseNames.length > 0 && (
            <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-widest mb-2 border-b border-base-200 pb-2">
                    Diseño / Franquicia
                </h3>
                <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                    {franchiseNames.map((fran) => (
                        <label key={fran._id} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-sm checkbox-primary rounded-md"
                                checked={selectedFranchises.includes(fran.name.toLowerCase())}
                                onChange={() => toggleFilter(setSelectedFranchises, fran.name.toLowerCase())}
                            />
                            <span className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                                {fran.name}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        )}

        {availableSockTypes && availableSockTypes.length > 0 && (
            <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-widest mb-2 border-b border-base-200 pb-2">
                    Tipo de Calceta
                </h3>
                <div className="flex flex-col gap-3">
                    {availableSockTypes.map((type, index) => (
                        <label key={index} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-sm checkbox-primary rounded-md"
                                checked={selectedTypes.includes(type)}
                                onChange={() => toggleFilter(setSelectedTypes, type)}
                            />
                            <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                {type}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        )}

        {productCategories && productCategories.length > 0 && (
            <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-widest mb-2 border-b border-base-200 pb-2">
                    Categoría General
                </h3>
                <div className="flex flex-col gap-3">
                    {productCategories.map((cat) => (
                        <label key={cat._id} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-sm checkbox-primary rounded-md"
                                checked={selectedCategories.includes(cat.name.toLowerCase())}
                                onChange={() => toggleFilter(setSelectedCategories, cat.name.toLowerCase())}
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
)

const FilterHeader = ({ selectedFranchises, selectedTypes, selectedCategories, setSelectedFranchises, setSelectedTypes, setSelectedCategories, topMargin }) => {
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
        <div className={`flex items-center justify-between mb-8 ${topMargin || ''}`}>
            <h2 className="text-lg font-bold tracking-tight uppercase">Filtros</h2>
            {hasActiveFilters && (
                <button
                    onClick={clearAllFilters}
                    className="text-xs font-bold text-primary hover:underline uppercase tracking-widest"
                >
                    Limpiar
                </button>
            )}
        </div>
    )
}

export const ShopSidebarMobile = (props) => (
    <div className="drawer-side z-[100] lg:hidden">
        <label
            htmlFor="shop-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
        ></label>

        <aside className="w-80 min-h-full bg-base-100 text-base-content flex flex-col pt-6 pb-20 px-6 shadow-2xl">
            <FilterHeader {...props} />
            <FilterGroups {...props} />
        </aside>
    </div>
)

export const ShopSidebarDesktop = (props) => (
    <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:shrink-0 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto scrollbar-hide">
        <FilterHeader {...props} topMargin="mt-2" />
        <FilterGroups {...props} />
    </aside>
)
