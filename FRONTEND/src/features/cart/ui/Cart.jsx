import { useEffect, useRef, useState } from 'react'
import { HiOutlineShoppingBag } from 'react-icons/hi'
import CartDrawer from '../../../features/cart/ui/CartDrawer'
import { useCart } from '../../../entities/cart'

const Cart = () => {
    const { itemsQuantity, openModal } = useCart()

    const [isBouncing, setIsBouncing] = useState(false)
    const [modalPosition, setModalPosition] = useState({ top: 24, left: 24 })

    const buttonRef = useRef(null)
    const previousItemsQuantity = useRef(itemsQuantity)

    // Efecto sutil: Hace que el número rojo "palpite" cuando agregas algo
    useEffect(() => {
        if (
            itemsQuantity > 0 &&
            itemsQuantity > previousItemsQuantity.current
        ) {
            setIsBouncing(true)
            const timeout = setTimeout(() => {
                setIsBouncing(false)
            }, 400)
            return () => clearTimeout(timeout)
        }
        previousItemsQuantity.current = itemsQuantity
    }, [itemsQuantity])

    // Lógica para abrir tu modal/cajón de carrito
    const handleViewCartClick = () => {
        const rect = buttonRef.current?.getBoundingClientRect()
        const panelWidth = 360

        if (rect) {
            const left = Math.max(
                16,
                Math.min(rect.left, window.innerWidth - panelWidth - 16),
            )

            setModalPosition({
                top: rect.bottom + 8,
                left,
            })
        }

        document.activeElement.blur()
        openModal()
    }
    return (
        <>
            <div className="relative inline-flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        {/* El número rojo con su animación sutil */}
                        {itemsQuantity > 0 && (
                            <span
                                className={`absolute -top-1 -right-1 z-10 badge badge-secondary badge-sm ${
                                    isBouncing ? 'animate-badge-bounce' : ''
                                }`}
                            >
                                {itemsQuantity}
                            </span>
                        )}

                        <button
                            ref={buttonRef}
                            type="button"
                            onClick={handleViewCartClick}
                            // 👇 Fondo limpio sin hover de color, solo Mini-Zoom suave
                            className="h-10 w-10 flex items-center justify-center rounded-full text-base-content transition-transform duration-300 hover:scale-110 outline-none cursor-pointer"
                            aria-label={`Ver carrito con ${itemsQuantity} productos`}
                        >
                            <HiOutlineShoppingBag className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            <CartDrawer />
        </>
    )
}

export default Cart
