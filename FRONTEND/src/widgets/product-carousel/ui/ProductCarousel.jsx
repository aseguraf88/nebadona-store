import { useEffect, useMemo, useState } from 'react'
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

        return () => {
            mediaQuery.removeEventListener('change', handleChange)
        }
    }, [])

    return isMdUp
}

const ProductCarousel = ({ products = [] }) => {
    const isMdUp = useIsMdUp()
    const [currentPageIndex, setCurrentPageIndex] = useState(0)

    const itemsPerPage = isMdUp ? DESKTOP_ITEMS_PER_PAGE : MOBILE_ITEMS_PER_PAGE

    const pages = useMemo(
        () => chunkProducts(products, itemsPerPage),
        [itemsPerPage, products],
    )

    const totalPaginas = pages.length

    useEffect(() => {
        if (totalPaginas === 0) {
            setCurrentPageIndex(0)
            return
        }

        if (currentPageIndex > totalPaginas - 1) {
            setCurrentPageIndex(totalPaginas - 1)
        }
    }, [currentPageIndex, totalPaginas])

    const hasPrevPage = currentPageIndex > 0
    const hasNextPage = currentPageIndex < totalPaginas - 1
    const currentProducts = pages[currentPageIndex] || []

    return (
        <section className="w-full">
            <div
                className={
                    isMdUp
                        ? `grid grid-cols-4 grid-rows-1 gap-4`
                        : `grid grid-cols-2 gap-4`
                }
            >
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

            {totalPaginas > 0 && (
                <>
                    <div className="mt-6 flex items-center justify-center gap-4">
                        <button
                            type="button"
                            onClick={() =>
                                setCurrentPageIndex((prev) => prev - 1)
                            }
                            className={`rounded-full border border-base-300 p-2 transition-opacity ${
                                !hasPrevPage
                                    ? 'opacity-40 pointer-events-none'
                                    : ''
                            }`}
                            aria-label="Página anterior"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setCurrentPageIndex((prev) => prev + 1)
                            }
                            className={`rounded-full border border-base-300 p-2 transition-opacity ${
                                !hasNextPage
                                    ? 'opacity-40 pointer-events-none'
                                    : ''
                            }`}
                            aria-label="Página siguiente"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-2">
                        {pages.map((_, pageIndex) => (
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
