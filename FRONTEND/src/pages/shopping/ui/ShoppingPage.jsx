import { useState, useMemo, useEffect, useRef } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { useProduct, hasStock } from '../../../entities/product'
import { slugify } from '../../../entities/product/lib/themes'
import {
    ProductList,
    ResultsToolbar,
    ShopSidebarMobile,
    ShopSidebarDesktop,
} from '../../../widgets/catalog'
import { TbFilter } from 'react-icons/tb'

// Los filtros viven en la URL (se pueden compartir y "atrás" funciona), con
// los valores en slug. Un valor que no existe se ignora. "category" mantiene
// el nombre que ya usan los enlaces de Home
const PARAMS = {
    theme: 'tematica',
    franchises: 'franquicia',
    types: 'tipo',
    categories: 'category',
}

// Las opciones del panel cuyo slug está en la URL
const pickFromUrl = (searchParams, param, options) => {
    const slugs = searchParams.getAll(param).map(slugify)
    return options.filter((option) => slugs.includes(slugify(option)))
}

const ShoppingPage = () => {
    const {
        products,
        franchiseNames,
        productCategories,
        designThemes,
        productsLoading,
        error,
    } = useProduct()

    const [sortOption, setSortOption] = useState('relevant')
    const [searchParams, setSearchParams] = useSearchParams()
    const location = useLocation()
    const drawerToggleRef = useRef(null)
    const searchQuery = searchParams.get('search')

    // Al llegar desde fuera del panel (Tienda, el menú, el buscador, Home):
    // orden por defecto y cajón de filtros cerrado, como cuando la ruta
    // tenía key={location.key}. Los cambios del panel no lo reinician
    useEffect(() => {
        if (location.state?.fromFilters) return
        setSortOption('relevant')
        if (drawerToggleRef.current) drawerToggleRef.current.checked = false
    }, [location.key, location.state])

    // 🔥 EXTRAEMOS LOS TIPOS DE CALCETAS DINÁMICAMENTE (Ej: "Tobilleras", "Largas")
    const availableSockTypes = useMemo(() => {
        if (!products) return []
        const types = products.map((p) => p.sock_type).filter(Boolean)
        return [...new Set(types)] // Set elimina los duplicados
    }, [products])

    // Franquicias del panel: la lista de Configuración más las de los
    // productos publicados que no estén en ella (por ejemplo, entradas por
    // CSV), sin duplicar por slug. Así un enlace del menú siempre filtra
    const franchiseOptions = useMemo(() => {
        const options = [...(franchiseNames ?? [])]
        const known = new Set(options.map((fran) => slugify(fran.name)))
        for (const product of products ?? []) {
            const slug = slugify(product.franchise_name)
            if (!slug || known.has(slug)) continue
            known.add(slug)
            const name = product.franchise_name
            options.push({
                _id: `producto-${slug}`,
                name: name.charAt(0).toUpperCase() + name.slice(1),
            })
        }
        return options.sort((a, b) => a.name.localeCompare(b.name, 'es'))
    }, [franchiseNames, products])

    // 🔥 FILTROS: salen de la URL, en el formato que usa el panel
    const selectedFranchises = useMemo(
        () =>
            pickFromUrl(
                searchParams,
                PARAMS.franchises,
                franchiseOptions.map((fran) => fran.name.toLowerCase()),
            ),
        [searchParams, franchiseOptions],
    )
    const selectedTypes = useMemo(
        () => pickFromUrl(searchParams, PARAMS.types, availableSockTypes),
        [searchParams, availableSockTypes],
    )
    const selectedCategories = useMemo(
        () =>
            pickFromUrl(
                searchParams,
                PARAMS.categories,
                (productCategories ?? []).map((cat) => cat.name.toLowerCase()),
            ),
        [searchParams, productCategories],
    )

    // Temática del menú: solo si algún producto publicado la tiene
    const themeSlug = slugify(searchParams.get(PARAMS.theme))
    const activeTheme = useMemo(() => {
        if (!themeSlug) return null
        const product = (products ?? []).find(
            (p) => slugify(p.design_theme) === themeSlug,
        )
        if (!product) return null
        const fromSettings = designThemes?.find(
            (theme) => slugify(theme.name) === themeSlug,
        )
        return {
            slug: themeSlug,
            name: fromSettings?.name ?? product.design_theme,
        }
    }, [themeSlug, products, designThemes])

    // Escribe en la URL conservando lo demás (búsqueda, temática).
    // fromFilters evita que se reinicie el orden
    const updateParams = (changes) => {
        const next = new URLSearchParams(searchParams)
        for (const [param, values] of Object.entries(changes)) {
            next.delete(param)
            for (const value of values) next.append(param, slugify(value))
        }
        setSearchParams(next, { state: { fromFilters: true } })
    }

    // El panel llama setSelectedX(array) o setSelectedX((prev) => array)
    const urlSetter = (param, current) => (next) =>
        updateParams({
            [param]: typeof next === 'function' ? next(current) : next,
        })

    const setSelectedFranchises = urlSetter(PARAMS.franchises, selectedFranchises)
    const setSelectedTypes = urlSetter(PARAMS.types, selectedTypes)
    const setSelectedCategories = urlSetter(PARAMS.categories, selectedCategories)

    // Función universal para marcar/desmarcar filtros
    const toggleFilter = (setState, value) => {
        setState((prev) =>
            prev.includes(value)
                ? prev.filter((item) => item !== value)
                : [...prev, value],
        )
    }

    const hasActiveFilters =
        Boolean(activeTheme) ||
        selectedFranchises.length > 0 ||
        selectedTypes.length > 0 ||
        selectedCategories.length > 0

    // Una sola navegación (tres setters seguidos se pisarían entre sí)
    const clearFilters = () =>
        updateParams({
            [PARAMS.theme]: [],
            [PARAMS.franchises]: [],
            [PARAMS.types]: [],
            [PARAMS.categories]: [],
        })

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

        // 2. Temática (menú del navbar)
        if (activeTheme) {
            result = result.filter(
                (p) => slugify(p.design_theme) === activeTheme.slug,
            )
        }

        // 3. Filtro de Franquicias (El Rey)
        // (por slug: "Pokémon" en Configuración y "pokemon" en el producto
        // son la misma franquicia)
        if (selectedFranchises.length > 0) {
            const franchiseSlugs = selectedFranchises.map(slugify)
            result = result.filter((p) =>
                franchiseSlugs.includes(slugify(p.franchise_name)),
            )
        }

        // 4. Filtro de Tipo de Calceta
        if (selectedTypes.length > 0) {
            result = result.filter((p) => selectedTypes.includes(p.sock_type))
        }

        // 5. Filtro de Categorías Generales
        if (selectedCategories.length > 0) {
            result = result.filter((p) =>
                selectedCategories.includes(p.product_category),
            )
        }

        // 6. Ordenamiento
        if (sortOption === 'price-asc') {
            result.sort((a, b) => (a.price || 0) - (b.price || 0))
        } else if (sortOption === 'price-desc') {
            result.sort((a, b) => (b.price || 0) - (a.price || 0))
        } else if (sortOption === 'newest') {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        }

        // 7. Agotados (todas sus variantes sin stock) al final, respetando el
        // orden de arriba dentro de cada grupo
        result = [
            ...result.filter((p) => hasStock(p)),
            ...result.filter((p) => !hasStock(p)),
        ]

        return result
    }, [
        products,
        searchQuery,
        activeTheme,
        selectedFranchises,
        selectedTypes,
        selectedCategories,
        sortOption,
    ])

    const sidebarProps = {
        franchiseNames: franchiseOptions,
        productCategories,
        availableSockTypes,
        selectedFranchises,
        selectedTypes,
        selectedCategories,
        toggleFilter,
        setSelectedFranchises,
        setSelectedTypes,
        setSelectedCategories,
        hasActiveFilters,
        onClearAll: clearFilters,
    }

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
                        {searchQuery || hasActiveFilters
                            ? 'No hay resultados que coincidan con tu búsqueda o filtros.'
                            : 'Actualmente no hay productos en esta sección.'}
                    </p>
                    <button
                        onClick={clearFilters}
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
        <div className="mx-auto max-w-[1800px] w-full px-4 sm:px-6 lg:px-8 py-6">
            {/* Breadcrumbs Dinámicos */}
            <div className="breadcrumbs text-sm mb-6">
                <ul>
                    <li>
                        <Link to="/">Inicio</Link>
                    </li>
                    <li>
                        {searchQuery || hasActiveFilters ? (
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
                    {activeTheme && (
                        <li>
                            <span className="text-primary font-medium">
                                {activeTheme.name}
                            </span>
                        </li>
                    )}
                    {searchQuery && (
                        <li>
                            <span className="text-primary font-medium">
                                Búsqueda
                            </span>
                        </li>
                    )}
                </ul>
            </div>

            <div className="lg:flex lg:gap-8 lg:items-start">
                <ShopSidebarDesktop {...sidebarProps} />

                <div className="drawer flex-1">
                    <input
                        ref={drawerToggleRef}
                        id="shop-drawer"
                        type="checkbox"
                        className="drawer-toggle"
                    />

                    <div className="drawer-content flex flex-col">
                        <label
                            htmlFor="shop-drawer"
                            className="btn btn-outline btn-sm mb-4 lg:hidden w-fit"
                        >
                            <TbFilter /> Filtros
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
                                    sortOption={sortOption}
                                    onSortChange={setSortOption}
                                />
                            )}
                            {renderContent()}
                        </div>
                    </div>

                    <ShopSidebarMobile {...sidebarProps} />
                </div>
            </div>
        </div>
    )
}

export default ShoppingPage
