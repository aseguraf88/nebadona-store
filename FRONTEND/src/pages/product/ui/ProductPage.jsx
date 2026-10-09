import { useState, useEffect, useMemo, useCallback, useRef, useId } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Share2 } from 'lucide-react'
import {
    useCart,
    useAddToCartFeedback,
    ADD_TO_CART_LABELS,
    ADD_TO_CART_CLASSES,
} from '../../../entities/cart'
import {
    useProduct,
    isSockCategory,
    hasStock,
    pickInitialVariant,
} from '../../../entities/product'
import VariantSelector from '../../../entities/product/ui/VariantSelector'
import { ProductSection } from '../../../widgets/catalog'
import { getSizeGuideByCategory } from '../../../entities/product/config/sizeGuides'
import { getCareGuideByCategory } from '../../../entities/product/config/careGuides'
import { getSizeStandardById } from '../../../entities/product/config/sizeStandardOptions'
import { PRODUCT_DELIVERY_HIGHLIGHTS } from '../../../shared/config/shipping'

const MD_MEDIA_QUERY = '(min-width: 1024px)'

// Valores de franquicia que en realidad significan "sin franquicia" (diseños
// sueltos, que no pertenecen a ninguna familia). Para los relacionados se
// tratan igual que null o ''. Van ya normalizados (ver normalizeKey: sin
// tildes ni ñ). 'random' es el nombre anterior de "Diseños originales"; se
// deja para que los productos funcionen igual antes y después de renombrarla
const NO_FRANCHISE_VALUES = ['random', 'disenos originales']

// Cuántos productos muestra "Explora más diseños" (2 páginas de 4 en desktop)
const RELATED_LIMIT = 8

// Para comparar franquicias y categorías: minúscula, sin tildes y con los
// espacios unificados (por CSV podría entrar "pokémon" junto a "pokemon")
const normalizeKey = (value) =>
    (value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()

const franchiseKey = (product) => {
    const key = normalizeKey(product?.franchise_name)
    return NO_FRANCHISE_VALUES.includes(key) ? '' : key
}

// Número fijo para el par (producto que se ve, candidato). Da un orden "al
// azar" que no cambia con los re-renders (elegir talla, cantidad, recargar),
// pero sí entre fichas. Es un hash FNV-1a del texto "idActual:idCandidato"
const stableRank = (seed, id) => {
    let hash = 2166136261
    for (const char of `${seed}:${id}`) {
        hash ^= char.charCodeAt(0)
        hash = Math.imul(hash, 16777619)
    }
    return hash >>> 0
}

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

// Acordeón independiente, con su propio estado: cada uno se abre y se cierra
// solo. Reemplaza los <input type="radio"> nativos, que funcionaban como
// grupo (solo uno abierto, sin poder cerrarlo) y hacían saltar el scroll: al
// abrir uno se cerraba el de arriba y toda la página se corría hacia arriba
const ProductAccordion = ({
    title,
    defaultOpen = false,
    className = '',
    contentClassName = '',
    children,
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)
    const id = useId()
    const titleId = `${id}-title`
    const contentId = `${id}-content`

    return (
        <div
            className={`collapse collapse-plus bg-base-100 border border-base-200 rounded-xl ${
                isOpen ? 'collapse-open' : 'collapse-close'
            } ${className}`}
        >
            <button
                type="button"
                id={titleId}
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={() => setIsOpen((open) => !open)}
                className="collapse-title text-sm font-semibold uppercase tracking-wider text-left w-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
            >
                {title}
            </button>
            <div
                id={contentId}
                role="region"
                aria-labelledby={titleId}
                className={`collapse-content ${contentClassName}`}
            >
                {children}
            </div>
        </div>
    )
}

const ProductPage = () => {
    const { id } = useParams()
    const { addToCart } = useCart()
    const isMdUp = useIsMdUp()
    const mainScrollRef = useRef(null)

    const { getProductById, product, productLoading, products } = useProduct()

    const [quantity, setQuantity] = useState(1)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [selectedVariant, setSelectedVariant] = useState(null)

    useEffect(() => {
        // La primera variante con stock (antes, siempre la primera: si estaba
        // agotada, la ficha abría en "Agotado" aunque hubiera otras tallas)
        if (product?.variants?.length > 0) {
            setSelectedVariant(pickInitialVariant(product.variants))
        }
        // Producto nuevo: la cantidad vuelve a 1 (al navegar de una ficha a
        // otra, el componente se reutiliza y arrastraba la cantidad anterior)
        setQuantity(1)
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

    // "Explora más diseños": primero la misma franquicia, después la misma
    // categoría y después el resto, hasta RELATED_LIMIT. Dentro de cada
    // grupo, primero los que tienen stock y después un orden "al azar" fijo
    // para esta ficha. Sin el producto actual y solo publicados
    const relatedProducts = useMemo(() => {
        if (!product?._id || !products) return []

        const ownFranchise = franchiseKey(product)
        const ownCategory = normalizeKey(product.product_category)
        const groupOf = (p) => {
            if (ownFranchise && franchiseKey(p) === ownFranchise) return 0
            if (normalizeKey(p.product_category) === ownCategory) return 1
            return 2
        }

        return products
            .filter(
                (p) =>
                    p._id !== product._id &&
                    p.status?.trim().toUpperCase() === 'PUBLISHED',
            )
            .map((p) => ({
                p,
                group: groupOf(p),
                soldOut: hasStock(p) ? 0 : 1,
                rank: stableRank(product._id, p._id),
            }))
            .sort(
                (a, b) =>
                    a.group - b.group ||
                    a.soldOut - b.soldOut ||
                    a.rank - b.rank,
            )
            .slice(0, RELATED_LIMIT)
            .map(({ p }) => p)
    }, [products, product])

    const sizeGuide = product
        ? getSizeGuideByCategory(product.product_category)
        : null

    // Estándar de talla del producto (solo calcetines). Bebé, niño y Talla
    // Única muestran el de ESTE producto en vez de la tabla genérica;
    // 'internacional' y sin estándar siguen con la tabla de siempre.
    const sockStandard =
        product && isSockCategory(product.product_category)
            ? getSizeStandardById(product.size_standard)
            : null
    const isCustomRange = sockStandard?.id === 'personalizado'
    const standardSummary =
        sockStandard && sockStandard.id !== 'internacional'
            ? [
                  {
                      label: 'Estándar',
                      value: isCustomRange ? 'Talla Única' : sockStandard.label,
                  },
                  {
                      label: 'Talla de calzado (EU)',
                      value: isCustomRange
                          ? product.size_range_min && product.size_range_max
                              ? `${product.size_range_min} - ${product.size_range_max}`
                              : ''
                          : sockStandard.euRange,
                  },
              ].filter((row) => row.value)
            : null
    // Ancla de la Guía de Tallas según el grupo del estándar
    const sizeGuideAnchor =
        { babies: 'bebes', kids: 'ninos' }[sockStandard?.gender] || 'adultos'

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
        { label: 'Código', value: selectedVariant?.sku },
    ].filter((detail) => detail.value)

    // Etiqueta sobre el título: la franquicia; si no tiene, la categoría; si
    // tampoco, nada. Sin NO_FRANCHISE_VALUES: "Diseños originales" se muestra
    // como franquicia (NO_FRANCHISE_VALUES es solo para "Explora más diseños")
    const franchiseLabel = product?.franchise_name || product?.product_category

    const isSoldOut = !hasStock(product)
    const selectedHasStock = (selectedVariant?.stock ?? 0) > 0

    const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1))
    const handleIncrement = () =>
        setQuantity((prev) => Math.min(selectedVariant?.stock ?? 1, prev + 1))

    const feedback = useAddToCartFeedback(() =>
        addToCart(product, quantity, selectedVariant),
    )

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
                <h1 className="text-2xl font-bold">Producto no disponible</h1>
                <p className="text-base-content/70">
                    Este producto no existe o ya no está disponible.
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
                        // self-start: sin esto, el grid estira la galería al alto de la
                        // columna de información (crece al abrir los acordeones);
                        // items-start: la imagen conserva su forma cuadrada aunque
                        // la columna de miniaturas sea más alta; sticky: la galería
                        // queda a la vista mientras se baja por la información
                        <div className="flex flex-row items-start gap-6 lg:self-start lg:sticky lg:top-28">
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
                        <div className="flex items-start justify-between gap-2 mb-3">
                            {franchiseLabel ? (
                                <p className="min-w-0 break-words pt-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                                    {franchiseLabel}
                                </p>
                            ) : (
                                <span aria-hidden="true" />
                            )}
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
                            {isSoldOut && (
                                <span className="badge badge-error self-center font-bold uppercase tracking-widest text-xs">
                                    Agotado
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
                                {/* Sin stock: sin contador (antes mostraba un 1 junto a "Agotado") */}
                                {selectedHasStock && (
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
                                )}

                                <button
                                    type="button"
                                    onClick={() => feedback.trigger()}
                                    // Ya no se desactiva en "Listo" (DaisyUI lo pintaba gris);
                                    // el hook ignora los clics mientras tanto
                                    disabled={!selectedHasStock}
                                    aria-disabled={feedback.isBusy}
                                    className={`btn flex-1 h-14 rounded-2xl text-sm uppercase tracking-widest font-bold border-none w-full ${ADD_TO_CART_CLASSES.transition} ${
                                        !selectedHasStock
                                            ? ADD_TO_CART_CLASSES.soldOut
                                            : feedback.status === 'added'
                                              ? ADD_TO_CART_CLASSES.added
                                              : 'btn-primary shadow-lg hover:shadow-xl'
                                    }`}
                                >
                                    {!selectedHasStock
                                        ? ADD_TO_CART_LABELS.soldOut
                                        : feedback.status === 'added'
                                          ? `✓ ${ADD_TO_CART_LABELS.added}`
                                          : ADD_TO_CART_LABELS.idle}
                                </button>
                                <span className="sr-only" aria-live="polite">
                                    {feedback.status === 'added' ? 'Agregado al carrito' : ''}
                                </span>
                            </div>

                            {/* Franja de entrega (shared/config/shipping.js): cada
                                línea con su ícono y su texto, nunca íconos solos,
                                una debajo de la otra en todos los anchos. -mt-2:
                                más cerca que el gap-6 del bloque */}
                            <div className="-mt-2 flex flex-col gap-3">
                                <ul className="flex flex-col gap-2">
                                    {PRODUCT_DELIVERY_HIGHLIGHTS.map((item) => (
                                        <li
                                            key={item.strong}
                                            className="flex items-center gap-2 text-xs text-base-content/70"
                                        >
                                            <item.icon
                                                aria-hidden="true"
                                                className="h-4 w-4 shrink-0 text-primary"
                                            />
                                            <span>
                                                <strong className="font-semibold text-base-content">
                                                    {item.strong}
                                                </strong>{' '}
                                                {item.rest}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to="/envios-y-entregas"
                                    state={{ from: 'product' }}
                                    className="link link-primary text-xs font-semibold self-start"
                                >
                                    ¿Cómo recibo mi pedido? →
                                </Link>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-3 border-t border-base-200 pt-8">
                            <ProductAccordion
                                title="Descripción"
                                defaultOpen
                                contentClassName="text-sm text-base-content/80 leading-relaxed"
                            >
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
                            </ProductAccordion>

                            {(productDetails.length > 0 || careGuide) && (
                                <ProductAccordion
                                    title="Detalles"
                                    className="min-w-0"
                                    contentClassName="text-sm text-base-content/80 min-w-0"
                                >
                                        {productDetails.length > 0 && (
                                            <div className="overflow-x-auto rounded-lg border border-base-content/10">
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
                                        )}

                                        {careGuide && (
                                            <Link
                                                to={`/guia-cuidados#${product.product_category}`}
                                                state={{ from: 'product' }}
                                                className={`link link-primary text-sm font-semibold inline-block ${productDetails.length > 0 ? 'mt-3' : ''}`}
                                            >
                                                Ver guía de cuidados →
                                            </Link>
                                        )}
                                </ProductAccordion>
                            )}

                            {sizeGuide && (
                                <ProductAccordion
                                    title="Tallas"
                                    className="min-w-0"
                                    contentClassName="text-sm text-base-content/80 min-w-0"
                                >
                                        {standardSummary ? (
                                            <div className="overflow-x-auto rounded-lg border border-base-content/10">
                                                <table className="table table-sm">
                                                    <tbody>
                                                        {standardSummary.map((row) => (
                                                            <tr key={row.label} className="border-base-content/10">
                                                                <td className="font-semibold whitespace-nowrap w-1/3">{row.label}</td>
                                                                <td className="text-base-content/80">{row.value}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="overflow-x-auto rounded-lg border border-base-content/10">
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
                                            </>
                                        )}
                                        {sockStandard && (
                                            <Link
                                                to={`/guia-tallas#${sizeGuideAnchor}`}
                                                state={{ from: 'product' }}
                                                className="link link-primary text-sm font-semibold mt-3 inline-block"
                                            >
                                                Ver guía de tallas completa →
                                            </Link>
                                        )}
                                </ProductAccordion>
                            )}
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
