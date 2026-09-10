import { useMemo, useState } from 'react'
import { useCart } from '../../cart/model/CartContext'
import { Link } from 'react-router-dom'
import ProductDetailModal from '../../../widgets/product-detail-modal/ui/ProductDetailModal'

const ProductCard = ({ product }) => {
    const {
        _id,
        name,
        imageUrl,
        imageUrls,
        description,
        price,
        stock,
        product_category,
        sku,
        franchise_name,
        tags,
    } = product

    const { addToCart } = useCart()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isAdded, setIsAdded] = useState(false)

    const images = useMemo(() => {
        const candidateImages = Array.isArray(imageUrls)
            ? imageUrls
            : imageUrl
              ? [imageUrl]
              : []
        return candidateImages.filter(Boolean).slice(0, 6)
    }, [imageUrl, imageUrls])

    const currentImage = images[0] || ''

    const totalStock = (product.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0)

    const handleAddToCart = async (event, quantityFromModal = 1, variantFromModal = null) => {
        if (event) {
            event.preventDefault()
            event.stopPropagation()
        }

        const variant = variantFromModal ?? product.variants?.[0] ?? null

        // 🔥 Payload blindado con los nombres oficiales
        await addToCart(
            {
                _id,
                name,
                price,
                imageUrl: currentImage || imageUrl,
                imageUrls: images,
                description,
                variants: product.variants,
                product_category: product_category || 'Sin categoría',
                sku: sku || 'SIN-SKU',
            },
            quantityFromModal,
            variant,
        )

        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 1000)
    }

    const handleOpenModal = (e) => {
        if (e) {
            e.preventDefault()
            e.stopPropagation()
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => setIsModalOpen(false)

    const formatPrice = (amount) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
        }).format(amount || 0)
    }

    const seoAltText =
        `${name} ${product_category || 'calcetas'} divertidas regalo ${franchise_name || ''} ${(tags || []).join(' ')}`
            .trim()
            .replace(/\s+/g, ' ')

    const productUrl = `/product/${product._id}`

    return (
        <>
            {/* 🔥 TARJETA BOUTIQUE: Borde sutil, esquinas 2xl, sombra elegante en hover */}
            <article
                data-product-card
                className="card w-full h-full bg-base-100 border border-base-200/60 hover:border-base-300 hover:shadow-lg transition-all duration-500 group relative flex flex-col rounded-2xl"
            >
                <Link
                    to={productUrl}
                    className="flex flex-col h-full w-full outline-none"
                >
                    {/* ZONA DE IMAGEN */}
                    <figure className="relative aspect-square w-full overflow-hidden bg-base-200/30 rounded-t-2xl">
                        {images.length > 0 ? (
                            <>
                                <img
                                    src={images[0]}
                                    alt={seoAltText}
                                    className={`w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105 ${images.length > 1 ? 'group-hover:opacity-0' : ''}`}
                                />
                                {images.length > 1 && (
                                    <img
                                        src={images[1]}
                                        alt={`${seoAltText} en uso`}
                                        className="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-700 ease-in-out group-hover:opacity-100 group-hover:scale-105"
                                    />
                                )}
                            </>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-base-content/40">
                                Sin imagen
                            </div>
                        )}

                        {/* BOTÓN VISTA RÁPIDA */}
                        <button
                            type="button"
                            onClick={handleOpenModal}
                            className="absolute top-3 right-3 z-20 btn btn-circle btn-sm bg-base-100/90 backdrop-blur-sm border-none shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hidden sm:flex hover:bg-primary hover:text-primary-content text-base-content/70"
                            aria-label="Vista rápida"
                            title="Vista rápida"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-4 h-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                        </button>

                        {/* 🔥 BOTÓN AGREGAR */}
                        <div className="absolute bottom-3 left-3 right-3 z-20 overflow-hidden rounded-xl">
                            <button
                                onClick={product.variants?.length > 1 ? handleOpenModal : handleAddToCart}
                                disabled={totalStock === 0 || isAdded}
                                className={`w-full py-2.5 flex items-center justify-center backdrop-blur-md transition-all duration-300 rounded-xl shadow-md sm:translate-y-12 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 ${
                                    isAdded
                                        ? 'bg-success text-success-content'
                                        : 'bg-base-100/95 text-base-content active:bg-primary active:text-primary-content sm:hover:bg-primary sm:hover:text-primary-content'
                                }`}
                            >
                                {totalStock === 0 ? (
                                    <span className="text-[11px] font-bold text-error uppercase tracking-widest">
                                        Agotado
                                    </span>
                                ) : isAdded ? (
                                    <span className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                                        <span className="text-sm leading-none font-normal">
                                            ✓
                                        </span>{' '}
                                        Listo
                                    </span>
                                ) : (
                                    <span className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                                        <span className="text-sm leading-none font-normal">
                                            +
                                        </span>{' '}
                                        {product.variants?.length > 1 ? 'Elegir' : 'Agregar'}
                                    </span>
                                )}
                            </button>
                        </div>
                    </figure>

                    {/* BLOQUE INFERIOR DE TEXTO */}
                    <div className="flex flex-col flex-grow items-center text-center p-4 w-full bg-base-100 rounded-b-2xl">
                        <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest leading-none mb-2">
                            {franchise_name || 'Novedad'}
                        </span>

                        <h2 className="text-sm font-semibold text-base-content line-clamp-2 leading-tight w-full mb-3 group-hover:text-primary transition-colors">
                            {name}
                        </h2>

                        <span className="text-sm font-bold text-base-content mt-auto">
                            {formatPrice(price)}
                        </span>
                    </div>
                </Link>
            </article>

            <ProductDetailModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                product={{ ...product, imageUrls: images }}
                onAddToCart={handleAddToCart}
            />
        </>
    )
}

export default ProductCard
