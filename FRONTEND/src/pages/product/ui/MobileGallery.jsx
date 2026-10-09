import { useEffect, useRef, useState } from 'react'

// Galería de la ficha bajo 1024 px (una columna): fotos a todo el ancho con
// deslizamiento nativo y contador "1/N". ProductPage la monta con
// key={product._id}: al cambiar de producto arranca en la primera foto
const MobileGallery = ({ images, productName }) => {
    const scrollRef = useRef(null)
    const frameRef = useRef(0)
    const [index, setIndex] = useState(0)
    const total = images.length

    useEffect(() => () => cancelAnimationFrame(frameRef.current), [])

    // Cada foto mide el ancho exacto del contenedor y el encaje es
    // obligatorio: redondear da la foto exacta
    const handleScroll = () => {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = requestAnimationFrame(() => {
            const el = scrollRef.current
            if (!el || el.clientWidth === 0) return
            const next = Math.round(el.scrollLeft / el.clientWidth)
            setIndex(Math.max(0, Math.min(total - 1, next)))
        })
    }

    if (total === 0) {
        return (
            <div className="-mx-4 sm:-mx-6 aspect-square bg-base-200/50 flex items-center justify-center text-base-content/50">
                Sin imagen
            </div>
        )
    }

    return (
        <div role="region" aria-label="Fotos del producto" className="relative -mx-4 sm:-mx-6">
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                tabIndex={0}
                className="flex aspect-square w-full overflow-x-auto snap-x snap-mandatory overscroll-x-contain scrollbar-hide bg-base-200/50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
            >
                {images.map((img, idx) => (
                    <div key={idx} className="w-full h-full shrink-0 snap-start snap-always">
                        <img
                            src={img}
                            alt={total > 1 ? `${productName}, foto ${idx + 1} de ${total}` : productName}
                            loading={idx === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                            draggable={false}
                            className="w-full h-full object-contain"
                        />
                    </div>
                ))}
            </div>
            {total > 1 && (
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold tabular-nums text-white"
                >
                    {index + 1}/{total}
                </span>
            )}
        </div>
    )
}

export default MobileGallery
