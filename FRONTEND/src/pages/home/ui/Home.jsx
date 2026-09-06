import { ProductSection } from '../../../widgets/catalog'
import { useProduct } from '../../../entities/product'
import { HeroCarousel } from '../../../widgets/hero'

const Home = () => {
    const { products, productsLoading, error } = useProduct()

    // 🔥 LA MAGIA: Filtramos la lista antes de que toque la pantalla
    const publishedProducts = (products || []).filter(
        (p) => p.status?.trim().toUpperCase() === 'PUBLISHED',
    )

    console.log(
        '🔍 LO QUE LLEGA DE LA BD:',
        products.map((p) => ({
            nombre: p.name,
            estado: p.status,
        })),
    )

    return (
        <div>
            <HeroCarousel />

            <div
                id="catalogo"
                className="mx-auto max-w-[1200px] w-full px-4 sm:px-6 lg:px-8 scroll-mt-32 pb-12 mt-16"
            >
                {productsLoading ? (
                    <div className="loading loading-infinity" />
                ) : error ? (
                    <p>Error al cargar los productos</p>
                ) : publishedProducts.length === 0 ? ( // Usamos la lista limpia aquí
                    <p className="text-base-content/70">
                        No encontramos productos para esta búsqueda.
                    </p>
                ) : (
                    <ProductSection
                        title="Lo Nuevo"
                        products={publishedProducts} // Y le pasamos la lista limpia aquí
                        verMasHref="#catalogo"
                    />
                )}
            </div>
        </div>
    )
}

export default Home
