import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Share2 } from 'lucide-react'
import { useCart } from '../../../entities/cart'
import { useProduct } from '../../../entities/product'
import VariantSelector from '../../../entities/product/ui/VariantSelector'
import { ProductSection } from '../../../widgets/catalog'
import { getSizeGuideByCategory } from '../../../entities/product/config/sizeGuides'

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

    const sizeGuide = product ? getSizeGuideByCategory(product.product_category) : null

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

                            <div className="collapse collapse-plus bg-base-100 border border-base-200 rounded-xl">
                                <input type="radio" name="product-accordion" />
                                <div className="collapse-title text-sm font-semibold uppercase tracking-wider">
                                    Detalles del Producto, Materiales y Cuidados
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

                            {sizeGuide && (
                                <div className="collapse collapse-plus bg-base-100 border border-base-200 rounded-xl">
                                    <input type="radio" name="product-accordion" />
                                    <div className="collapse-title text-sm font-semibold uppercase tracking-wider">
                                        Tallas y Medidas
                                    </div>
                                    <div className="collapse-content text-sm text-base-content/80">
                                        <div className="overflow-x-auto">
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        {sizeGuide.columns.map((col) => (
                                                            <th key={col} className="text-xs">{col}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sizeGuide.rows.map((row, i) => (
                                                        <tr key={i}>
                                                            {row.map((cell, j) => (
                                                                <td key={j}>{cell}</td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {sizeGuide.note && (
                                            <p className="mt-3 font-semibold text-base-content">
                                                {sizeGuide.note}
                                            </p>
                                        )}
                                        <p className="mt-3 text-xs text-base-content/60">
                                            Las medidas pueden tener una variación de 1 a 2 cm debido a
                                            la confección. Si estás entre dos tallas, te recomendamos
                                            elegir la más grande para mayor comodidad.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="collapse collapse-plus bg-base-100 border border-base-200 rounded-xl">
                                <input type="radio" name="product-accordion" />
                                <div className="collapse-title text-sm font-semibold uppercase tracking-wider">
                                    Detalles de Envío y Entregas
                                </div>
                                <div className="collapse-content text-sm text-base-content/80 space-y-4">
                                    <p>
                                        Para brindarte el mejor servicio y adaptarnos a tu
                                        disponibilidad, todas las entregas y envíos se coordinan
                                        directamente por interno (WhatsApp) al momento de confirmar
                                        tu compra. Contamos con las siguientes modalidades para que
                                        elijas la que más te acomode:
                                    </p>

                                    <ul className="space-y-3">
                                        <li>
                                            📦{' '}
                                            <strong className="text-base-content">
                                                Envíos por Agencia (Todo el país):
                                            </strong>{' '}
                                            Despachamos a través de Starken, Chilexpress o
                                            Bluexpress. Los envíos se realizan en modalidad por
                                            pagar (pagas el envío al recibir) o sumando el costo al
                                            total de tu pedido, según la agencia.
                                        </li>
                                        <li>
                                            🛵{' '}
                                            <strong className="text-base-content">
                                                Envíos Express (Solo Santiago):
                                            </strong>{' '}
                                            Si necesitas tu pedido el mismo día o de forma rápida,
                                            podemos enviarlo a través de aplicaciones de delivery
                                            como Uber Entregas o DiDi Entregas. El costo dependerá
                                            de la tarifa de la app en el momento.
                                        </li>
                                        <li>
                                            🤝{' '}
                                            <strong className="text-base-content">
                                                Entregas Presenciales:
                                            </strong>{' '}
                                            Coordinamos en las estaciones de metro Ciudad del Niño
                                            (Línea 2) o Mirador (Línea 5), en un horario que nos
                                            acomode a ambos.
                                        </li>
                                        <li>
                                            🏠{' '}
                                            <strong className="text-base-content">
                                                Retiro en Bodega/Domicilio:
                                            </strong>{' '}
                                            Si prefieres, puedes venir a retirar tu pedido
                                            directamente a nuestras instalaciones ubicadas en La
                                            Granja de manera gratuita, previa coordinación de día y
                                            hora.
                                        </li>
                                    </ul>

                                    <p>
                                        Una vez que agregues tus productos al carrito y nos
                                        contactes por WhatsApp, acordaremos juntos el método que
                                        prefieras.
                                    </p>

                                    <div className="rounded-xl border border-warning/40 bg-warning/10 p-4">
                                        <p className="font-bold text-warning-content mb-1">
                                            ⚠️ IMPORTANTE
                                        </p>
                                        <p>
                                            Por el momento, no realizamos cambios ni devoluciones por
                                            gusto, talla o color — te recomendamos revisar con
                                            atención la guía de tallas y las fotos antes de comprar.
                                            Si tu pedido llega con un defecto de fabricación o daño
                                            de transporte, contactanos dentro de las 48 horas de
                                            recibido.
                                        </p>
                                    </div>
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
