import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from '../../../entities/product'

const MOBILE_ITEMS_PER_PAGE = 2
const DESKTOP_ITEMS_PER_PAGE = 4
const MD_MEDIA_QUERY = '(min-width: 768px)'

const chunkProducts = (products, itemsPerPage) => {
    if (!Array.isArray(products) || products.length === 0) {
        return []
    }
    const chunks = []
    for (let index = 0; index < products.length; index += itemsPerPage) {
        chunks.push(products.slice(index, index + itemsPerPage))
    }
    return chunks
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

const ProductCarousel = ({ products = [] }) => {
    const isMdUp = useIsMdUp()
    const [currentPageIndex, setCurrentPageIndex] = useState(0)
    const scrollRef = useRef(null)

    // --- MOBILE: scroll táctil real con puntitos aproximados ---
    const mobilePages = useMemo(
        () => chunkProducts(products, MOBILE_ITEMS_PER_PAGE),
        [products],
    )
    const mobileTotalPaginas = mobilePages.length

    const handleMobileScroll = () => {
        const el = scrollRef.current
        if (!el || mobileTotalPaginas <= 1) return
        const maxScroll = el.scrollWidth - el.clientWidth
        const fraction = maxScroll > 0 ? el.scrollLeft / maxScroll : 0
        const estimatedPage = Math.round(fraction * (mobileTotalPaginas - 1))
        setCurrentPageIndex(
            Math.max(0, Math.min(mobileTotalPaginas - 1, estimatedPage)),
        )
    }

    const goToPageMobile = (pageIndex) => {
        const el = scrollRef.current
        if (!el || mobileTotalPaginas <= 1) return
        const maxScroll = el.scrollWidth - el.clientWidth
        el.scrollTo({
            left: (pageIndex / (mobileTotalPaginas - 1)) * maxScroll,
            behavior: 'smooth',
        })
    }

    // --- DESKTOP: mismo mecanismo de páginas por clic de siempre, sin tocar ---
    const desktopPages = useMemo(
        () => chunkProducts(products, DESKTOP_ITEMS_PER_PAGE),
        [products],
    )
    const desktopTotalPaginas = desktopPages.length

    useEffect(() => {
        if (!isMdUp) return
        if (desktopTotalPaginas === 0) {
            setCurrentPageIndex(0)
            return
        }
        if (currentPageIndex > desktopTotalPaginas - 1) {
            setCurrentPageIndex(desktopTotalPaginas - 1)
        }
    }, [isMdUp, currentPageIndex, desktopTotalPaginas])

    if (!isMdUp) {
        return (
            <section className="w-full">
                <div
                    ref={scrollRef}
                    onScroll={handleMobileScroll}
                    className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                >
                    {products.map((product, index) => (
                        <div
                            key={
                                product?._id ||
                                `${product?.name || 'product'}-${index}`
                            }
                            className="w-[47%] shrink-0 snap-start"
                        >
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>

                {mobileTotalPaginas > 1 && (
                    <div className="mt-3 flex items-center justify-center gap-2">
                        {mobilePages.map((_, pageIndex) => (
                            <button
                                key={`page-${pageIndex}`}
                                type="button"
                                onClick={() => goToPageMobile(pageIndex)}
                                className={`h-2.5 w-2.5 rounded-full ${
                                    currentPageIndex === pageIndex
                                        ? 'bg-primary'
                                        : 'bg-base-300'
                                }`}
                                aria-label={`Ir a la página ${pageIndex + 1}`}
                            />
                        ))}
                    </div>
                )}
            </section>
        )
    }

    const hasPrevPage = currentPageIndex > 0
    const hasNextPage = currentPageIndex < desktopTotalPaginas - 1
    const currentProducts = desktopPages[currentPageIndex] || []

    return (
        <section className="w-full">
            <div className="grid grid-cols-4 grid-rows-1 gap-4">
                {currentProducts.map((product, index) => (
                    <ProductCard
                        key={
                            product?._id ||
                            `${product?.name || 'product'}-${index}`
                        }
                        product={product}
                    />
                ))}
            </div>

            {desktopTotalPaginas > 0 && (
                <>
                    <div className="mt-6 flex items-center justify-center gap-4">
                        <button
                            type="button"
                            onClick={() => setCurrentPageIndex((prev) => prev - 1)}
                            className={`rounded-full border border-base-300 p-2 transition-opacity ${
                                !hasPrevPage ? 'opacity-40 pointer-events-none' : ''
                            }`}
                            aria-label="Página anterior"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setCurrentPageIndex((prev) => prev + 1)}
                            className={`rounded-full border border-base-300 p-2 transition-opacity ${
                                !hasNextPage ? 'opacity-40 pointer-events-none' : ''
                            }`}
                            aria-label="Página siguiente"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-2">
                        {desktopPages.map((_, pageIndex) => (
                            <button
                                key={`page-${pageIndex}`}
                                type="button"
                                onClick={() => setCurrentPageIndex(pageIndex)}
                                className={`h-2.5 w-2.5 rounded-full ${
                                    currentPageIndex === pageIndex
                                        ? 'bg-primary'
                                        : 'bg-base-300'
                                }`}
                                aria-label={`Ir a la página ${pageIndex + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    )
}

export default ProductCarousel
