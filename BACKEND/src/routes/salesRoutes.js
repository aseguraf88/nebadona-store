import express from 'express'
import {
    salesLogin,
    salesLogout,
    salesMe,
} from '../controllers/salesAuthControllers.js'
import { requireSeller } from '../middleware/salesAuthMiddleware.js'

const router = express.Router()

// App de ventas de la feria (paso 67b). Sin authLimiter: ese límite es
// por IP, y los dos celulares de la feria comparten IP. El login tiene
// su propio límite por email + IP en la base (salesAuthControllers.js);
// el límite general de app.js sigue valiendo para todas estas rutas
router.post('/login', salesLogin)
router.post('/logout', salesLogout)
router.get('/me', requireSeller, salesMe)

export default router
