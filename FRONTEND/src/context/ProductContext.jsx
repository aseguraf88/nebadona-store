import {
    useState,
    useEffect,
    useCallback,
    createContext,
    useContext,
} from 'react'
import axios from 'axios'
import { normalizeProductColorData } from '../utils/colorUtils'

axios.defaults.withCredentials = true

const API_URL = import.meta.env.VITE_BACKEND_URL + 'products'
const PRODUCT_CATEGORIES_API_URL =
    import.meta.env.VITE_BACKEND_URL + 'product-categories'
const DESIGN_THEMES_API_URL = import.meta.env.VITE_BACKEND_URL + 'design-themes'
const FRANCHISE_NAMES_API_URL =
    import.meta.env.VITE_BACKEND_URL + 'franchise-names'
export const ProductContext = createContext({})

export const ProductContextProvider = ({ children }) => {
    const [products, setProducts] = useState([])
    const [productsLoading, setProductsLoading] = useState(true)
    const [product, setProduct] = useState({})
    const [productLoading, setProductLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [productCategories, setProductCategories] = useState([])
    const [designThemes, setDesignThemes] = useState([])
    const [franchiseNames, setFranchiseNames] = useState([])

    // Función para obtener productos
    const getProducts = useCallback(async () => {
        try {
            const response = await axios.get(API_URL)
            setProducts(response.data)
        } catch (error) {
            setError(error.message || 'Error al obtener los productos')
        } finally {
            setProductsLoading(false)
        }
    }, [])

    const getProductCategories = useCallback(async () => {
        try {
            const response = await axios.get(PRODUCT_CATEGORIES_API_URL)
            setProductCategories(response.data)
            return response.data
        } catch (error) {
            setError(error.message || 'Error al obtener categorias')
            return []
        }
    }, [])

    const getDesignThemes = useCallback(async () => {
        try {
            const response = await axios.get(DESIGN_THEMES_API_URL)
            setDesignThemes(response.data)
            return response.data
        } catch (error) {
            setError(error.message || 'Error al obtener temas')
            return []
        }
    }, [])

    const getFranchiseNames = useCallback(async () => {
        try {
            const response = await axios.get(FRANCHISE_NAMES_API_URL)
            setFranchiseNames(response.data)
            return response.data
        } catch (error) {
            setError(error.message || 'Error al obtener franquicias')
            return []
        }
    }, [])

    // Función para obtener un producto por id
    const getProductById = useCallback(async (id) => {
        setProductLoading(true)
        setProduct({})
        try {
            const response = await axios.get(`${API_URL}/${id}`)
            setProduct(response.data)
        } catch (error) {
            setError(error.message || 'Error al obtener el producto')
        } finally {
            setProductLoading(false)
        }
    }, [])

    // Funcion para actualizar un producto
    const updateProduct = useCallback(async (id, data) => {
        const sanitizedImageUrls = (data.imageUrls || [])
            .filter(Boolean)
            .slice(0, 6)
        const colorData = normalizeProductColorData({
            color: data.color,
            colors: data.colors,
            source: 'manual',
        })

        const cleanData = {
            name: data.name,
            description: data.description,
            price: Number(data.price),
            stock: Number(data.stock),
            ...(data.sku ? { sku: data.sku } : {}),
            imageUrl: data.imageUrl || sanitizedImageUrls[0] || '',
            imageUrls: sanitizedImageUrls,
            color: colorData.color,
            colors: colorData.colors,
            compareAtPrice:
                data.compareAtPrice === null || data.compareAtPrice === ''
                    ? null
                    : Number(data.compareAtPrice),
            tags: Array.isArray(data.tags) ? data.tags : [],
            featured: Boolean(data.featured),
            popular: Boolean(data.popular),
            isActive: data.isActive ?? true,
            size: data.size || '',
            sock_type: data.sock_type || '',
            product_category: data.product_category || '',
            design_theme: data.design_theme || '',
            franchise_name: data.franchise_name || '',
        }

        try {
            const response = await axios.put(API_URL + `/${id}`, cleanData, {
                withCredentials: true,
            })

            if (response.status === 200) {
                // Actualizar el producto individual
                setProduct(response.data)
                // Actualizar el producto en la lista de productos
                setProducts((prevProducts) =>
                    prevProducts.map((p) => (p._id === id ? response.data : p)),
                )

                return {
                    success: true,
                    message: 'Producto actualizado correctamente',
                    product: response.data,
                }
            }
        } catch (error) {
            setError(error.message || 'Error al actualizar el producto')
            return {
                success: false,
                message: 'Error al actualizar el producto',
            }
        } finally {
            setProductsLoading(false)
            setProductLoading(false)
        }
    }, [])

    // Funcion para crear un producto
    const createProduct = useCallback(async (data) => {
        const sanitizedImageUrls = (data.imageUrls || [])
            .filter(Boolean)
            .slice(0, 6)
        const colorData = normalizeProductColorData({
            color: data.color,
            colors: data.colors,
            source: 'manual',
        })

        const cleanData = {
            name: data.name,
            description: data.description,
            price: Number(data.price),
            stock: Number(data.stock),
            ...(data.sku ? { sku: data.sku } : {}),
            imageUrl: data.imageUrl || sanitizedImageUrls[0] || '',
            imageUrls: sanitizedImageUrls,
            color: colorData.color,
            colors: colorData.colors,
            compareAtPrice:
                data.compareAtPrice === null || data.compareAtPrice === ''
                    ? null
                    : Number(data.compareAtPrice),
            tags: Array.isArray(data.tags) ? data.tags : [],
            featured: Boolean(data.featured),
            popular: Boolean(data.popular),
            isActive: data.isActive ?? true,
            size: data.size || '',
            sock_type: data.sock_type || '',
            product_category: data.product_category || '',
            design_theme: data.design_theme || '',
            franchise_name: data.franchise_name || '',
        }

        try {
            const response = await axios.post(API_URL, cleanData, {
                withCredentials: true,
            })

            if (response.status === 201) {
                setProducts((prevProducts) => [
                    ...prevProducts,
                    response.data.product,
                ])

                return {
                    success: true,
                    message: response.data.message,
                    product: response.data.product,
                }
            }
        } catch (error) {
            setError(error.message || 'Error al crear el producto')
            return {
                success: false,
                message: error.message || 'Error al crear el producto',
            }
        } finally {
            setProductLoading(false)
        }
    }, [])

    const deleteProduct = useCallback(async (id) => {
        try {
            const response = await axios.delete(API_URL + `/${id}`, {
                withCredentials: true,
            })

            if (response.status === 200) {
                setProducts((prevProducts) =>
                    prevProducts.filter((p) => p._id !== id),
                )

                return {
                    success: true,
                    message: 'Producto eliminado correctamente',
                }
            }
        } catch (error) {
            setError(error.message || 'Error al eliminar el prducto')
            return {
                success: false,
                message: 'Error al eliminar el producto',
            }
        } finally {
            setProductsLoading(false)
        }
    }, [])

    const createProductCategory = useCallback(async (name) => {
        const normalizedName = name?.trim()
        if (!normalizedName) {
            return { success: false, message: 'El nombre es requerido.' }
        }

        try {
            const response = await axios.post(
                PRODUCT_CATEGORIES_API_URL,
                { name: normalizedName },
                { withCredentials: true },
            )

            if (response.status === 201) {
                setProductCategories((prev) => [
                    ...prev,
                    response.data.productCategory,
                ])

                return {
                    success: true,
                    message: response.data.message,
                    item: response.data.productCategory,
                }
            }
        } catch (error) {
            return {
                success: false,
                message:
                    error?.response?.data?.message ||
                    'Error al crear la categoria.',
            }
        }

        return { success: false, message: 'No fue posible crear la categoria.' }
    }, [])

    const updateProductCategory = useCallback(async (id, name) => {
        const normalizedName = name?.trim()
        if (!normalizedName) {
            return { success: false, message: 'El nombre es requerido.' }
        }

        try {
            const response = await axios.put(
                `${PRODUCT_CATEGORIES_API_URL}/${id}`,
                { name: normalizedName },
                { withCredentials: true },
            )

            if (response.status === 200) {
                setProductCategories((prev) =>
                    prev.map((item) =>
                        item._id === id ? response.data : item,
                    ),
                )

                return {
                    success: true,
                    message: 'Categoria actualizada exitosamente.',
                    item: response.data,
                }
            }
        } catch (error) {
            return {
                success: false,
                message:
                    error?.response?.data?.message ||
                    'Error al actualizar la categoria.',
            }
        }

        return {
            success: false,
            message: 'No fue posible actualizar la categoria.',
        }
    }, [])

    const deleteProductCategory = useCallback(async (id) => {
        try {
            const response = await axios.delete(
                `${PRODUCT_CATEGORIES_API_URL}/${id}`,
                { withCredentials: true },
            )

            if (response.status === 200) {
                setProductCategories((prev) =>
                    prev.filter((item) => item._id !== id),
                )

                return {
                    success: true,
                    message: 'Categoria eliminada exitosamente.',
                }
            }
        } catch (error) {
            return {
                success: false,
                message:
                    error?.response?.data?.message ||
                    'Error al eliminar la categoria.',
            }
        }

        return {
            success: false,
            message: 'No fue posible eliminar la categoria.',
        }
    }, [])

    const createDesignTheme = useCallback(async (name) => {
        const normalizedName = name?.trim()
        if (!normalizedName) {
            return { success: false, message: 'El nombre es requerido.' }
        }

        try {
            const response = await axios.post(
                DESIGN_THEMES_API_URL,
                { name: normalizedName },
                { withCredentials: true },
            )

            if (response.status === 201) {
                setDesignThemes((prev) => [...prev, response.data.designTheme])

                return {
                    success: true,
                    message: response.data.message,
                    item: response.data.designTheme,
                }
            }
        } catch (error) {
            return {
                success: false,
                message:
                    error?.response?.data?.message || 'Error al crear el tema.',
            }
        }

        return { success: false, message: 'No fue posible crear el tema.' }
    }, [])

    const updateDesignTheme = useCallback(async (id, name) => {
        const normalizedName = name?.trim()
        if (!normalizedName) {
            return { success: false, message: 'El nombre es requerido.' }
        }

        try {
            const response = await axios.put(
                `${DESIGN_THEMES_API_URL}/${id}`,
                { name: normalizedName },
                { withCredentials: true },
            )

            if (response.status === 200) {
                setDesignThemes((prev) =>
                    prev.map((item) =>
                        item._id === id ? response.data : item,
                    ),
                )

                return {
                    success: true,
                    message: 'Tema actualizado exitosamente.',
                    item: response.data,
                }
            }
        } catch (error) {
            return {
                success: false,
                message:
                    error?.response?.data?.message ||
                    'Error al actualizar el tema.',
            }
        }

        return { success: false, message: 'No fue posible actualizar el tema.' }
    }, [])

    const deleteDesignTheme = useCallback(async (id) => {
        try {
            const response = await axios.delete(
                `${DESIGN_THEMES_API_URL}/${id}`,
                {
                    withCredentials: true,
                },
            )

            if (response.status === 200) {
                setDesignThemes((prev) =>
                    prev.filter((item) => item._id !== id),
                )

                return {
                    success: true,
                    message: 'Tema eliminado exitosamente.',
                }
            }
        } catch (error) {
            return {
                success: false,
                message:
                    error?.response?.data?.message ||
                    'Error al eliminar el tema.',
            }
        }

        return { success: false, message: 'No fue posible eliminar el tema.' }
    }, [])

    const createFranchiseName = useCallback(async (name) => {
        const normalizedName = name?.trim()
        if (!normalizedName) {
            return { success: false, message: 'El nombre es requerido.' }
        }

        try {
            const response = await axios.post(
                FRANCHISE_NAMES_API_URL,
                { name: normalizedName },
                { withCredentials: true },
            )

            if (response.status === 201) {
                setFranchiseNames((prev) => [
                    ...prev,
                    response.data.franchiseName,
                ])

                return {
                    success: true,
                    message: response.data.message,
                    item: response.data.franchiseName,
                }
            }
        } catch (error) {
            return {
                success: false,
                message:
                    error?.response?.data?.message ||
                    'Error al crear la franquicia.',
            }
        }

        return {
            success: false,
            message: 'No fue posible crear la franquicia.',
        }
    }, [])

    const updateFranchiseName = useCallback(async (id, name) => {
        const normalizedName = name?.trim()
        if (!normalizedName) {
            return { success: false, message: 'El nombre es requerido.' }
        }

        try {
            const response = await axios.put(
                `${FRANCHISE_NAMES_API_URL}/${id}`,
                { name: normalizedName },
                { withCredentials: true },
            )

            if (response.status === 200) {
                setFranchiseNames((prev) =>
                    prev.map((item) =>
                        item._id === id ? response.data : item,
                    ),
                )

                return {
                    success: true,
                    message: 'Franquicia actualizada exitosamente.',
                    item: response.data,
                }
            }
        } catch (error) {
            return {
                success: false,
                message:
                    error?.response?.data?.message ||
                    'Error al actualizar la franquicia.',
            }
        }

        return {
            success: false,
            message: 'No fue posible actualizar la franquicia.',
        }
    }, [])

    const deleteFranchiseName = useCallback(async (id) => {
        try {
            const response = await axios.delete(
                `${FRANCHISE_NAMES_API_URL}/${id}`,
                { withCredentials: true },
            )

            if (response.status === 200) {
                setFranchiseNames((prev) =>
                    prev.filter((item) => item._id !== id),
                )

                return {
                    success: true,
                    message: 'Franquicia eliminada exitosamente.',
                }
            }
        } catch (error) {
            return {
                success: false,
                message:
                    error?.response?.data?.message ||
                    'Error al eliminar la franquicia.',
            }
        }

        return {
            success: false,
            message: 'No fue posible eliminar la franquicia.',
        }
    }, [])

    useEffect(() => {
        getProducts()
        getProductCategories()
        getDesignThemes()
        getFranchiseNames()
    }, [getProducts, getProductCategories, getDesignThemes, getFranchiseNames])

    // Normaliza texto: remueve acentos, espacios y pone en minúsculas
    const normalize = (text = '') =>
        text
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '')
            .toLowerCase()

    // Productos filtrados por búsqueda (client-side)
    const filteredProducts = products.filter((p) => {
        if (!searchQuery) return true
        const name = normalize(p.name || '')
        const q = normalize(searchQuery)
        return name.includes(q)
    })

    const value = {
        product,
        products,
        filteredProducts,
        searchQuery,
        setSearchQuery,
        productCategories,
        designThemes,
        franchiseNames,
        productsLoading,
        productLoading,
        error,
        getProducts,
        getProductCategories,
        getDesignThemes,
        getFranchiseNames,
        createProductCategory,
        updateProductCategory,
        deleteProductCategory,
        createDesignTheme,
        updateDesignTheme,
        deleteDesignTheme,
        createFranchiseName,
        updateFranchiseName,
        deleteFranchiseName,
        getProductById,
        updateProduct,
        createProduct,
        deleteProduct,
    }

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    )
}

// Hook personalizado
export const useProduct = () => useContext(ProductContext)
