import express from 'express'
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js'
import {
    createWhatsAppOrder,
    getAllOrders,
    updateOrderStatus,
} from '../controllers/orderControllers.js'

const router = express.Router()

// Pública — la usa el cliente al cerrar el checkout
router.post('/whatsapp', createWhatsAppOrder)

// Administración — solo admin
router.get('/', authenticate, requireAdmin, getAllOrders)
router.patch('/:id/status', authenticate, requireAdmin, updateOrderStatus)

export default router
