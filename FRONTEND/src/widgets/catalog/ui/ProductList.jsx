import { ProductCard } from '../../../entities/product'

const ProductList = ({ products = [] }) => {
    return (
        // grid-cols-2: 2 columnas por defecto (Mobile).
        // md:grid-cols-3: 3 columnas en Tablets.
        // xl:grid-cols-4: 4 columnas en Computadoras.
        // gap-x-4 gap-y-10: Separación horizontal pequeña (4) y separación vertical grande (10) para que respiren las filas.
        // sm:gap-8: En pantallas grandes, separación uniforme de 8.

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 sm:gap-8">
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
