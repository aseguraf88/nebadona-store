import { createContext, useState, useEffect } from 'react'
import { useContext } from 'react'
import { useUser } from '../../user/model/UserContext'
import {
    addToCartService,
    getCartService,
    updateCartService,
    removeFromCartService,
    clearCartService,
} from '../../cart/api/cartServices'
import { toast } from 'react-hot-toast'

export const CartContext = createContext({})

export const CartContextProvider = ({ children }) => {
    const [cart, setCart] = useState([])
    const [total, setTotal] = useState(0)
    const [itemsQuantity, setItemsQuantity] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    const {
        getUserId,
        isAuthenticated,
        loading: userLoading,
        userInfo,
    } = useUser()

    const isDev = import.meta.env.DEV
    const logError = (...args) => {
        if (isDev) console.error(...args)
    }

    // --------------------------------------------------------
    // FUNCIONES DE ALMACENAMIENTO LOCAL (INVITADOS)
    // --------------------------------------------------------
    const loadLocalCart = () => {
        try {
            const localCart = localStorage.getItem('cart')
            return localCart ? JSON.parse(localCart) : []
        } catch (error) {
            logError('Error al cargar carrito local:', error)
            return []
        }
    }

    const saveLocalCart = (cartItems) => {
        try {
            localStorage.setItem('cart', JSON.stringify(cartItems))
        } catch (error) {
            logError('Error al guardar carrito local:', error)
        }
    }

    // --------------------------------------------------------
    // SINCRONIZACIÓN Y CARGA DE CARRITO
    // --------------------------------------------------------
    const loadCart = async () => {
        if (isAuthenticated()) {
            try {
                setLoading(true)
                const userId = getUserId()
                const response = await getCartService(userId)

                // Transformar los datos del backend al formato unificado del frontend
                const cartItems =
                    response.cart?.products?.map((item) => {
                        const v = item.productId.variants?.find(
                            (variant) => variant.sku === item.sku,
                        )
                        return {
                            _id: item.productId._id,
                            name: item.productId.name,
                            sku: item.sku,
                            size: v?.size || '',
                            baseColor: v?.baseColor || '',
                            price: v?.price ?? item.productId.price,
                            stock: v?.stock ?? 0,
                            imageUrl: item.productId.imageUrl,
                            description: item.productId.description,
                            quantity: item.quantity,
                            // 🔥 BLINDAJE DE METADATOS DESDE BACKEND
                            product_category:
                                item.productId.product_category ||
                                item.productId.category ||
                                'Sin categoría',
                            variants: item.productId.variants,
                        }
                    }) ?? []

                setCart(cartItems)
            } catch (error) {
                const localCart = loadLocalCart()
                setCart(localCart)
            } finally {
                setLoading(false)
            }
        } else {
            const localCart = loadLocalCart()
            setCart(localCart)
            setLoading(false) // Asegurar que el loading se apague para invitados
        }
    }

    const syncCartWithBackend = async () => {
        const localCart = loadLocalCart()
        if (localCart.length > 0 && isAuthenticated()) {
            try {
                setLoading(true)
                const userId = getUserId()

                // Agregar cada producto del carrito local al backend
                for (const item of localCart) {
                    try {
                        await addToCartService(userId, item._id, item.quantity)
                    } catch (error) {
                        logError(
                            `Error al sincronizar producto ${item.name}:`,
                            error,
                        )
                    }
                }

                localStorage.removeItem('cart')
                await loadCart()
            } catch (error) {
                logError('Error al sincronizar carrito:', error)
            } finally {
                setLoading(false)
            }
        }
    }

    // --------------------------------------------------------
    // LISTENERS DE EFECTOS (LOGIN & TOTALES)
    // --------------------------------------------------------
    useEffect(() => {
        if (userLoading) return

        if (userInfo?.id) {
            ;(async () => {
                try {
                    const localCart = loadLocalCart()
                    if (localCart.length > 0) {
                        await syncCartWithBackend()
                    } else {
                        await loadCart()
                    }
                } catch (error) {
                    logError(
                        'Error al sincronizar/cargar carrito tras login',
                        error,
                    )
                }
            })()
        } else {
            try {
                setCart(loadLocalCart())
                setLoading(false)
            } catch (error) {
                logError('Error al cargar carrito local tras logout', error)
            }
        }
    }, [userInfo?.id, userLoading])

    useEffect(() => {
        const newTotal = cart.reduce(
            (acc, item) => acc + item.price * (item.quantity || 1),
            0,
        )
        setTotal(newTotal)

        const newItemsQuantity = cart.reduce(
            (acc, item) => acc + (item.quantity || 1),
            0,
        )
        setItemsQuantity(newItemsQuantity)
    }, [cart])

    // --------------------------------------------------------
    // ACCIONES DEL CARRITO (AÑADIR, QUITAR, ACTUALIZAR, LIMPIAR)
    // --------------------------------------------------------
    const addToCart = async (product, quantity = 1, variant = null) => {
        if (!variant) {
            toast.error('Selecciona una variante antes de agregar al carrito')
            return
        }
        const sku = variant.sku

        if (isAuthenticated()) {
            try {
                setLoading(true)
                const userId = getUserId()
                await addToCartService(userId, product._id, sku, quantity)
                await loadCart()
            } catch (error) {
                logError('Error al agregar al carrito:', error)
                toast.error(
                    error.message || 'Error al agregar producto al carrito',
                )
            } finally {
                setLoading(false)
            }
        } else {
            try {
                const currentCart = [...cart]
                const existingIndex = currentCart.findIndex(
                    (item) => item._id === product._id && item.sku === sku,
                )

                // 🔥 BLINDAJE DE METADATOS PARA INVITADOS LOCALES
                const resolvedCategory =
                    product.product_category ||
                    product.category ||
                    'Sin categoría'

                const productToSave = {
                    ...product,
                    product_category: resolvedCategory,
                    sku,
                    size: variant.size || '',
                    baseColor: variant.baseColor || '',
                    price: variant.price ?? product.price,
                    stock: variant.stock,
                    quantity,
                }

                if (existingIndex > -1) {
                    const newQty = currentCart[existingIndex].quantity + quantity
                    if (newQty > variant.stock) {
                        toast.error(`Solo hay ${variant.stock} unidades disponibles`)
                        return
                    }
                    currentCart[existingIndex].quantity = newQty
                    currentCart[existingIndex].product_category =
                        resolvedCategory
                    currentCart[existingIndex].sku = sku
                } else {
                    if (quantity > variant.stock) {
                        toast.error(`Solo hay ${variant.stock} unidades disponibles`)
                        return
                    }
                    currentCart.push(productToSave)
                }

                setCart(currentCart)
                saveLocalCart(currentCart)
            } catch (error) {
                logError('Error al agregar al carrito local:', error)
                toast.error('Error al agregar producto al carrito')
            }
        }
    }

    const removeFromCart = async (productId, sku) => {
        if (isAuthenticated()) {
            try {
                setLoading(true)
                const userId = getUserId()
                await removeFromCartService(userId, productId, sku)
                await loadCart()
            } catch (error) {
                logError('Error al eliminar del carrito:', error)
                toast.error(
                    error.message || 'Error al eliminar producto del carrito',
                )
            } finally {
                setLoading(false)
            }
        } else {
            try {
                const currentCart = cart.filter(
                    (item) => !(item._id === productId && item.sku === sku),
                )
                setCart(currentCart)
                saveLocalCart(currentCart)
            } catch (error) {
                logError('Error al eliminar del carrito local:', error)
                toast.error('Error al eliminar producto del carrito')
            }
        }
    }

    const updateQuantity = async (productId, sku, newQuantity) => {
        if (newQuantity < 1) {
            toast.error('La cantidad debe ser al menos 1')
            return
        }

        if (isAuthenticated()) {
            try {
                setLoading(true)
                const userId = getUserId()
                await updateCartService(userId, productId, sku, newQuantity)
                await loadCart()
            } catch (error) {
                logError('Error al actualizar cantidad:', error)
                toast.error(error.message || 'Error al actualizar cantidad')
            } finally {
                setLoading(false)
            }
        } else {
            try {
                const existing = cart.find(
                    (item) => item._id === productId && item.sku === sku,
                )
                if (existing && newQuantity > existing.stock) {
                    toast.error(`Solo hay ${existing.stock} unidades disponibles`)
                    return
                }
                const currentCart = cart.map((item) =>
                    item._id === productId && item.sku === sku
                        ? { ...item, quantity: newQuantity }
                        : item,
                )
                setCart(currentCart)
                saveLocalCart(currentCart)
            } catch (error) {
                logError('Error al actualizar cantidad local:', error)
                toast.error('Error al actualizar cantidad')
            }
        }
    }

    const clearCart = async () => {
        if (isAuthenticated()) {
            try {
                setLoading(true)
                const userId = getUserId()
                await clearCartService(userId)
                setCart([])
            } catch (error) {
                logError('Error al limpiar carrito:', error)
                toast.error(error.message || 'Error al limpiar carrito')
            } finally {
                setLoading(false)
            }
        } else {
            try {
                setCart([])
                saveLocalCart([])
            } catch (error) {
                logError('Error al limpiar carrito local:', error)
                toast.error('Error al limpiar carrito')
            }
        }
    }

    // --------------------------------------------------------
    // MANEJO DE MODAL
    // --------------------------------------------------------
    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)

    return (
        <CartContext.Provider
            value={{
                cart,
                total,
                itemsQuantity,
                isModalOpen,
                loading,
                addToCart,
                removeFromCart,
                clearCart,
                openModal,
                closeModal,
                updateQuantity,
                loadCart,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)
