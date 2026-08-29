import { ProductCard } from '../../../entities/product'

const ProductList = ({ products = [] }) => {
    return (
        // grid-cols-2: 2 columnas por defecto (Mobile).
        // md:grid-cols-3: 3 columnas en Tablets.
        // lg:grid-cols-4: 4 columnas en Computadoras.
        // gap-x-3 gap-y-8: Separación horizontal pequeña (3) y separación vertical grande (8) para que respiren las filas.
        // sm:gap-6: En pantallas grandes, separación uniforme de 6.

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-6">
            {products.map((product) => (
                <ProductCard
                    key={product._id || product.name}
                    product={product}
                />
            ))}
        </div>
    )
}

export default ProductList
