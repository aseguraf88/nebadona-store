import {
    useState,
    useEffect,
    useCallback,
    createContext,
    useContext,
} from 'react'
import { normalizeProductColorData } from '../../../shared/lib/colors/colorUtils'
import productServices from '../api/productServices'

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

    // ==========================================
    // GETTERS
    // ==========================================
    const getProducts = useCallback(async () => {
        try {
            const data = await productServices.getProducts()
            setProducts(data)
        } catch (error) {
            setError(error.message || 'Error al obtener los productos')
        } finally {
            setProductsLoading(false)
        }
    }, [])

    const getProductCategories = useCallback(async () => {
        try {
            const data = await productServices.getProductCategories()
            setProductCategories(data)
            return data
        } catch (error) {
            setError(error.message || 'Error al obtener categorias')
            return []
        }
    }, [])

    const getDesignThemes = useCallback(async () => {
        try {
            const data = await productServices.getDesignThemes()
            setDesignThemes(data)
            return data
        } catch (error) {
            setError(error.message || 'Error al obtener temas')
            return []
        }
    }, [])

    const getFranchiseNames = useCallback(async () => {
        try {
            const data = await productServices.getFranchiseNames()
            setFranchiseNames(data)
            return data
        } catch (error) {
            setError(error.message || 'Error al obtener franquicias')
            return []
        }
    }, [])

    const getProductById = useCallback(async (id) => {
        setProductLoading(true)
        setProduct({})
        try {
            const data = await productServices.getProductById(id)
            setProduct(data)
        } catch (error) {
            setError(error.message || 'Error al obtener el producto')
        } finally {
            setProductLoading(false)
        }
    }, [])

    // ==========================================
    // MUTACIONES DE PRODUCTOS (CRUD)
    // ==========================================
    const updateProduct = useCallback(async (id, data) => {
        setProductsLoading(true)
        setProductLoading(true)

        try {
            // ¡Pasamos la data directamente sin botar nada a la basura!
            const response = await productServices.updateProduct(id, data)

            if (response.status === 200) {
                setProduct(response.data)
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

    const createProduct = useCallback(async (data) => {
        setProductLoading(true)

        try {
            // ¡Pasamos la data directamente!
            const response = await productServices.createProduct(data)

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
            // AQUÍ DELEGAMOS A PRODUCT SERVICES
            const response = await productServices.deleteProduct(id)

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
            setError(error.message || 'Error al eliminar el producto')
            return { success: false, message: 'Error al eliminar el producto' }
        } finally {
            setProductsLoading(false)
        }
    }, [])

    // ==========================================
    // MUTACIONES DE CATEGORÍAS/TEMAS/FRANQUICIAS
    // ==========================================
    const createProductCategory = useCallback(async (name) => {
        const normalizedName = name?.trim()
        if (!normalizedName)
            return { success: false, message: 'El nombre es requerido.' }

        try {
            const response = await productServices.createProductCategory({
                name: normalizedName,
            })
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
        if (!normalizedName)
            return { success: false, message: 'El nombre es requerido.' }

        try {
            const response = await productServices.updateProductCategory(id, {
                name: normalizedName,
            })
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
            const response = await productServices.deleteProductCategory(id)
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
        if (!normalizedName)
            return { success: false, message: 'El nombre es requerido.' }

        try {
            const response = await productServices.createDesignTheme({
                name: normalizedName,
            })
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
        if (!normalizedName)
            return { success: false, message: 'El nombre es requerido.' }

        try {
            const response = await productServices.updateDesignTheme(id, {
                name: normalizedName,
            })
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
            const response = await productServices.deleteDesignTheme(id)
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
        if (!normalizedName)
            return { success: false, message: 'El nombre es requerido.' }

        try {
            const response = await productServices.createFranchiseName({
                name: normalizedName,
            })
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
        if (!normalizedName)
            return { success: false, message: 'El nombre es requerido.' }

        try {
            const response = await productServices.updateFranchiseName(id, {
                name: normalizedName,
            })
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
            const response = await productServices.deleteFranchiseName(id)
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

    const normalize = (text = '') =>
        text
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '')
            .toLowerCase()

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

export const useProduct = () => useContext(ProductContext)
