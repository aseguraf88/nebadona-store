import axios from 'axios'

// Feria (paso 67c-1): rutas /api/fair, solo administrador
const API_URL = import.meta.env.VITE_BACKEND_URL + 'fair'

axios.defaults.withCredentials = true

// Error con el mensaje del backend tal cual (400 y 409) y su status. Sin
// status es un fallo de red: el traspaso se puede reintentar con el mismo
// requestId sin duplicarse
const toFairError = (error, fallback) => {
    const wrapped = new Error(error.response?.data?.message || fallback)
    wrapped.status = error.response?.status ?? null
    return wrapped
}

// { fair, stock, totalUnits }; fair es null si no hay una abierta
export const getCurrentFair = async () => {
    try {
        const response = await axios.get(`${API_URL}/current`)
        return response.data
    } catch (error) {
        throw toFairError(error, 'Error al obtener la feria')
    }
}

export const openFair = async (name) => {
    try {
        const response = await axios.post(API_URL, { name })
        return response.data.fair
    } catch (error) {
        throw toFairError(error, 'Error al abrir la feria')
    }
}

// { fair, requestId, replayed, lines }. replayed: true si ese requestId
// ya se había aplicado (responde 200 y no vuelve a aplicar nada)
export const createTransfer = async (fairId, { requestId, lines }) => {
    try {
        const response = await axios.post(`${API_URL}/${fairId}/transfers`, {
            requestId,
            lines,
        })
        return response.data
    } catch (error) {
        throw toFairError(error, 'Error al traspasar a la feria')
    }
}

// { movements, nextBefore }: del más nuevo al más viejo; nextBefore es el
// before de la página siguiente (null si no hay más)
export const getFairMovements = async (fairId, { before, limit = 50 } = {}) => {
    try {
        const response = await axios.get(`${API_URL}/${fairId}/movements`, {
            params: { limit, ...(before ? { before } : {}) },
        })
        return response.data
    } catch (error) {
        throw toFairError(error, 'Error al obtener los movimientos')
    }
}
