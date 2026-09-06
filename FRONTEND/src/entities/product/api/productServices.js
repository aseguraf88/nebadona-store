// src/entities/product/api/productServices.js
import axios from 'axios'

const API_URL = import.meta.env.VITE_BACKEND_URL + 'products'
const PRODUCT_CATEGORIES_API_URL =
    import.meta.env.VITE_BACKEND_URL + 'product-categories'
const DESIGN_THEMES_API_URL = import.meta.env.VITE_BACKEND_URL + 'design-themes'
const FRANCHISE_NAMES_API_URL =
    import.meta.env.VITE_BACKEND_URL + 'franchise-names'

// ¡ESTA ES LA LÍNEA CLAVE PARA LAS COOKIES GLOBALES!
axios.defaults.withCredentials = true

const productServices = {
    getProducts: async (queryString = '') => {
        // Axios sumará el filtro al final de la URL si es que se lo envías
        const response = await axios.get(`${API_URL}${queryString}`)
        return response.data
    },
    getProductById: async (id) => {
        const response = await axios.get(`${API_URL}/${id}`)
        return response.data
    },
    createProduct: async (cleanData) => {
        // Axios ya sabe que lleva cookies gracias al default de arriba
        const response = await axios.post(API_URL, cleanData)
        return response
    },
    updateProduct: async (id, cleanData) => {
        const response = await axios.put(`${API_URL}/${id}`, cleanData)
        return response
    },
    deleteProduct: async (id) => {
        const response = await axios.delete(`${API_URL}/${id}`)
        return response
    },

    // --- CATEGORÍAS ---
    getProductCategories: async () => {
        const response = await axios.get(PRODUCT_CATEGORIES_API_URL)
        return response.data
    },
    createProductCategory: async (data) => {
        const response = await axios.post(PRODUCT_CATEGORIES_API_URL, data)
        return response
    },
    updateProductCategory: async (id, data) => {
        const response = await axios.put(
            `${PRODUCT_CATEGORIES_API_URL}/${id}`,
            data,
        )
        return response
    },
    deleteProductCategory: async (id) => {
        const response = await axios.delete(
            `${PRODUCT_CATEGORIES_API_URL}/${id}`,
        )
        return response
    },

    // --- TEMAS ---
    getDesignThemes: async () => {
        const response = await axios.get(DESIGN_THEMES_API_URL)
        return response.data
    },
    createDesignTheme: async (data) => {
        const response = await axios.post(DESIGN_THEMES_API_URL, data)
        return response
    },
    updateDesignTheme: async (id, data) => {
        const response = await axios.put(`${DESIGN_THEMES_API_URL}/${id}`, data)
        return response
    },
    deleteDesignTheme: async (id) => {
        const response = await axios.delete(`${DESIGN_THEMES_API_URL}/${id}`)
        return response
    },

    // --- FRANQUICIAS ---
    getFranchiseNames: async () => {
        const response = await axios.get(FRANCHISE_NAMES_API_URL)
        return response.data
    },
    createFranchiseName: async (data) => {
        const response = await axios.post(FRANCHISE_NAMES_API_URL, data)
        return response
    },
    updateFranchiseName: async (id, data) => {
        const response = await axios.put(
            `${FRANCHISE_NAMES_API_URL}/${id}`,
            data,
        )
        return response
    },
    deleteFranchiseName: async (id) => {
        const response = await axios.delete(`${FRANCHISE_NAMES_API_URL}/${id}`)
        return response
    },
}

export default productServices
