import axios from 'axios'

const API_URL = import.meta.env.VITE_BACKEND_URL + 'orders'

axios.defaults.withCredentials = true

export const getOrders = async () => {
    try {
        const response = await axios.get(API_URL)
        return response.data
    } catch (error) {
        throw new Error(
            error.response?.data?.message || 'Error al obtener las órdenes',
        )
    }
}

// Números del inicio del dashboard: ventas de hoy y del mes y pedidos por
// revisar (GET /api/orders/summary, solo admin)
export const getOrdersSummary = async () => {
    try {
        const response = await axios.get(`${API_URL}/summary`)
        return response.data
    } catch (error) {
        throw new Error(
            error.response?.data?.message || 'Error al obtener el resumen de ventas',
        )
    }
}

export const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await axios.patch(`${API_URL}/${orderId}/status`, {
            status,
        })
        return response.data
    } catch (error) {
        throw new Error(
            error.response?.data?.message ||
                'Error al actualizar el estado de la orden',
        )
    }
}
