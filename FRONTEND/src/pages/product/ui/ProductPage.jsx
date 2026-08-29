import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCart } from '../../../entities/cart'
import { useProduct } from '../../../entities/product'
import { ProductSection } from '../../../widgets/catalog'

const ProductPage = () => {
    const { id } = useParams()
    const { addToCart } = useCart()

    // 🔥 CONEXIÓN A TU CONTEXTO REAL
    const { getProductById, product, productLoading } = useProduct()

    // Estados para la UI
    const [quantity, setQuantity] = useState(1)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [isAdded, setIsAdded] = useState(false)

    // Llamada a la base de datos al montar la página
    useEffect(() => {
        if (id) {
            getProductById(id)
            window.scrollTo(0, 0)
        }
    }, [id, getProductById])

    // Extraer imágenes con seguridad
    const images = useMemo(() => {
        if (!product) return []
        const candidateImages = Array.isArray(product.imageUrls)
            ? product.imageUrls
            : product.imageUrl
              ? [product.imageUrl]
              : []
        return candidateImages.filter(Boolean)
    }, [product])

    // Funciones del carrito
    const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1))
    const handleIncrement = () =>
        setQuantity((prev) => Math.min(product?.stock || 1, prev + 1))

    const handleAddToCart = async () => {
        await addToCart(product, quantity)
        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 1500)
    }

    // ⏳ PANTALLA DE CARGA (Usando tu estado productLoading)
    if (productLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        )
    }

    // ❌ PRODUCTO NO ENCONTRADO
    if (!product || !product._id) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Producto no encontrado</h1>
                <p className="text-base-content/70">
                    La calceta que buscas no existe o fue retirada.
                </p>
                <Link to="/shop" className="btn btn-primary mt-4">
                    Volver a la tienda
                </Link>
            </div>
        )
    }

    // ✅ RENDERIZADO PRINCIPAL
    return (
        <main className="min-h-screen bg-base-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 1. MÍGAS DE PAN (BREADCRUMBS) */}
                <div className="text-sm breadcrumbs text-base-content/60 mb-8">
                    <ul>
                        <li>
                            <Link to="/">Inicio</Link>
                        </li>
                        <li>
                            <Link to="/shop">Tienda</Link>
                        </li>
                        <li className="font-medium text-base-content">
                            {product.name}
                        </li>
                    </ul>
                </div>

                {/* 2. BLOQUE PRINCIPAL */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
                    {/* ZONA IZQUIERDA: GALERÍA BOUTIQUE (Vertical en Desktop, Horizontal en Móvil) */}
                    <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
                        {/* MINIATURAS */}
                        {images.length > 1 && (
                            <div className="flex lg:flex-col gap-3 lg:gap-4 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 lg:w-24 shrink-0 scrollbar-hide snap-x lg:snap-y">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() =>
                                            setSelectedImageIndex(idx)
                                        }
                                        className={`relative aspect-square w-20 lg:w-full shrink-0 snap-start rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                                            selectedImageIndex === idx
                                                ? 'border-primary opacity-100 ring-4 ring-primary/10'
                                                : 'border-transparent opacity-50 hover:opacity-100 hover:border-base-300'
                                        }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`Vista ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* IMAGEN PRINCIPAL */}
                        <figure className="aspect-square w-full bg-base-200/50 rounded-3xl overflow-hidden relative flex-1 flex items-center justify-center p-4">
                            {images.length > 0 ? (
                                <img
                                    src={images[selectedImageIndex]}
                                    alt={product.name}
                                    className="w-full h-full object-contain transition-opacity duration-500"
                                />
                            ) : (
                                <div className="flex w-full h-full items-center justify-center text-base-content/50">
                                    Sin imagen
                                </div>
                            )}
                        </figure>
                    </div>

                    {/* ZONA DERECHA: INFO Y COMPRA */}
                    <div className="flex flex-col pt-4">
                        <div className="flex items-center justify-start gap-2 sm:gap-3 text-xs font-bold text-base-content/50 uppercase tracking-widest mb-3">
                            <span>SKU: {product.sku || 'N/A'}</span>
                            <span className="opacity-40 font-light">|</span>
                            <span className="truncate text-primary">
                                {product.franchise_name || 'Novedad'}
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-base-content tracking-tight leading-tight mb-4">
                            {product.name}
                        </h1>

                        <div className="flex items-baseline gap-4 mb-8">
                            <span className="text-3xl font-medium text-base-content">
                                {new Intl.NumberFormat('es-CL', {
                                    style: 'currency',
                                    currency: 'CLP',
                                }).format(product.price || 0)}
                            </span>
                            {product.compareAtPrice &&
                                product.compareAtPrice > product.price && (
                                    <span className="text-xl font-medium text-base-content/40 line-through">
                                        {new Intl.NumberFormat('es-CL', {
                                            style: 'currency',
                                            currency: 'CLP',
                                        }).format(product.compareAtPrice)}
                                    </span>
                                )}
                        </div>

                        {/* BLOQUE DE COMPRA */}
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-base-content/70 uppercase tracking-widest">
                                    Talla
                                </span>
                                <div className="flex gap-3">
                                    <div className="badge badge-outline p-5 rounded-xl font-bold text-base-content border-primary bg-primary/5">
                                        {product.size || 'Única (36 - 43)'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                                <div className="flex items-center border border-base-300 rounded-2xl h-14 w-full sm:w-36 bg-base-100 overflow-hidden shrink-0">
                                    <button
                                        onClick={handleDecrement}
                                        className="flex-1 h-full hover:bg-base-200 text-lg font-medium"
                                    >
                                        -
                                    </button>
                                    <span className="flex-1 text-center font-bold">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={handleIncrement}
                                        disabled={
                                            quantity >= (product.stock || 0)
                                        }
                                        className="flex-1 h-full hover:bg-base-200 text-lg font-medium disabled:opacity-30"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0 || isAdded}
                                    className={`btn flex-1 h-14 rounded-2xl text-sm uppercase tracking-widest font-bold border-none transition-all w-full ${
                                        isAdded
                                            ? 'bg-success text-success-content hover:bg-success'
                                            : 'btn-primary shadow-lg hover:shadow-xl'
                                    }`}
                                >
                                    {product.stock === 0
                                        ? 'Agotado'
                                        : isAdded
                                          ? '✓ Agregado'
                                          : 'Agregar al Carrito'}
                                </button>
                            </div>
                        </div>
                        {/* 4. ACORDEONES DE INFORMACIÓN (Estilo Boutique) */}
                        <div className="mt-8 flex flex-col gap-3 border-t border-base-200 pt-8">
                            {/* Acordeón 1: Descripción */}
                            <div className="collapse collapse-plus bg-base-100 border border-base-200 rounded-xl">
                                <input
                                    type="radio"
                                    name="product-accordion"
                                    defaultChecked
                                />
                                <div className="collapse-title text-sm font-semibold uppercase tracking-wider">
                                    Descripción del Diseño
                                </div>
                                <div className="collapse-content text-sm text-base-content/80 leading-relaxed">
                                    <p>
                                        {product.description ||
                                            'Un diseño exclusivo creado para destacar. Confeccionadas para máxima comodidad y durabilidad en tu día a día.'}
                                    </p>
                                    {product.tags &&
                                        product.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {product.tags.map((tag, i) => (
                                                    <span
                                                        key={i}
                                                        className="badge badge-secondary badge-outline text-xs"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                </div>
                            </div>

                            {/* Acordeón 2: Materiales y Cuidados */}
                            <div className="collapse collapse-plus bg-base-100 border border-base-200 rounded-xl">
                                <input type="radio" name="product-accordion" />
                                <div className="collapse-title text-sm font-semibold uppercase tracking-wider">
                                    Materiales y Cuidados
                                </div>
                                <div className="collapse-content text-sm text-base-content/80 space-y-2">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>
                                            Algodón peinado premium (suavidad
                                            garantizada).
                                        </li>
                                        <li>
                                            Talón y puntera reforzados
                                            anti-desgaste.
                                        </li>
                                        <li>
                                            Banda elástica en el arco para un
                                            ajuste firme.
                                        </li>
                                    </ul>
                                    <p className="mt-3 font-medium text-base-content">
                                        Cuidados:
                                    </p>
                                    <p>
                                        Lavar a máquina con agua fría. No usar
                                        secadora para mantener vivos los colores
                                        y evitar encogimiento.
                                    </p>
                                </div>
                            </div>

                            {/* Acordeón 3: Envíos */}
                            <div className="collapse collapse-plus bg-base-100 border border-base-200 rounded-xl">
                                <input type="radio" name="product-accordion" />
                                <div className="collapse-title text-sm font-semibold uppercase tracking-wider">
                                    Envíos y Garantía
                                </div>
                                <div className="collapse-content text-sm text-base-content/80 space-y-3">
                                    <p>
                                        📦{' '}
                                        <strong className="text-base-content">
                                            Despacho seguro:
                                        </strong>{' '}
                                        Preparamos tu pedido con amor y lo
                                        enviamos a todo Chile.
                                    </p>
                                    <p>
                                        🔄{' '}
                                        <strong className="text-base-content">
                                            Satisfacción:
                                        </strong>{' '}
                                        Tienes 30 días para cambios si el
                                        producto se mantiene en su empaque
                                        original.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. SECCIÓN HATEOAS (Recomendados) */}
                <div className="mt-24 pt-12 border-t border-base-200">
                    {/* NOTA: Para hacer esto dinámico en el futuro, podrías pasar products={productosFiltradosPorFranquicia} */}
                    <ProductSection
                        title="Explora más diseños increíbles"
                        products={[]} // Aquí debes conectar un array de productos
                        verMasHref="/shop"
                    />
                </div>
            </div>
        </main>
    )
}

export default ProductPage
