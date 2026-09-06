import express from 'express'
import multer from 'multer'
import {
    createProduct,
    getProductById,
    getAllProducts,
    updateProduct,
    deleteProduct,
    importProductsCsv,
} from '../controllers/productsControllers.js'
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js'
import { exportProductsCsv } from '../controllers/productsControllers.js'

const router = express.Router()

// Configuración de Multer para guardar el archivo en memoria (RAM)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB por CSV
})

// Rutas públicas
router.get('/', getAllProducts)
router.get('/export/csv', exportProductsCsv)
router.get('/:id', getProductById)

// Rutas protegidas (sólo administradores)
router.post('/', authenticate, requireAdmin, createProduct)

// Ruta de importación masiva CSV
router.post(
    '/import',
    authenticate,
    requireAdmin,
    upload.single('file'),
    importProductsCsv
)

router.put('/:id', authenticate, requireAdmin, updateProduct)
router.delete('/:id', authenticate, requireAdmin, deleteProduct)

export default router
