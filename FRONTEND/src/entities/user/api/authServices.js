import axios from 'axios'

// Configuración base de datos
const API_URL = import.meta.env.VITE_BACKEND_URL + 'auth'
// http://localhost:3001/api/auth/register
// http://localhost:3001/api/auth/profile
// http://localhost:3001/api/auth/login

// Para incluir las cookies en la peticiones
axios.defaults.withCredentials = true

// http://localhost:3001/api/auth/register
export const getProfileService = async () => {
    try {
        const response = await axios.get(`${API_URL}/profile`)
        return response.data
    } catch (error) {
        throw new Error('Error al obtener perfil.')
    }
}

export const loginService = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/login`, data, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
        })

        return { success: true, data: response.data }
    } catch (error) {
        return {
            success: false,
            message:
                error.response?.data?.message || 'Error al iniciar sesión.',
        }
    }
}

export const registerService = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/register`, data, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
        })

        return { success: true, data: response.data }
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Error al registrarse.',
        }
    }
}

export const logoutService = async () => {
    try {
        const response = await axios.post(`${API_URL}/logout`)
        return response.data
    } catch (error) {
        throw new Error(
            error.response?.data?.message || 'Error al cerrar la sesión.',
        )
    }
}
