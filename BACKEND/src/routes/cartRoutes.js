import express from 'express'
import {
    addToCart,
    getCart,
    updateCart,
    removeProductFromCart,
    clearCart,
    getCartTotal,
} from '../controllers/cartControllers.js'
import { authenticate, requireSelfOrAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

// Rutas que verifican que el usuario accesa solo a su propio carrito
router.get('/get/:userId', authenticate, requireSelfOrAdmin, getCart)
router.get('/total/:userId', authenticate, requireSelfOrAdmin, getCartTotal)
router.put('/update/:userId', authenticate, requireSelfOrAdmin, updateCart)
router.delete('/removeProduct/:userId', authenticate, requireSelfOrAdmin, removeProductFromCart)
router.delete('/clear/:userId', authenticate, requireSelfOrAdmin, clearCart)

// Ruta para agregar al carrito (requiere autenticación)
router.post('/add', authenticate, addToCart)

export default router
