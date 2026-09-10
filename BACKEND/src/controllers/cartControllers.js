import CartModel from '../models/CartModel.js'
import ProductModel from '../models/ProductModel.js' // Tenemos que validar que el producto exista

export const addToCart = async (req, res) => {
    try {
        const userId = req.user?._id || req.body.userId
        const { productId, sku, quantity = 1 } = req.body

        if (!userId) {
            return res.status(400).json({ message: 'El userId es requerido' })
        }

        // Validaciones
        if (!productId) {
            return res
                .status(400)
                .json({ message: 'El productId es requerido' })
        }

        if (!sku) {
            return res.status(400).json({ message: 'El sku de la variante es requerido' })
        }

        if (quantity < 1) {
            return res
                .status(400)
                .json({ message: 'La cantidad debe ser al menos de 1' })
        }

        // Verificar que el producto exista
        const product = await ProductModel.findById(productId)

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' })
        }

        // Buscar la variante exacta por sku y validar stock
        const variant = product.variants?.find((v) => v.sku === sku)
        if (!variant) {
            return res.status(404).json({ message: 'Variante no encontrada' })
        }
        if (variant.stock < quantity) {
            return res.status(400).json({
                message: `Solo hay ${variant.stock} unidades disponibles`,
            })
        }

        // Buscar carrito del usuario
        let cart = await CartModel.findOne({ userId })

        if (cart) {
            // Dedupe por productId + sku (no solo productId)
            const productIndex = cart.products.findIndex(
                (p) => p.productId.toString() === productId && p.sku === sku
            )

            if (productIndex > -1) {
                const newQty = cart.products[productIndex].quantity + quantity
                if (newQty > variant.stock) {
                    return res.status(400).json({
                        message: `Solo hay ${variant.stock} unidades disponibles`,
                    })
                }
                cart.products[productIndex].quantity = newQty
            } else {
                cart.products.push({ productId, sku, quantity })
            }
        } else {
            // Si no existe el carrito
            cart = new CartModel({
                userId,
                products: [{ productId, sku, quantity }],
            })
        }

        // GUARDAR EL CARRITO DE COMPRAS
        await cart.save()

        // OPCIONAL
        await cart.populate('products.productId')

        // DEVOLVEMOS EL CARRITO ACTUALIZA
        res.status(200).json({
            message: 'Producto agregado al carrito',
            cart,
        })
    } catch (error) {
        console.error('Error addToCart:', error)
        res.status(500).json({
            message: 'Error al agregar producto al carrito',
            error: error.message,
        })
    }
}

export const getCart = async (req, res) => {
    try {
        const { userId } = req.params

        const cart = await CartModel.findOne({ userId }).populate({
            path: 'products.productId',
        })

        if (cart) {
            res.status(200).json({
                message: 'Carrito obtenido con éxito',
                cart,
            })
        } else {
            res.status(404).json({ message: 'Carrito no encontrado' })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor al obtener el carrito',
            error: error.message,
        })
    }
}

export const updateCart = async (req, res) => {
    try {
        const { userId } = req.params
        const { productId, sku, quantity } = req.body
        console.log('UPDATE CART', productId, sku, quantity)

        const cart = await CartModel.findOne({ userId })

        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' })
        }

        const productIndex = cart.products.findIndex(
            (p) => p.productId.toString() === productId && p.sku === sku
        )

        if (productIndex > -1) {
            const product = await ProductModel.findById(productId)

            if (!product) {
                return res.status(404).json({
                    message: 'Producto no encontrado',
                })
            }

            const variant = product.variants?.find((v) => v.sku === sku)
            if (!variant) {
                return res.status(404).json({ message: 'Variante no encontrada' })
            }

            // Verificar que la cantidad no exceda el stock disponible
            if (quantity > variant.stock) {
                return res.status(400).json({
                    message: `Solo hay ${variant.stock} unidades disponibles`,
                })
            }

            cart.products[productIndex].quantity = quantity

            await cart.save()

            res.status(200).json({
                message: 'Carrito actualizado con éxito',
                cart,
            })
        } else {
            res.status(404).json({
                message: 'Producto no encontrado en el carrito',
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor al actualizar el carrito',
            error: error.message,
        })
    }
}

export const removeProductFromCart = async (req, res) => {
    try {
        const { userId } = req.params
        const { productId, sku } = req.body

        // Validar que se proporcionó el producId
        if (!userId) {
            return res.status(400).json({ message: 'El userId es requerido' })
        }

        // Validar que el carrito existe
        const cart = await CartModel.findOne({ userId })

        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' })
        }

        // Buscar el indice del producto en el carrito
        const productIndex = cart.products.findIndex(
            (p) => p.productId.toString() === productId && p.sku === sku
        )

        // Verificar si el producto existe en el carrito
        if (productIndex > -1) {
            // Eliminar el producto del carrito
            cart.products.splice(productIndex, 1)

            // Guardad cambios en el carrito
            await cart.save()

            // Devolver el carrito actualizado
            res.status(200).json({
                message: 'Producto eliminado del carrito con éxito',
                cart,
            })
        } else {
            res.status(404).json({
                message: 'Producto no encontrado en el carrito',
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor al eliminar el producto del carrito',
        })
    }
}

export const clearCart = async (req, res) => {
    try {
        const { userId } = req.params

        const cart = await CartModel.findOne({ userId })

        if (cart) {
            cart.products = []
            await cart.save()
            res.status(200).json({
                message: 'Carrito vaciado con éxito',
                cart,
            })
        } else {
            res.status(404).json({
                message: 'Carrito no encontrado',
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor al eliminar un producto',
        })
    }
}

export const getCartTotal = async (req, res) => {
    try {
        const userId = req.user?._id || req.params.userId

        if (!userId) {
            return res.status(400).json({
                message: 'El userId es requerido',
            })
        }

        const cart = await CartModel.findOne({ userId }).populate({
            path: 'products.productId',
        })

        if (!cart) {
            return res.status(404).json({
                message: 'Carrito no encontrado',
            })
        }

        const total = cart.products.reduce((acc, item) => {
            const variant = item.productId?.variants?.find((v) => v.sku === item.sku)
            const price = variant?.price ?? item.productId?.price ?? 0
            return acc + price * item.quantity
        }, 0)

        res.status(200).json({
            message: 'Total obtenido con éxito',
            total,
        })
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor al obtener el total',
            error: error.message,
        })
    }
}
