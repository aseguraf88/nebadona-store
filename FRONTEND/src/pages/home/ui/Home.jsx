import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ProductSection } from '../../../widgets/catalog'
import { useProduct } from '../../../entities/product'
import { HeroCarousel } from '../../../widgets/hero'

const Home = () => {
    const { products, productsLoading, error } = useProduct()

    const publishedProducts = (products || []).filter(
        (p) => p.status?.trim().toUpperCase() === 'PUBLISHED',
    )

    const featuredProducts = publishedProducts.filter((p) => p.featured)
    const popularProducts = publishedProducts.filter((p) => p.popular)

    const categoryCounts = useMemo(() => {
        const counts = {}
        publishedProducts.forEach((p) => {
            if (p.product_category) {
                counts[p.product_category] = (counts[p.product_category] || 0) + 1
            }
        })
        return counts
    }, [publishedProducts])

    return (
        <div>
            <HeroCarousel />

            <div
                id="catalogo"
                className="mx-auto max-w-[1800px] w-full px-4 sm:px-6 lg:px-8 scroll-mt-32 pb-12 mt-16"
            >
                {productsLoading ? (
                    <div className="loading loading-infinity" />
                ) : error ? (
                    <p>Error al cargar los productos</p>
                ) : publishedProducts.length === 0 ? (
                    <p className="text-base-content/70">
                        No encontramos productos para esta búsqueda.
                    </p>
                ) : (
                    <>
                        <ProductSection
                            title="Lo Nuevo"
                            products={publishedProducts}
                            verMasHref="#catalogo"
                        />

                        {featuredProducts.length > 0 && (
                            <ProductSection
                                title="Destacados"
                                products={featuredProducts}
                                verMasHref="/shop"
                            />
                        )}

                        {popularProducts.length > 0 && (
                            <ProductSection
                                title="Populares"
                                products={popularProducts}
                                verMasHref="/shop"
                            />
                        )}

                        {Object.keys(categoryCounts).length > 0 && (
                            <section className="mb-10">
                                <h2 className="text-lg font-semibold text-base-content mb-4">
                                    Explora por Categoría
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {Object.entries(categoryCounts).map(
                                        ([category, count]) => (
                                            <Link
                                                key={category}
                                                to={`/shop?category=${encodeURIComponent(category)}`}
                                                className="card bg-base-200/40 hover:bg-base-200 transition-colors p-6 text-center rounded-2xl"
                                            >
                                                <span className="font-bold capitalize">
                                                    {category}
                                                </span>
                                                <span className="text-xs text-base-content/60">
                                                    {count} producto{count !== 1 ? 's' : ''}
                                                </span>
                                            </Link>
                                        ),
                                    )}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default Home
