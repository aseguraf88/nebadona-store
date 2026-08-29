import { ProductCarousel } from '../../product-carousel'

const ProductSection = ({
    title,
    products = [],
    verMasHref = '#new-arrivals',
}) => {
    return (
        <section className="mb-10">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-base-content">
                    {title}
                </h2>

                <a href={verMasHref} className="link link-primary text-sm">
                    Ver Todo
                </a>
            </div>

            <ProductCarousel products={products} />
        </section>
    )
}

export default ProductSection
