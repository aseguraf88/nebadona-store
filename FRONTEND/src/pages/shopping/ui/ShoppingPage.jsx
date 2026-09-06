import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useProduct } from '../../../entities/product'
import { ProductList } from '../../../widgets/catalog'
import { ResultsToolbar } from '../../../widgets/catalog'
import { ShopSidebar } from '../../../widgets/catalog'

const ShoppingPage = () => {
    const {
        products,
        franchiseNames,
        productCategories,
        productsLoading,
        error,
    } = useProduct()

    const [sortOption, setSortOption] = useState('relevant')
    const [searchParams] = useSearchParams()
    const searchQuery = searchParams.get('search')

    // 🔥 ESTADOS PARA LOS FILTROS
    const [selectedFranchises, setSelectedFranchises] = useState([])
    const [selectedTypes, setSelectedTypes] = useState([])
    const [selectedCategories, setSelectedCategories] = useState([])

    // Función universal para marcar/desmarcar filtros
    const toggleFilter = (setState, value) => {
        setState((prev) =>
            prev.includes(value)
                ? prev.filter((item) => item !== value)
                : [...prev, value],
        )
    }

    // 🔥 EXTRAEMOS LOS TIPOS DE CALCETAS DINÁMICAMENTE (Ej: "Tobilleras", "Largas")
    const availableSockTypes = useMemo(() => {
        if (!products) return []
        const types = products.map((p) => p.sock_type).filter(Boolean)
        return [...new Set(types)] // Set elimina los duplicados
    }, [products])

    // ✨ LA MAGIA ANTI-ACENTOS
    const normalizeText = (text) => {
        if (!text) return ''
        return text
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
    }

    // 🔥 LÓGICA DE FILTRADO Y ORDENAMIENTO (Usamos useMemo para mayor rendimiento)
    const processedProducts = useMemo(() => {
        let result = [...(products || [])].filter(
            (p) => p.status?.trim().toUpperCase() === 'PUBLISHED',
        )

        console.log(
            '🔍 LO QUE LLEGA DE LA BD:',
            products.map((p) => ({
                nombre: p.name,
                estado: p.status,
            })),
        )

        // 1. Motor de búsqueda
        if (searchQuery) {
            const query = normalizeText(searchQuery.trim())
            result = result.filter((product) => {
                const matchName = normalizeText(product.name).includes(query)
                const matchFranchise = normalizeText(
                    product.franchise_name,
                ).includes(query)
                return matchName || matchFranchise
            })
        }

        // 2. Filtro de Franquicias (El Rey)
        if (selectedFranchises.length > 0) {
            result = result.filter((p) =>
                selectedFranchises.includes(p.franchise_name),
            )
        }

        // 3. Filtro de Tipo de Calceta
        if (selectedTypes.length > 0) {
            result = result.filter((p) => selectedTypes.includes(p.sock_type))
        }

        // 4. Filtro de Categorías Generales
        if (selectedCategories.length > 0) {
            result = result.filter((p) =>
                selectedCategories.includes(p.product_category),
            )
        }

        // 5. Ordenamiento
        if (sortOption === 'price-asc') {
            result.sort((a, b) => (a.price || 0) - (b.price || 0))
        } else if (sortOption === 'price-desc') {
            result.sort((a, b) => (b.price || 0) - (a.price || 0))
        } else if (sortOption === 'newest') {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        }

        return result
    }, [
        products,
        searchQuery,
        selectedFranchises,
        selectedTypes,
        selectedCategories,
        sortOption,
    ])

    // Función de renderizado principal
    const renderContent = () => {
        if (productsLoading) {
            return (
                <div className="flex w-full justify-center py-20">
                    <span className="loading loading-infinity loading-lg text-primary"></span>
                </div>
            )
        }

        if (error) {
            return (
                <div className="alert alert-error shadow-sm">
                    <span>Error al cargar productos: {error}</span>
                </div>
            )
        }

        if (processedProducts.length === 0) {
            return (
                <div className="py-20 flex flex-col items-center justify-center gap-4 text-center bg-base-200/30 rounded-box border border-base-200">
                    <div className="text-5xl opacity-50 mb-2">🤔</div>
                    <h3 className="text-xl font-bold">Lo sentimos.</h3>
                    <p className="text-base-content/70">
                        {searchQuery || selectedFranchises.length > 0
                            ? 'No hay resultados que coincidan con tu búsqueda o filtros.'
                            : 'Actualmente no hay productos en esta sección.'}
                    </p>
                    <button
                        onClick={() => {
                            setSelectedFranchises([])
                            setSelectedTypes([])
                            setSelectedCategories([])
                        }}
                        className="btn btn-outline btn-primary mt-2"
                    >
                        Limpiar todos los filtros
                    </button>
                </div>
            )
        }

        return <ProductList products={processedProducts} />
    }

    return (
        <div className="mx-auto max-w-[1200px] w-full px-4 sm:px-6 lg:px-8 py-6">
            {/* Breadcrumbs Dinámicos */}
            <div className="breadcrumbs text-sm mb-6">
                <ul>
                    <li>
                        <Link to="/">Inicio</Link>
                    </li>
                    <li>
                        {searchQuery ? (
                            <Link
                                to="/shop"
                                className="text-base-content/60 hover:text-primary"
                            >
                                Tienda
                            </Link>
                        ) : (
                            <span className="text-base-content/60">Tienda</span>
                        )}
                    </li>
                    {searchQuery && (
                        <li>
                            <span className="text-primary font-medium">
                                Búsqueda
                            </span>
                        </li>
                    )}
                </ul>
            </div>

            {/* Estructura Drawer de DaisyUI para el Sidebar */}
            <div className="drawer lg:drawer-open">
                <input
                    id="shop-drawer"
                    type="checkbox"
                    className="drawer-toggle"
                />

                {/* CONTENIDO PRINCIPAL (Lado derecho) */}
                <div className="drawer-content flex flex-col lg:pl-8">
                    <label
                        htmlFor="shop-drawer"
                        className="btn btn-outline btn-sm mb-4 lg:hidden w-fit"
                    >
                        <span className="ti ti-filter"></span> Filtros
                        {/* Indicador de filtros activos en móvil */}
                        {selectedFranchises.length +
                            selectedTypes.length +
                            selectedCategories.length >
                            0 && (
                            <div className="badge badge-primary badge-xs ml-1">
                                {selectedFranchises.length +
                                    selectedTypes.length +
                                    selectedCategories.length}
                            </div>
                        )}
                    </label>

                    {searchQuery && (
                        <div className="mb-6 border-b border-base-200 pb-4">
                            <h1 className="text-2xl font-bold text-base-content">
                                Resultados para:{' '}
                                <span className="text-primary">
                                    "{searchQuery}"
                                </span>
                            </h1>
                            <p className="text-sm text-base-content/60 mt-1">
                                Encontramos {processedProducts.length} producto
                                {processedProducts.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    )}

                    <div className="flex-1 flex flex-col gap-6">
                        {processedProducts.length > 0 && (
                            <ResultsToolbar
                                totalProducts={processedProducts.length}
                                onSortChange={setSortOption}
                            />
                        )}
                        {renderContent()}
                    </div>
                </div>

                {/* PASAMOS LOS ESTADOS AL SIDEBAR COMO PROPS */}
                <ShopSidebar
                    franchiseNames={franchiseNames}
                    productCategories={productCategories}
                    availableSockTypes={availableSockTypes}
                    selectedFranchises={selectedFranchises}
                    selectedTypes={selectedTypes}
                    selectedCategories={selectedCategories}
                    toggleFilter={toggleFilter}
                    setSelectedFranchises={setSelectedFranchises}
                    setSelectedTypes={setSelectedTypes}
                    setSelectedCategories={setSelectedCategories}
                />
            </div>
        </div>
    )
}

export default ShoppingPage
