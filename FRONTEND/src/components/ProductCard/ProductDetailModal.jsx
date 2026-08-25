import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom' // 🔥 NUEVO: Importamos Link para viajar a la página

const ProductDetailModal = ({ product, isOpen, onClose, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)

    // 🔥 NUEVO: Estado para el botón de compartir
    const [isCopied, setIsCopied] = useState(false)

    const images = useMemo(() => {
        const candidateImages = Array.isArray(product?.imageUrls)
            ? product.imageUrls
            : product?.imageUrl
              ? [product.imageUrl]
              : []
        return candidateImages.filter(Boolean)
    }, [product])

    useEffect(() => {
        if (isOpen) {
            setQuantity(1)
            setSelectedImageIndex(0)
            setIsCopied(false) // Reseteamos el estado de copiado al abrir
        }
    }, [isOpen])

    const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1))
    const handleIncrement = () =>
        setQuantity((prev) => Math.min(product?.stock || 1, prev + 1))

    // 🔥 NUEVO: Función para copiar el enlace al portapapeles
    const handleShare = async () => {
        // Armamos la URL real usando la dirección de la tienda y el ID del producto
        const url = `${window.location.origin}/product/${product._id}`
        try {
            await navigator.clipboard.writeText(url)
            setIsCopied(true)
            // Volvemos el ícono a la normalidad después de 2 segundos
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error('Error al copiar:', err)
        }
    }

    if (!isOpen || !product) return null

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 transition-opacity"
            onClick={onClose}
        >
            <div
                className="bg-base-100 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 z-10 bg-base-100/50 backdrop-blur-md hover:bg-base-200"
                    aria-label="Cerrar modal"
                >
                    ✕
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 p-6 sm:p-8">
                    {/* COLUMNA IZQUIERDA: GALERÍA (Se mantiene igual) */}
                    <div className="flex flex-col gap-4">
                        <figure className="aspect-square w-full bg-base-200 rounded-2xl overflow-hidden relative group">
                            {images.length > 0 ? (
                                <img
                                    src={images[selectedImageIndex]}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex w-full h-full items-center justify-center text-base-content/50">
                                    Sin imagen
                                </div>
                            )}
                        </figure>

                        {images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() =>
                                            setSelectedImageIndex(idx)
                                        }
                                        className={`relative aspect-square w-16 sm:w-20 shrink-0 snap-start rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                                            selectedImageIndex === idx
                                                ? 'border-primary opacity-100'
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
                    </div>

                    {/* COLUMNA DERECHA: INFORMACIÓN */}
                    <div className="flex flex-col pt-6 md:pt-0">
                        <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold text-base-content/50 uppercase tracking-widest mb-2 pr-8 sm:pr-12">
                            <span className="shrink-0">
                                SKU: {product.sku || 'N/A'}
                            </span>
                            <span className="truncate ml-4 text-right">
                                {product.franchise_name || 'Novedad'}
                            </span>
                        </div>

                        {/* 🔥 NUEVO: Contenedor Flex para Título + Botón Compartir */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <h1 className="text-2xl sm:text-3xl text-base-content tracking-tight leading-snug">
                                {product.name}
                            </h1>

                            {/* Botón de Compartir */}
                            <button
                                onClick={handleShare}
                                className="btn btn-ghost btn-circle btn-sm mt-1 shrink-0 tooltip tooltip-left"
                                data-tip={
                                    isCopied
                                        ? '¡Enlace copiado!'
                                        : 'Copiar enlace'
                                }
                                aria-label="Compartir producto"
                            >
                                {isCopied ? (
                                    // Ícono de Check (Éxito)
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-success"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                ) : (
                                    // Ícono de Compartir/Enlace
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-base-content/70"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-2xl text-base-content">
                                {new Intl.NumberFormat('es-CL', {
                                    style: 'currency',
                                    currency: 'CLP',
                                }).format(product.price || 0)}
                            </span>
                        </div>

                        <div className="divider my-0 mb-6 opacity-30"></div>

                        {/* Controles de Compra (Se mantienen igual) */}
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-base-content/70 uppercase tracking-widest">
                                    Talla
                                </span>
                                <div className="badge badge-outline p-4 rounded-lg font-medium text-base-content border-base-300">
                                    Única (36 - 43)
                                </div>
                            </div>

                            <div className="flex items-center gap-3 sm:gap-4 mt-2">
                                <div className="flex items-center border border-base-300 rounded-xl h-12 w-28 sm:w-32 bg-base-100 overflow-hidden shrink-0">
                                    <button
                                        type="button"
                                        onClick={handleDecrement}
                                        className="flex-1 h-full hover:bg-base-200 transition-colors text-base-content/70 font-medium"
                                    >
                                        -
                                    </button>
                                    <span className="flex-1 text-center font-semibold text-base-content">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleIncrement}
                                        disabled={
                                            quantity >= (product.stock || 0)
                                        }
                                        className="flex-1 h-full hover:bg-base-200 transition-colors text-base-content/70 font-medium disabled:opacity-30"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-primary flex-1 h-12 rounded-xl text-xs sm:text-sm uppercase tracking-widest font-bold border-none shadow-sm hover:shadow-md transition-all"
                                    onClick={(e) => onAddToCart(e, quantity)}
                                    disabled={product.stock === 0}
                                >
                                    {product.stock === 0
                                        ? 'Agotado'
                                        : 'Agregar'}
                                </button>
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="mt-8 flex-1">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-base-content mb-3 border-b border-base-200 pb-2">
                                Detalles del Diseño
                            </h3>
                            <div className="prose prose-sm text-base-content/70 leading-relaxed max-h-24 overflow-y-auto pr-2">
                                <p>
                                    {product.description ||
                                        'Calcetas de alta calidad con un diseño increíblemente detallado, perfectas para uso diario.'}
                                </p>
                            </div>
                        </div>

                        {/* 🔥 NUEVO: Link a la página completa */}
                        <div className="mt-6 pt-4 border-t border-base-200">
                            <Link
                                to={`/product/${product._id}`}
                                onClick={onClose} // Cierra el modal justo al momento de viajar
                                className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/70 transition-colors group"
                            >
                                Ver detalles completos
                                <span className="group-hover:translate-x-1 transition-transform duration-300">
                                    →
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetailModal
