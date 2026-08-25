import ProductSection from '../components/ProductSection'
import { useProduct } from '../context/ProductContext'
import HeroCarousel from '../components/HeroCarousel/HeroCarousel'

const Home = () => {
    const { products, productsLoading, error } = useProduct()

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
                ) : products.length === 0 ? (
                    <p className="text-base-content/70">
                        No encontramos productos para esta búsqueda.
                    </p>
                ) : (
                    <ProductSection
                        title="Lo Nuevo"
                        products={products}
                        verMasHref="#catalogo"
                    />
                )}
            </div>
        </div>
    )
}

export default Home
