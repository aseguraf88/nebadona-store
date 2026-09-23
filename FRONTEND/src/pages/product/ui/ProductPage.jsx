import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Share2 } from 'lucide-react'
import { useCart } from '../../../entities/cart'
import { useProduct } from '../../../entities/product'
import VariantSelector from '../../../entities/product/ui/VariantSelector'
import { ProductSection } from '../../../widgets/catalog'
import { getSizeGuideByCategory } from '../../../entities/product/config/sizeGuides'
import { getCareGuideByCategory } from '../../../entities/product/config/careGuides'

const MD_MEDIA_QUERY = '(min-width: 1024px)'

const useIsMdUp = () => {
    const getInitialValue = () => {
        if (typeof window === 'undefined') return true
        return window.matchMedia(MD_MEDIA_QUERY).matches
    }
    const [isMdUp, setIsMdUp] = useState(getInitialValue)

    useEffect(() => {
        if (typeof window === 'undefined') return undefined
        const mediaQuery = window.matchMedia(MD_MEDIA_QUERY)
        const handleChange = (event) => setIsMdUp(event.matches)
        setIsMdUp(mediaQuery.matches)
        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [])

    return isMdUp
}

const ProductPage = () => {
    const { id } = useParams()
    const { addToCart } = useCart()
    const isMdUp = useIsMdUp()
    const mainScrollRef = useRef(null)

    const { getProductById, product, productLoading, products } = useProduct()

    const [quantity, setQuantity] = useState(1)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [isAdded, setIsAdded] = useState(false)
    const [selectedVariant, setSelectedVariant] = useState(null)

    useEffect(() => {
        if (product?.variants?.length > 0) {
            setSelectedVariant(product.variants[0])
        }
    }, [product])

    const handleVariantSelect = useCallback((variant) => {
        setSelectedVariant(variant)
        setQuantity(1)
    }, [])

    useEffect(() => {
        if (id) {
            getProductById(id)
            window.scrollTo(0, 0)
        }
    }, [id, getProductById])

    const images = useMemo(() => {
        if (!product) return []
        const candidateImages = Array.isArray(product.imageUrls)
            ? product.imageUrls
            : product.imageUrl
              ? [product.imageUrl]
              : []
        return candidateImages.filter(Boolean)
    }, [product])

    const relatedProducts = useMemo(() => {
        if (!product || !products) return []
        return products
            .filter(
                (p) =>
                    p._id !== product._id &&
                    p.product_category === product.product_category &&
                    p.status?.trim().toUpperCase() === 'PUBLISHED',
            )
            .slice(0, 8)
    }, [products, product])

    const sizeGuide = product
        ? getSizeGuideByCategory(product.product_category)
        : null

    const careGuide = product
        ? getCareGuideByCategory(product.product_category)
        : null

    const materialText = product?.material?.trim()
    const productDetails = [
        {
            label: 'Material',
            value: materialText
                ? materialText.charAt(0).toUpperCase() + materialText.slice(1)
                : '',
        },
        { label: 'Tipo de Calce', value: product?.fit_type?.trim() },
        {
            label: 'Técnica de Decoración',
            value: product?.decoration_technique?.trim(),
        },
        { label: 'Especificaciones', value: product?.specifications?.trim() },
    ].filter((detail) => detail.value)

    const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1))
    const handleIncrement = () =>
        setQuantity((prev) => Math.min(selectedVariant?.stock ?? 1, prev + 1))

    const handleAddToCart = async () => {
        await addToCart(product, quantity, selectedVariant)
        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 1500)
    }

    // Sincroniza el índice de imagen con el scroll táctil en mobile
    const handleMainScroll = () => {
        const el = mainScrollRef.current
        if (!el) return
        const index = Math.round(el.scrollLeft / el.clientWidth)
        setSelectedImageIndex(index)
    }

    // Miniatura tocada: cambia el índice Y desliza la imagen grande hasta ahí
    const goToImageMobile = (idx) => {
        setSelectedImageIndex(idx)
        const el = mainScrollRef.current
        if (el) {
            el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' })
        }
    }

    const handleShare = async () => {
        const shareData = {
            title: product.name,
            text: `Mira ${product.name} en Nebadon Store`,
            url: window.location.href,
        }
        if (navigator.share) {
            try {
                await navigator.share(shareData)
            } catch {
                // Usuario canceló el panel de compartir, no hacemos nada
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href)
                toast.success('Link copiado al portapapeles')
            } catch {
                toast.error('No se pudo copiar el link')
            }
        }
    }

    if (productLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        )
    }

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

    return (
        <main className="min-h-screen bg-base-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
                    {/* ZONA IZQUIERDA: GALERÍA */}
                    {isMdUp ? (
                        <div className="flex flex-row gap-6">
                            {images.length > 1 && (
                                <div className="flex flex-col gap-4 overflow-y-auto w-24 shrink-0 scrollbar-hide snap-y">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() =>
                                                setSelectedImageIndex(idx)
                                            }
                                            className={`relative aspect-square w-full shrink-0 snap-start rounded-xl overflow-hidden border-2 transition-all duration-300 ${
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
                    ) : (
                        <div className="flex flex-col-reverse gap-4">
                            {images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => goToImageMobile(idx)}
                                            className={`relative aspect-square w-20 shrink-0 snap-start rounded-xl overflow-hidden border-2 transition-all duration-300 ${
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

                            {images.length > 0 ? (
                                <div
                                    ref={mainScrollRef}
                                    onScroll={handleMainScroll}
                                    className="flex aspect-square w-full bg-base-200/50 rounded-3xl overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                                >
                                    {images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            className="w-full shrink-0 snap-start flex items-center justify-center p-4"
                                        >
                                            <img
                                                src={img}
                                                alt={`${product.name} ${idx + 1}`}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="aspect-square w-full bg-base-200/50 rounded-3xl flex items-center justify-center text-base-content/50">
                                    Sin imagen
                                </div>
                            )}
                        </div>
                    )}

                    {/* ZONA DERECHA: INFO Y COMPRA */}
                    <div className="flex flex-col pt-4">
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold text-base-content/50 uppercase tracking-widest">
                                <span>
                                    SKU: {selectedVariant?.sku || 'N/A'}
                                </span>
                                <span className="opacity-40 font-light">|</span>
                                <span className="truncate text-primary">
                                    {product.franchise_name || 'Novedad'}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleShare}
                                className="btn btn-ghost btn-circle btn-sm text-base-content/60 hover:text-primary shrink-0"
                                aria-label="Compartir producto"
                            >
                                <Share2 className="h-4 w-4" />
                            </button>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-base-content tracking-tight leading-tight mb-4">
                            {product.name}
                        </h1>

                        <div className="flex items-baseline gap-4 mb-8">
                            <span className="text-3xl font-medium text-base-content">
                                {new Intl.NumberFormat('es-CL', {
                                    style: 'currency',
                                    currency: 'CLP',
                                }).format(
                                    selectedVariant?.price ??
                                        product.price ??
                                        0,
                                )}
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

                        <div className="flex flex-col gap-6">
                            <VariantSelector
                                variants={product.variants}
                                selectedVariant={selectedVariant}
                                onSelect={handleVariantSelect}
                            />

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
                                            quantity >=
                                            (selectedVariant?.stock ?? 0)
                                        }
                                        className="flex-1 h-full hover:bg-base-200 text-lg font-medium disabled:opacity-30"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={
                                        (selectedVariant?.stock ?? 0) === 0 ||
                                        isAdded
                                    }
                                    className={`btn flex-1 h-14 rounded-2xl text-sm uppercase tracking-widest font-bold border-none transition-all w-full ${
                                        isAdded
                                            ? 'bg-success text-success-content hover:bg-success'
                                            : 'btn-primary shadow-lg hover:shadow-xl'
                                    }`}
                                >
                                    {(selectedVariant?.stock ?? 0) === 0
                                        ? 'Agotado'
                                        : isAdded
                                          ? '✓ Agregado'
                                          : 'Agregar al Carrito'}
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-3 border-t border-base-200 pt-8">
                            <div className="collapse collapse-plus bg-base-100 border border-base-200 rounded-xl">
                                <input
                                    type="radio"
                                    name="product-accordion"
                                    defaultChecked
                                    onClick={(e) => e.target.blur()}
                                />
                                <div className="collapse-title text-sm font-semibold uppercase tracking-wider">
                                    Descripción del Producto
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

                            {(productDetails.length > 0 || careGuide) && (
                                <div className="collapse collapse-plus bg-base-100 border border-base-200 rounded-xl min-w-0">
                                    <input type="radio" name="product-accordion" onClick={(e) => e.target.blur()} />
                                    <div className="collapse-title text-sm font-semibold uppercase tracking-wider">
                                        Detalles del Producto y Cuidados
                                    </div>
                                    <div className="collapse-content text-sm text-base-content/80 min-w-0">
                                        {productDetails.length > 0 && (
                                            <>
                                                <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2 px-3">
                                                    Detalles
                                                </p>
                                                <div className="overflow-x-auto rounded-box border border-base-content/10">
                                                    <table className="table table-sm">
                                                        <tbody>
                                                            {productDetails.map((detail) => (
                                                                <tr key={detail.label} className="border-base-content/10">
                                                                    <td className="font-semibold whitespace-nowrap w-1/3">{detail.label}</td>
                                                                    <td className="text-base-content/80 whitespace-pre-line break-words">{detail.value}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </>
                                        )}

                                        {careGuide && (
                                            <div className={productDetails.length > 0 ? 'mt-4 pt-4 border-t border-base-content/10' : ''}>
                                                <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2 px-2">
                                                    Cuidados
                                                </p>
                                                <div className="overflow-x-auto rounded-box border border-base-content/10">
                                                    <table className="table table-xs">
                                                        <tbody>
                                                            {careGuide.items.map((item) => (
                                                                <tr key={item.label} className="border-base-content/10">
                                                                    <td className="w-8">
                                                                        <item.icon
                                                                            className="h-4 w-4 text-primary"
                                                                            aria-label={item.label}
                                                                            role="img"
                                                                        />
                                                                    </td>
                                                                    <td className="text-base-content/70">{item.text}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <Link
                                                    to={`/guia-cuidados#${product.product_category}`}
                                                    state={{ from: 'product' }}
                                                    className="link link-primary text-sm font-semibold mt-2 inline-block"
                                                >
                                                    Ver guía completa de cuidados →
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {sizeGuide && (
                                <div className="collapse collapse-plus bg-base-100 border border-base-200 rounded-xl min-w-0">
                                    <input
                                        type="radio"
                                        name="product-accordion"
                                        onClick={(e) => e.target.blur()}
                                    />
                                    <div className="collapse-title text-sm font-semibold uppercase tracking-wider">
                                        Tallas y Medidas
                                    </div>
                                    <div className="collapse-content text-sm text-base-content/80 min-w-0">
                                        <div className="overflow-x-auto rounded-box border border-base-content/10">
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr className="bg-neutral text-neutral-content">
                                                        {sizeGuide.columns.map(
                                                            (col) => (
                                                                <th
                                                                    key={col}
                                                                    className="text-xs"
                                                                >
                                                                    {col}
                                                                </th>
                                                            ),
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sizeGuide.rows.map(
                                                        (row, i) => (
                                                            <tr key={i} className="border-base-content/10">
                                                                {row.map(
                                                                    (
                                                                        cell,
                                                                        j,
                                                                    ) => (
                                                                        <td
                                                                            key={
                                                                                j
                                                                            }
                                                                            className={j === 0 ? 'font-semibold' : undefined}
                                                                        >
                                                                            {
                                                                                cell
                                                                            }
                                                                        </td>
                                                                    ),
                                                                )}
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        {sizeGuide.note && (
                                            <p className="mt-3 font-semibold text-base-content">
                                                {sizeGuide.note}
                                            </p>
                                        )}
                                        <p className="mt-3 text-xs text-base-content/60">
                                            Las medidas pueden tener una
                                            variación de 1 a 2 cm debido a la
                                            confección. Si estás entre dos
                                            tallas, te recomendamos elegir la
                                            más grande para mayor comodidad.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="collapse collapse-plus bg-base-100 border border-base-200 rounded-xl">
                                <input type="radio" name="product-accordion" onClick={(e) => e.target.blur()} />
                                <div className="collapse-title text-sm font-semibold uppercase tracking-wider">
                                    Detalles de Envío y Entregas
                                </div>
                                <div className="collapse-content text-sm text-base-content/80 space-y-4">
                                    <div className="flex items-center gap-3 flex-wrap text-2xl mb-2">
                                        <span title="Envíos a todo Chile">📦</span>
                                        <span title="Express en Santiago">🛵</span>
                                        <span title="Retiro y entrega presencial">🤝</span>
                                    </div>
                                    <Link
                                        to="/envios-y-entregas"
                                        state={{ from: 'product' }}
                                        className="link link-primary text-sm font-semibold"
                                    >
                                        Ver detalles de envíos y entregas →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                    <div className="mt-24 pt-12 border-t border-base-200">
                        <ProductSection
                            title="Explora más diseños increíbles"
                            products={relatedProducts}
                            verMasHref="/shop"
                        />
                    </div>
                )}
            </div>
        </main>
    )
}

export default ProductPage
