import express from 'express'
import { authenticate } from '../middleware/authMiddleware.js'
import { createWhatsAppOrder } from '../controllers/orderControllers.js'

const router = express.Router()

// Ruta para generar el pedido por WhatsApp
router.post('/whatsapp', createWhatsAppOrder)

export default router
