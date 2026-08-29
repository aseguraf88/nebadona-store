import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom' // 🔥 NUEVO: La herramienta de teletransportación
import { CgTrash } from 'react-icons/cg'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../../entities/cart'

const CartDrawer = () => {
    const {
        cart,
        closeModal,
        isModalOpen,
        itemsQuantity,
        total,
        updateQuantity,
        removeFromCart,
        loading,
    } = useCart()

    const navigate = useNavigate()

    // 🔥 NUEVO: Estado para saber si el componente ya está montado en el navegador
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const formatPrice = (amount) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
        }).format(amount || 0)
    }

    const handleProductNavigation = (productId) => {
        navigate(`/product/${productId}`)
        if (window.innerWidth < 768) {
            closeModal()
        }
    }

    // Manejo de cierre por teclado y bloqueo de scroll
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') closeModal()
        }

        if (isModalOpen) {
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [isModalOpen, closeModal])

    // Si aún no se monta en el cliente, no renderizamos nada
    if (!mounted) return null

    // 🔥 NUEVO: Usamos createPortal para inyectar el Drawer directamente en el <body>
    return createPortal(
        <div
            // Usamos pointer-events en lugar de invisible para no matar la animación
            className={`fixed inset-0 z-[9999] flex justify-end ${
                isModalOpen ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
        >
            {/* OVERLAY (Fondo difuminado) */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
                    isModalOpen ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={closeModal}
            />

            {/* DRAWER PANEL (El cajón deslizable) */}
            <div
                // duration-300 = velocidad perfecta. ease-out = frena suavemente al llegar.
                className={`relative flex flex-col h-[100dvh] w-full max-w-md sm:max-w-sm md:max-w-md bg-base-100 shadow-2xl transform transition-transform duration-300 ease-out ${
                    isModalOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* CABECERA FIJA */}
                <header className="flex items-center justify-between border-b border-base-200 px-6 py-5 bg-base-100">
                    <h2 className="text-lg font-bold uppercase tracking-widest text-base-content flex items-center gap-2">
                        Tu Carrito
                        <span className="badge badge-primary badge-sm">
                            {itemsQuantity}
                        </span>
                    </h2>
                    <button
                        type="button"
                        onClick={closeModal}
                        className="btn btn-circle btn-ghost btn-sm hover:bg-base-200"
                        aria-label="Cerrar carrito"
                    >
                        ✕
                    </button>
                </header>

                {/* CUERPO SCROLLEABLE */}
                <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    {loading ? (
                        <div className="flex h-full flex-col items-center justify-center space-y-4">
                            <span className="loading loading-spinner loading-lg text-primary" />
                            <p className="text-sm font-medium text-base-content/60 uppercase tracking-widest">
                                Actualizando...
                            </p>
                        </div>
                    ) : cart.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center space-y-6 opacity-70">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-24 w-24 text-base-content/20"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                            </svg>
                            <p className="text-lg font-medium text-base-content">
                                Tu carrito está vacío
                            </p>
                            <button
                                onClick={closeModal}
                                className="btn btn-outline btn-primary rounded-full px-8"
                            >
                                Seguir comprando
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {cart.map((item) => {
                                const quantity = Number(item.quantity || 1)
                                const unitPrice = Number(item.price || 0)

                                return (
                                    <div
                                        key={item._id}
                                        className="flex gap-4 group"
                                    >
                                        <div
                                            onClick={() =>
                                                handleProductNavigation(
                                                    item._id,
                                                )
                                            }
                                            className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-base-200 bg-base-200 cursor-pointer group-hover:border-primary/50 transition-colors"
                                        >
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            />
                                        </div>

                                        <div className="flex flex-1 flex-col justify-between">
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    <h3
                                                        onClick={() =>
                                                            handleProductNavigation(
                                                                item._id,
                                                            )
                                                        }
                                                        className="text-sm font-bold text-base-content line-clamp-2 leading-tight cursor-pointer hover:text-primary transition-colors"
                                                    >
                                                        {item.name}
                                                    </h3>
                                                    <p className="mt-1 text-xs text-base-content/60">
                                                        {formatPrice(unitPrice)}{' '}
                                                        c/u
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        removeFromCart(item._id)
                                                    }
                                                    disabled={loading}
                                                    className="text-base-content/40 hover:text-error transition-colors p-1"
                                                >
                                                    <CgTrash size={20} />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center border border-base-300 rounded-lg h-8 w-24 bg-base-100 overflow-hidden shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item._id,
                                                                quantity - 1,
                                                            )
                                                        }
                                                        disabled={
                                                            loading ||
                                                            quantity <= 1
                                                        }
                                                        className="flex-1 h-full hover:bg-base-200 text-base-content/70 font-medium disabled:opacity-30"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="flex-1 text-center text-sm font-semibold">
                                                        {quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item._id,
                                                                quantity + 1,
                                                            )
                                                        }
                                                        disabled={
                                                            loading ||
                                                            quantity >=
                                                                (item.stock ||
                                                                    999)
                                                        }
                                                        className="flex-1 h-full hover:bg-base-200 text-base-content/70 font-medium disabled:opacity-30"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <p className="text-sm font-bold text-base-content">
                                                    {formatPrice(
                                                        unitPrice * quantity,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </main>

                {/* PIE FIJO */}
                {cart.length > 0 && !loading && (
                    <footer className="border-t border-base-200 bg-base-100 p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold uppercase tracking-widest text-base-content/70">
                                Subtotal
                            </span>
                            <span className="text-xl font-extrabold text-base-content">
                                {formatPrice(total)}
                            </span>
                        </div>
                        <p className="text-xs text-base-content/50 text-center mb-4">
                            Los impuestos y gastos de envío se calculan en el
                            checkout.
                        </p>
                        <Link
                            to="/checkout"
                            onClick={closeModal}
                            className="btn btn-primary w-full h-14 rounded-xl text-sm uppercase tracking-widest font-bold shadow-lg hover:shadow-xl"
                        >
                            Solicitar pedido
                        </Link>
                    </footer>
                )}
            </div>
        </div>,
        document.body,
    )
}

export default CartDrawer
