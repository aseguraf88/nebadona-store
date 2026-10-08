import express from 'express'
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js'
import {
    createWhatsAppOrder,
    getAllOrders,
    getOrdersSummary,
    updateOrderStatus,
} from '../controllers/orderControllers.js'

const router = express.Router()

// Pública — la usa el cliente al cerrar el checkout
router.post('/whatsapp', createWhatsAppOrder)

// Administración — solo admin
router.get('/', authenticate, requireAdmin, getAllOrders)
// Antes de las rutas con /:id: si no, 'summary' se leería como un id
router.get('/summary', authenticate, requireAdmin, getOrdersSummary)
router.patch('/:id/status', authenticate, requireAdmin, updateOrderStatus)

export default router
