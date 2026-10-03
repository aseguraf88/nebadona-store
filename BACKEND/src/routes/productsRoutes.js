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
router.get('/:id', getProductById)

// Rutas protegidas (sólo administradores)
router.post('/', authenticate, requireAdmin, createProduct)
// Export CSV: trae borradores y stock, así que es solo admin. El dashboard lo
// descarga con axios (cookie de sesión), no con un link (InventoryPage.jsx)
router.get('/export/csv', authenticate, requireAdmin, exportProductsCsv)

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
