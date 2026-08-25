import express from 'express'
import {
    createProduct,
    getProductById,
    getAllProducts,
    getColorFamilies,
    updateProduct,
    deleteProduct,
} from '../controllers/productsControllers.js'
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

// Rutas públicas
router.get('/', getAllProducts)
router.get('/color-families', getColorFamilies)
router.get('/:id', getProductById)

// Rutas protegidas (sólo administradores pueden modificar productos)
router.post('/', authenticate, requireAdmin, createProduct)
router.put('/:id', authenticate, requireAdmin, updateProduct)
router.delete('/:id', authenticate, requireAdmin, deleteProduct)

export default router
