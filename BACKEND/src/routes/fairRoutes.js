import express from 'express'
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js'
import {
    openFair,
    createTransfer,
    getCurrentFair,
    getFairMovements,
} from '../controllers/fairControllers.js'

const router = express.Router()

// Feria (paso 67c-1): solo administrador, con la sesión de la tienda. Los
// vendedores no mueven stock: el token de ventas no lleva userId, así que
// authenticate lo rechaza, y su cookie (path /api/sales) ni siquiera se
// envía a estas rutas
router.use(authenticate, requireAdmin)

router.post('/', openFair)
router.get('/current', getCurrentFair)
router.post('/:fairId/transfers', createTransfer)
router.get('/:fairId/movements', getFairMovements)

export default router
