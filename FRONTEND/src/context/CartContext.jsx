import { createContext, useState, useEffect } from 'react'
import { useContext } from 'react'
import { useUser } from './UserContext'
import {
    addToCartService,
    getCartService,
    updateCartService,
    removeFromCartService,
    clearCartService,
} from '../services/cartServices'
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

    // Función para cargar el carrito desde localStorage
    const loadLocalCart = () => {
        try {
            const localCart = localStorage.getItem('cart')
            return localCart ? JSON.parse(localCart) : []
        } catch (error) {
            logError('Error al cargar carrito local:', error)
            return []
        }
    }

    // Función para guardar el carrito en localStorage
    const saveLocalCart = (cartItems) => {
        try {
            localStorage.setItem('cart', JSON.stringify(cartItems))
        } catch (error) {
            logError('Error al guardar carrito local:', error)
        }
    }

    // Función para cargar el carrito (backend o localStorage)
    const loadCart = async () => {
        if (isAuthenticated()) {
            // Usuario autenticado: cargar desde backend
            try {
                setLoading(true)
                const userId = getUserId()
                const response = await getCartService(userId)

                // Transformar los datos del backend al formato del frontend
                const cartItems =
                    response.cart?.products?.map((item) => ({
                        _id: item.productId._id,
                        name: item.productId.name,
                        price: item.productId.price,
                        imageUrl: item.productId.imageUrl,
                        description: item.productId.description,
                        stock: item.productId.stock,
                        quantity: item.quantity,
                    })) || []

                setCart(cartItems)
            } catch (error) {
                // Si falla el backend, cargar desde localStorage como respaldo
                const localCart = loadLocalCart()
                setCart(localCart)
            } finally {
                setLoading(false)
            }
        } else {
            // Usuario no autenticado: cargar desde localStorage
            const localCart = loadLocalCart()
            setCart(localCart)
        }
    }

    // Función para sincronizar carrito local con el backend
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

                // Limpiar localStorage después de sincronizar
                localStorage.removeItem('cart')

                // Recargar carrito desde el backend
                await loadCart()
            } catch (error) {
                logError('Error al sincronizar carrito:', error)
            } finally {
                setLoading(false)
            }
        }
    }

    // Reaccionar directamente a cambios en userInfo (login/logout)
    useEffect(() => {
        // Esperar a que UserContext termine de verificar la sesión
        if (userLoading) return

        // Si el usuario inició sesión (userInfo.id aparece), sincronizar o cargar
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
            // Si el usuario hace logout, mostrar carrito local
            try {
                setCart(loadLocalCart())
                setLoading(false)
            } catch (error) {
                logError('Error al cargar carrito local tras logout', error)
            }
        }
    }, [userInfo?.id, userLoading])

    // Calcular total y cantidad de items cuando cambia el carrito
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

    // Añadir producto al carrito
    const addToCart = async (product, quantity = 1) => {
        if (isAuthenticated()) {
            // Usuario autenticado: usar backend
            try {
                setLoading(true)
                const userId = getUserId()
                await addToCartService(userId, product._id, quantity)

                // Recargar el carrito después de agregar
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
            // Usuario no autenticado: usar localStorage
            try {
                const currentCart = [...cart]
                const existingIndex = currentCart.findIndex(
                    (item) => item._id === product._id,
                )

                if (existingIndex > -1) {
                    // Producto ya existe: actualizar cantidad
                    currentCart[existingIndex].quantity += quantity
                } else {
                    // Nuevo producto: agregarlo
                    currentCart.push({ ...product, quantity })
                }

                setCart(currentCart)
                saveLocalCart(currentCart)
            } catch (error) {
                logError('Error al agregar al carrito local:', error)
                toast.error('Error al agregar producto al carrito')
            }
        }
    }

    // Eliminar producto del carrito
    const removeFromCart = async (productId) => {
        if (isAuthenticated()) {
            // Usuario autenticado: usar backend
            try {
                setLoading(true)
                const userId = getUserId()
                await removeFromCartService(userId, productId)

                // Recargar el carrito después de eliminar
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
            // Usuario no autenticado: usar localStorage
            try {
                const currentCart = cart.filter(
                    (item) => item._id !== productId,
                )
                setCart(currentCart)
                saveLocalCart(currentCart)
            } catch (error) {
                logError('Error al eliminar del carrito local:', error)
                toast.error('Error al eliminar producto del carrito')
            }
        }
    }

    // Actualizar cantidad de producto
    const updateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) {
            toast.error('La cantidad debe ser al menos 1')
            return
        }

        if (isAuthenticated()) {
            // Usuario autenticado: usar backend
            try {
                setLoading(true)
                const userId = getUserId()
                await updateCartService(userId, productId, newQuantity)

                // Recargar el carrito después de actualizar
                await loadCart()
            } catch (error) {
                logError('Error al actualizar cantidad:', error)
                toast.error(error.message || 'Error al actualizar cantidad')
            } finally {
                setLoading(false)
            }
        } else {
            // Usuario no autenticado: usar localStorage
            try {
                const currentCart = cart.map((item) =>
                    item._id === productId
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

    // Limpiar carrito
    const clearCart = async () => {
        if (isAuthenticated()) {
            // Usuario autenticado: usar backend
            try {
                setLoading(true)
                const userId = getUserId()
                await clearCartService(userId)

                // Limpiar el estado local
                setCart([])
            } catch (error) {
                logError('Error al limpiar carrito:', error)
                toast.error(error.message || 'Error al limpiar carrito')
            } finally {
                setLoading(false)
            }
        } else {
            // Usuario no autenticado: usar localStorage
            try {
                setCart([])
                saveLocalCart([])
            } catch (error) {
                logError('Error al limpiar carrito local:', error)
                toast.error('Error al limpiar carrito')
            }
        }
    }

    // Abrir modal
    const openModal = () => setIsModalOpen(true)
    // Cerrar modal
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
