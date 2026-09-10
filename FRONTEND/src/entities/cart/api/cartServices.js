import axios from 'axios'

// Configuración base de axios para el carrito
const API_URL = import.meta.env.VITE_BACKEND_URL + 'cart'

// Configurar axios para incluir cookies en las peticiones
axios.defaults.withCredentials = true

// Servicio para agregar producto al carrito
export const addToCartService = async (userId, productId, sku, quantity = 1) => {
    try {
        const response = await axios.post(`${API_URL}/add`, {
            userId,
            productId,
            sku,
            quantity,
        })
        return response.data
    } catch (error) {
        throw new Error(
            error.response?.data?.message ||
                'Error al agregar producto al carrito',
        )
    }
}

// Servicio para obtener el carrito del usuario
export const getCartService = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/get/${userId}`)
        return response.data
    } catch (error) {
        throw new Error(
            error.response?.data?.message || 'Error al obtener el carrito',
        )
    }
}

// Servicio para actualizar la cantidad de un producto en el carrito
export const updateCartService = async (userId, productId, sku, quantity) => {
    try {
        const response = await axios.put(`${API_URL}/update/${userId}`, {
            productId,
            sku,
            quantity,
        })
        return response.data
    } catch (error) {
        throw new Error(
            error.response?.data?.message || 'Error al actualizar el carrito',
        )
    }
}

// Servicio para eliminar un producto del carrito
export const removeFromCartService = async (userId, productId, sku) => {
    try {
        const response = await axios.delete(
            `${API_URL}/removeProduct/${userId}`,
            {
                data: { productId, sku },
            },
        )
        return response.data
    } catch (error) {
        throw new Error(
            error.response?.data?.message ||
                'Error al eliminar producto del carrito',
        )
    }
}

// Servicio para limpiar todo el carrito
export const clearCartService = async (userId) => {
    try {
        const response = await axios.delete(`${API_URL}/clear/${userId}`)
        return response.data
    } catch (error) {
        throw new Error(
            error.response?.data?.message || 'Error al limpiar el carrito',
        )
    }
}

// Servicio para obtener el total del carrito
export const getCartTotalService = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/total/${userId}`)
        return response.data
    } catch (error) {
        throw new Error(
            error.response?.data?.message ||
                'Error al obtener el total del carrito',
        )
    }
}
