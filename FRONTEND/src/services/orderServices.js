import axios from 'axios'

const API_URL = import.meta.env.VITE_BACKEND_URL + 'orders'

axios.defaults.withCredentials = true

export const createOrder = async (orderData) => {
    try {
        const response = await axios.post(`${API_URL}/create`, orderData)
        return response.data
    } catch (error) {
        throw new Error('Error al crear la orden')
    }
}
