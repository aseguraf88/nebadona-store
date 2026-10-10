import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ADD_TO_CART_LABELS, ADD_TO_CART_CLASSES } from '../../../entities/cart'

// Franja fija inferior de la ficha bajo 1024 px, con el precio y "Agregar".
// Aparece cuando el botón "Agregar" real (target) no está a la vista, antes
// o después de él, y se oculta cuando sí lo está. Usa la misma instancia de
// useAddToCartFeedback que el botón real (feedback): "Listo" y el freno del
// doble clic son uno solo para los dos. Mientras se ve, escribe su alto en
// --sticky-bar-h de <html>: el botón de WhatsApp y el footer lo suman para
// no quedar tapados. Va con un portal en <body>, como el carrito, para que
// fixed sea siempre respecto de la pantalla

// Parte del botón real que tiene que verse entre el header y la franja para
// que cuente como visible
const VISIBLE_RATIO = 0.9

const formatCLP = (amount) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount)

const StickyAddToCartBar = ({
    target,
    feedback,
    selectedHasStock,
    price,
    compareAtPrice,
}) => {
    const barRef = useRef(null)
    const [show, setShow] = useState(false)
    // Alto del header sticky (marquesina y navbar) y de la franja, en px
    const [insets, setInsets] = useState(null)

    // Se miden antes de pintar y otra vez si cambian (rotar el celular,
    // abrir el buscador mobile); solo se actualiza si cambió algún valor
    useLayoutEffect(() => {
        const bar = barRef.current
        const header = document.querySelector('header')
        if (!bar) return undefined
        const measure = () => {
            const top = header?.offsetHeight ?? 0
            const bottom = bar.offsetHeight
            setInsets((prev) =>
                prev && prev.top === top && prev.bottom === bottom
                    ? prev
                    : { top, bottom },
            )
        }
        measure()
        const resizeObserver = new ResizeObserver(measure)
        resizeObserver.observe(bar)
        if (header) resizeObserver.observe(header)
        return () => resizeObserver.disconnect()
    }, [])

    // El botón real cuenta como visible solo si el 90 % queda entre el
    // header y la franja: uno que asoma detrás de la franja no cuenta. Se
    // rearma si cambia el botón (otra ficha) o cambian los altos
    useEffect(() => {
        if (!target || !insets) return undefined
        const intersectionObserver = new IntersectionObserver(
            ([entry]) => setShow(entry.intersectionRatio < VISIBLE_RATIO),
            {
                rootMargin: `-${insets.top}px 0px -${insets.bottom}px 0px`,
                threshold: [0, VISIBLE_RATIO],
            },
        )
        intersectionObserver.observe(target)
        return () => intersectionObserver.disconnect()
    }, [target, insets])

    useEffect(() => {
        document.documentElement.style.setProperty(
            '--sticky-bar-h',
            show && insets ? `${insets.bottom}px` : '0px',
        )
    }, [show, insets])

    // Al salir de la ficha (o si el producto se agota) no queda la variable
    useEffect(
        () => () => document.documentElement.style.removeProperty('--sticky-bar-h'),
        [],
    )

    return createPortal(
        <div
            ref={barRef}
            inert={!show}
            className={`fixed inset-x-0 bottom-0 z-40 border-t border-base-content/10 bg-base-100 px-4 pt-3 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.08)] transition-transform duration-200 motion-reduce:transition-none ${
                show ? 'translate-y-0' : 'translate-y-[calc(100%_+_16px)]'
            }`}
        >
            <div className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold leading-tight text-base-content">
                        {formatCLP(price)}
                    </p>
                    {compareAtPrice > 0 && (
                        <p className="text-xs text-base-content/40 line-through">
                            {formatCLP(compareAtPrice)}
                        </p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => feedback.trigger()}
                    disabled={!selectedHasStock}
                    aria-disabled={feedback.isBusy}
                    className={`btn h-12 px-8 rounded-2xl text-sm uppercase tracking-widest font-bold border-none ${ADD_TO_CART_CLASSES.transition} ${
                        !selectedHasStock
                            ? ADD_TO_CART_CLASSES.soldOut
                            : feedback.status === 'added'
                              ? ADD_TO_CART_CLASSES.added
                              : 'btn-primary shadow-lg'
                    }`}
                >
                    {!selectedHasStock
                        ? ADD_TO_CART_LABELS.soldOut
                        : feedback.status === 'added'
                          ? `✓ ${ADD_TO_CART_LABELS.added}`
                          : ADD_TO_CART_LABELS.idle}
                </button>
            </div>
        </div>,
        document.body,
    )
}

export default StickyAddToCartBar
